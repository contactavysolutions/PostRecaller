import asyncio
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from ai import enrich, _call_gemini_api
from config import GEMINI_API_KEY, ENRICH_MODEL

async def test():
    print("Testing new key...")
    print("Model:", ENRICH_MODEL)
    try:
        text, in_tok, out_tok = await _call_gemini_api("Return JSON: {\"message\": \"test success\"}")
        print("✅ SUCCESS! Output:", text.strip())
        print("Tokens (in/out):", in_tok, out_tok)
        
        # Test full enrich function
        print("\nTesting full ai.enrich function...")
        res = await enrich(
            "test_user",
            "https://react.dev",
            {"title": "React", "description": "The library for web and native user interfaces", "text": "React lets you build user interfaces."}
        )
        print("✅ FULL ENRICH SUCCESS! Result:")
        print("Title:", res.get("title"))
        print("Summary:", res.get("summary"))
        print("Intent:", res.get("intent"))
        print("Tags:", res.get("tags"))
    except Exception as e:
        print("❌ Error:", type(e), e)

if __name__ == "__main__":
    asyncio.run(test())
