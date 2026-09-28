"""AI enrichment via Gemini Flash + cost logging.

Supports direct Google Gemini API (GEMINI_API_KEY) via httpx,
with backward-compatible fallback to emergentintegrations if available.
"""
import asyncio
import json
import logging
import re
import httpx

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None

from config import GEMINI_API_KEY, EMERGENT_LLM_KEY, ENRICH_MODEL, INTENTS, db
from models import utcnow

# Gemini Flash pricing (USD per token) for cost estimation.
_IN_COST = 0.10 / 1_000_000
_OUT_COST = 0.40 / 1_000_000

SYSTEM = (
    "You are PostRecaller's content librarian. Given raw signals scraped from a saved link, "
    "produce a clean, useful catalog entry. Respond with STRICT JSON only, no markdown, "
    "no commentary."
)

PROMPT_TMPL = """Analyze this saved link and return JSON with exactly these keys:
- "title": a concise human title (max 90 chars)
- "summary": 2-3 sentence plain-language summary of what this content is about
- "intent": exactly one of {intents}
- "tags": array of 3-6 short lowercase topic tags (single or two words)
- "author": the creator/author/site name if known, else null

Platform: {platform}
URL: {url}

Signals:
Title: {title}
Description: {description}
Extracted text (may be noisy/truncated):
{text}

Return only the JSON object."""


async def _log_usage(user_id: str, purpose: str, in_tokens: int, out_tokens: int):
    try:
        est = in_tokens * _IN_COST + out_tokens * _OUT_COST
        model_name = ENRICH_MODEL if isinstance(ENRICH_MODEL, str) else ENRICH_MODEL[-1]
        await asyncio.wait_for(
            db.ai_usage.insert_one(
                {
                    "user_id": user_id,
                    "model": model_name,
                    "purpose": purpose,
                    "input_tokens": in_tokens,
                    "output_tokens": out_tokens,
                    "est_cost_usd": round(est, 6),
                    "created_at": utcnow(),
                }
            ),
            timeout=1.5,
        )
    except Exception as e:
        logging.getLogger(__name__).warning("failed to log ai_usage to db: %s", e)


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)
    return json.loads(raw)


async def _call_gemini_api(prompt: str, system_message: str = SYSTEM) -> tuple[str, int, int]:
    """Call Google Gemini REST API directly using httpx."""
    api_key = GEMINI_API_KEY or EMERGENT_LLM_KEY
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY / EMERGENT_LLM_KEY")

    model = ENRICH_MODEL if isinstance(ENRICH_MODEL, str) else ENRICH_MODEL[-1]
    if model.startswith("models/"):
        model = model.replace("models/", "")
    if not model or "gemini-2.0" in model or "gemini-2.5" in model:
        model = "gemini-flash-lite-latest"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_message}],
        },
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        last_err = None
        for attempt in range(3):
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code in (429, 503) and attempt < 2:
                    await asyncio.sleep(1.0 * (attempt + 1))
                    continue
                resp.raise_for_status()
                data = resp.json()

                text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                usage = data.get("usageMetadata", {})
                in_tokens = usage.get("promptTokenCount", len(prompt) // 4)
                out_tokens = usage.get("candidatesTokenCount", len(text_out) // 4)
                return text_out, in_tokens, out_tokens
            except (httpx.HTTPStatusError, httpx.RequestError) as e:
                last_err = e
                if attempt < 2:
                    await asyncio.sleep(1.0 * (attempt + 1))
                else:
                    raise last_err


async def enrich(user_id: str, url: str, signals: dict) -> dict | None:
    """Return {title, summary, intent, tags, author} or None on failure."""
    api_key = GEMINI_API_KEY or EMERGENT_LLM_KEY
    if not api_key:
        return None
    title = signals.get("title") or ""
    description = signals.get("description") or ""
    text = signals.get("text") or ""
    if not (title or description or text):
        return None

    prompt = PROMPT_TMPL.format(
        intents=", ".join(INTENTS),
        platform=signals.get("platform", "web"),
        url=url,
        title=title[:200],
        description=description[:600],
        text=text[:3000],
    )
    try:
        if LlmChat is not None and not GEMINI_API_KEY and EMERGENT_LLM_KEY.startswith("emg_"):
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"enrich-{user_id}",
                system_message=SYSTEM,
            ).with_model("gemini", "gemini-3-flash-preview")
            response = await chat.send_message(UserMessage(text=prompt))
            text_out = response if isinstance(response, str) else str(response)
            in_tokens = len(prompt) // 4
            out_tokens = len(text_out) // 4
        else:
            text_out, in_tokens, out_tokens = await _call_gemini_api(prompt, SYSTEM)

        data = _parse_json(text_out)
        await _log_usage(user_id, "enrichment", in_tokens, out_tokens)

        intent = data.get("intent")
        if intent not in INTENTS:
            intent = "Read Later"
        tags = data.get("tags") or []
        tags = [str(t).strip().lower() for t in tags if str(t).strip()][:6]
        return {
            "title": (data.get("title") or title or url)[:200],
            "summary": (data.get("summary") or description or "")[:1000],
            "intent": intent,
            "tags": tags,
            "author": data.get("author") or signals.get("author"),
        }
    except Exception as e:
        logging.getLogger(__name__).warning("enrichment failed: %s", e)
        return None


async def enrich_note(user_id: str, content: str) -> dict | None:
    """Tag a pure-text personal note."""
    api_key = GEMINI_API_KEY or EMERGENT_LLM_KEY
    if not api_key or not content.strip():
        return None
    prompt = (
        "This is a personal text note. Return STRICT JSON with keys: "
        f'"title" (short), "summary" (1 sentence), "intent" (one of {", ".join(INTENTS)}), '
        '"tags" (3-6 lowercase). Note:\n' + content[:2000]
    )
    try:
        if LlmChat is not None and not GEMINI_API_KEY and EMERGENT_LLM_KEY.startswith("emg_"):
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY, session_id=f"note-{user_id}", system_message=SYSTEM
            ).with_model("gemini", "gemini-3-flash-preview")
            response = await chat.send_message(UserMessage(text=prompt))
            text_out = response if isinstance(response, str) else str(response)
            in_tokens = len(prompt) // 4
            out_tokens = len(text_out) // 4
        else:
            text_out, in_tokens, out_tokens = await _call_gemini_api(prompt, SYSTEM)

        data = _parse_json(text_out)
        await _log_usage(user_id, "note_enrichment", in_tokens, out_tokens)
        intent = data.get("intent") if data.get("intent") in INTENTS else "Read Later"
        tags = [str(t).strip().lower() for t in (data.get("tags") or []) if str(t).strip()][:6]
        return {
            "title": (data.get("title") or content[:60]),
            "summary": (data.get("summary") or ""),
            "intent": intent,
            "tags": tags,
        }
    except Exception as e:
        logging.getLogger(__name__).warning("note enrichment failed: %s", e)
        return None
