import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from config import db

async def main():
    email = "contactavysolutions@gmail.com"
    res = await db.users.update_one(
        {"email": email},
        {"$set": {"is_admin": True}}
    )
    print(f"Updated {email} is_admin=True: matched={res.matched_count}, modified={res.modified_count}")
    user = await db.users.find_one({"email": email})
    print("User now:", user.get("email"), "is_admin:", user.get("is_admin"))

if __name__ == "__main__":
    asyncio.run(main())
