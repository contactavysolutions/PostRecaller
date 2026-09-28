"""Pydantic models with MongoDB-safe ObjectId handling."""
from datetime import datetime, timezone
from typing import Annotated, Any, List, Optional

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field


def _coerce_objectid(v: Any) -> Any:
    if isinstance(v, ObjectId):
        return str(v)
    return v


PyObjectId = Annotated[str, BeforeValidator(_coerce_objectid)]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if not doc:
            return None
        return cls(**doc)

    def to_mongo(self, exclude_none: bool = True) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=exclude_none)
        # Never write a None _id; let Mongo generate it.
        if data.get("_id") is None:
            data.pop("_id", None)
        return data


# ---------------- Users ----------------
class DailyUsage(BaseModel):
    date: str = ""  # YYYY-MM-DD UTC
    ai_enrichments: int = 0
    searches: int = 0


class User(BaseDocument):
    email: EmailStr
    password_hash: str
    plan: str = "free"  # free | pro
    plan_expires_at: Optional[datetime] = None
    is_admin: bool = False
    daily_usage: DailyUsage = Field(default_factory=DailyUsage)
    created_at: datetime = Field(default_factory=utcnow)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    plan: str = "free"
    is_admin: bool = False
    ai_used_today: int = 0
    ai_limit: int = 5
    created_at: Optional[datetime] = None


# ---------------- Items ----------------
class Item(BaseDocument):
    user_id: str
    is_note: bool = False
    original_url: Optional[str] = None
    title: str = ""
    summary: str = ""
    content: str = ""  # note body / extracted text snippet
    platform: str = "web"
    intent: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    author: Optional[str] = None
    thumbnail_url: Optional[str] = None
    embedding: List[float] = Field(default_factory=list)
    enrichment_status: str = "pending"  # enriched | manual | pending | failed
    slug: Optional[str] = None
    is_public: bool = False
    created_at: datetime = Field(default_factory=utcnow)


# ---------------- Request bodies ----------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    invite_token: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=128)


class CreateItemIn(BaseModel):
    url: str


class ItemUpdateIn(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    intent: Optional[str] = None
    content: Optional[str] = None


class CreateCampaignIn(BaseModel):
    name: str
    channel: str = "meta"  # meta | google | tiktok | apple_search | influencer | organic
    spend_usd: float = 0.0
    status: str = "active"  # active | completed | paused
    utm_source: Optional[str] = None
    utm_campaign: Optional[str] = None
    impressions: int = 0
    clicks: int = 0
    notes: Optional[str] = None

