"""PostRecaller API — thin router. All logic lives in modules."""
import logging

from fastapi import FastAPI
from pymongo import ASCENDING, DESCENDING
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

from admin import router as admin_router
from auth import router as auth_router, seed_admins
from config import client, db
from items import router as items_router
from rate_limit import limiter
from waitlist import router as waitlist_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("postrecaller")

app = FastAPI(title="PostRecaller API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(items_router)
app.include_router(waitlist_router)
app.include_router(admin_router)


@app.get("/")
@app.get("/api")
@app.get("/api/")
async def root():
    return {"service": "postrecaller", "status": "ok"}


@app.on_event("startup")
async def startup():
    # Indexes at startup.
    try:
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.users.create_index([("created_at", DESCENDING)])
        await db.items.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        await db.items.create_index([("slug", ASCENDING)], unique=True, sparse=True)
        await db.ai_usage.create_index([("created_at", DESCENDING)])
        await db.waitlist.create_index([("email", ASCENDING)], unique=True)
        await db.waitlist.create_index([("created_at", ASCENDING)])
        await db.invites.create_index([("token_hash", ASCENDING)], unique=True)
        await db.invites.create_index([("email", ASCENDING)])
        await db.invites.create_index([("expires_at", ASCENDING)])
        await db.debug_logs.create_index([("created_at", ASCENDING)], expireAfterSeconds=604800)
        await seed_admins()
        logger.info("PostRecaller startup complete")
    except Exception as e:
        logger.warning(f"PostRecaller startup index warning (non-fatal): {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
