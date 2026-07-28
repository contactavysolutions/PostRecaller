"""Glean API — thin router. All logic lives in modules."""
import logging

from fastapi import FastAPI
from pymongo import ASCENDING, DESCENDING
from starlette.middleware.cors import CORSMiddleware

from auth import router as auth_router, seed_admins
from config import client, db
from items import router as items_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("glean")

app = FastAPI(title="Glean API")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(items_router)


@app.get("/api/")
async def root():
    return {"service": "glean", "status": "ok"}


@app.on_event("startup")
async def startup():
    # Indexes at startup.
    await db.users.create_index([("email", ASCENDING)], unique=True)
    await db.users.create_index([("created_at", DESCENDING)])
    await db.items.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    await db.items.create_index([("slug", ASCENDING)], unique=True, sparse=True)
    await db.ai_usage.create_index([("created_at", DESCENDING)])
    await db.debug_logs.create_index([("created_at", ASCENDING)], expireAfterSeconds=604800)
    await seed_admins()
    logger.info("Glean startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()
