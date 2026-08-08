"""AI enrichment via Gemini 3 Flash (Emergent LLM key) + cost logging."""
import json
import logging
import re

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None  # Emergent SDK not available locally — enrichment will be skipped.
    UserMessage = None

from config import EMERGENT_LLM_KEY, ENRICH_MODEL, INTENTS, db
from models import utcnow

# Rough Gemini Flash pricing (USD per token) for cost estimation.
_IN_COST = 0.075 / 1_000_000
_OUT_COST = 0.30 / 1_000_000

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
    est = in_tokens * _IN_COST + out_tokens * _OUT_COST
    await db.ai_usage.insert_one(
        {
            "user_id": user_id,
            "model": ENRICH_MODEL[1],
            "purpose": purpose,
            "input_tokens": in_tokens,
            "output_tokens": out_tokens,
            "est_cost_usd": round(est, 6),
            "created_at": utcnow(),
        }
    )


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)
    return json.loads(raw)


async def enrich(user_id: str, url: str, signals: dict) -> dict | None:
    """Return {title, summary, intent, tags, author} or None on failure."""
    if not EMERGENT_LLM_KEY or LlmChat is None:
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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"enrich-{user_id}",
            system_message=SYSTEM,
        ).with_model(*ENRICH_MODEL)
        response = await chat.send_message(UserMessage(text=prompt))
        text_out = response if isinstance(response, str) else str(response)
        data = _parse_json(text_out)

        await _log_usage(
            user_id, "enrichment", len(prompt) // 4, len(text_out) // 4
        )

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
    except Exception as e:  # noqa
        import logging

        logging.getLogger(__name__).warning("enrichment failed: %s", e)
        return None


async def enrich_note(user_id: str, content: str) -> dict | None:
    """Tag a pure-text personal note."""
    if not EMERGENT_LLM_KEY or LlmChat is None or not content.strip():
        return None
    prompt = (
        "This is a personal text note. Return STRICT JSON with keys: "
        f'"title" (short), "summary" (1 sentence), "intent" (one of {", ".join(INTENTS)}), '
        '"tags" (3-6 lowercase). Note:\n' + content[:2000]
    )
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY, session_id=f"note-{user_id}", system_message=SYSTEM
        ).with_model(*ENRICH_MODEL)
        response = await chat.send_message(UserMessage(text=prompt))
        text_out = response if isinstance(response, str) else str(response)
        data = _parse_json(text_out)
        await _log_usage(user_id, "note_enrichment", len(prompt) // 4, len(text_out) // 4)
        intent = data.get("intent") if data.get("intent") in INTENTS else "Read Later"
        tags = [str(t).strip().lower() for t in (data.get("tags") or []) if str(t).strip()][:6]
        return {
            "title": (data.get("title") or content[:60]),
            "summary": (data.get("summary") or ""),
            "intent": intent,
            "tags": tags,
        }
    except Exception:
        return None
