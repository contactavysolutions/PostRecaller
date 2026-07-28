"""Waitlist capture for the public landing page."""
import asyncio

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

from config import db
from mailer import send_waitlist_email
from models import utcnow

router = APIRouter(prefix="/api", tags=["waitlist"])


class WaitlistIn(BaseModel):
    email: EmailStr
    source: str | None = None


@router.post("/waitlist")
async def join_waitlist(body: WaitlistIn):
    email = body.email.lower().strip()
    total = await db.waitlist.count_documents({})
    existing = await db.waitlist.find_one({"email": email})
    if existing:
        position = await db.waitlist.count_documents(
            {"created_at": {"$lte": existing["created_at"]}}
        )
        return {"ok": True, "already": True, "position": position, "count": total}

    await db.waitlist.insert_one({"email": email, "source": body.source, "created_at": utcnow()})
    total += 1
    asyncio.create_task(send_waitlist_email(email, total))
    return {"ok": True, "already": False, "position": total, "count": total}


@router.get("/waitlist/count")
async def waitlist_count():
    return {"count": await db.waitlist.count_documents({})}
