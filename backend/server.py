from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Annotated, Optional, List
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import jwt
import bcrypt
import uuid
import logging
from bson import ObjectId

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


class PyObjectId(str):
    pass


AnnotatedPyObjectId = Annotated[str, BeforeValidator(lambda v: str(v))]


class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: AnnotatedPyObjectId = Field(alias="_id", default=None)

    def to_mongo(self):
        d = self.model_dump(by_alias=True, exclude_none=True)
        if d.get("_id") is None:
            d.pop("_id", None)
        return d

    @classmethod
    def from_mongo(cls, doc):
        return cls(**doc)


class User(BaseDocument):
    email: str
    name: str = "Admin"
    role: str = "admin"
    password_hash: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactMessage(BaseDocument):
    name: str
    email: str
    phone: str = ""
    service: str = ""
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": to_oid(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


app = FastAPI()
api_router = APIRouter(prefix="/api")


class LoginInput(BaseModel):
    email: str
    password: str


class ContentInput(BaseModel):
    data: dict


class ContactInput(BaseModel):
    name: str
    email: str
    phone: str = ""
    service: str = ""
    message: str


def to_oid(value):
    try:
        return ObjectId(value)
    except Exception:
        return value


def user_public(user: dict) -> dict:
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request):
    email = input.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until"):
        locked_until = attempt["locked_until"]
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) < locked_until:
            raise HTTPException(status_code=429, detail="Zbyt wiele nieudanych prób. Spróbuj ponownie za 15 minut.")
        await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"attempts": 1}, "$set": {"updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        await db.login_attempts.update_one(
            {"identifier": identifier, "attempts": {"$gte": 5}},
            {"$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=15)}},
        )
        raise HTTPException(status_code=401, detail="Nieprawidłowy e-mail lub hasło")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), user["email"])
    refresh = create_refresh_token(str(user["_id"]))
    response = JSONResponse({"user": user_public(user), "access_token": token})
    set_auth_cookies(response, token, refresh)
    return response


@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse({"ok": True})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response


@api_router.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request)
    return user_public(user)


@api_router.post("/auth/refresh")
async def refresh(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": to_oid(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access = create_access_token(str(user["_id"]), user["email"])
    response = JSONResponse({"user": user_public(user), "access_token": access})
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    return response


@api_router.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": "singleton"})
    return {"data": doc.get("data") if doc else None}


@api_router.put("/content")
async def put_content(input: ContentInput, request: Request):
    await get_current_user(request)
    now = datetime.now(timezone.utc)
    await db.site_content.update_one(
        {"_id": "singleton"},
        {"$set": {"data": input.data, "updated_at": now}},
        upsert=True,
    )
    return {"data": input.data}


@api_router.post("/contact")
async def contact(input: ContactInput):
    msg = ContactMessage(**input.model_dump())
    await db.contact_messages.insert_one(msg.to_mongo())
    return {"ok": True}


@api_router.get("/messages")
async def get_messages(request: Request):
    await get_current_user(request)
    docs = await db.contact_messages.find({}).sort("created_at", -1).to_list(200)
    out = []
    for d in docs:
        m = ContactMessage.from_mongo(d)
        out.append({
            "id": str(m.id),
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "service": m.service,
            "message": m.message,
            "created_at": m.created_at,
        })
    return out


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.contact_messages.create_index("created_at")
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        doc = User(email=ADMIN_EMAIL, password_hash=hash_password(ADMIN_PASSWORD)).to_mongo()
        doc["_id"] = uuid.uuid4().hex
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info(f"Updated admin password hash for {ADMIN_EMAIL}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
