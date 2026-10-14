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
import re
import ipaddress
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
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

# Emergent managed email proxy (constant — never from env)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            code = e.response.json().get("code", "")
        except ValueError:
            code = ""
        if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning(f"Email paused: {code} ({e.response.status_code}): {e.response.json().get('message', '')}")
            raise HTTPException(status_code=503, detail="Email is temporarily unavailable")
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


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

    subject = f"Nowe zapytanie ze strony — {input.name.strip()[:80]}"
    html = (
        '<table role="presentation" width="100%"><tr>'
        '<td style="padding:24px;font-family:Arial,sans-serif;font-size:14px;color:#0A0D14;line-height:1.6">'
        '<p style="margin:0 0 16px">Nowe zapytanie wysłane przez formularz kontaktowy na stronie.</p>'
        f'<p style="margin:0 0 6px"><strong>Imię i nazwisko:</strong> {escape(input.name)}</p>'
        f'<p style="margin:0 0 6px"><strong>E-mail nadawcy:</strong> {escape(input.email)}</p>'
        + (f'<p style="margin:0 0 6px"><strong>Telefon:</strong> {escape(input.phone)}</p>' if input.phone else "")
        + (f'<p style="margin:0 0 6px"><strong>Zakres wsparcia:</strong> {escape(input.service)}</p>' if input.service else "")
        + '<p style="margin:16px 0 6px"><strong>Wiadomość:</strong></p>'
        + f'<p style="margin:0;white-space:pre-wrap">{escape(input.message)}</p>'
        + f'<p style="margin-top:24px;font-size:12px;color:#868C98">Wiadomość wysłana automatycznie przez formularz na stronie {escape(EMAIL_FROM_NAME)}. Nigdy nie prosimy o hasła ani dane kart.</p>'
        "</td></tr></table>"
    )

    email_sent = False
    try:
        await send_email(to=OWNER_EMAIL, subject=subject, html=html)
        email_sent = True
    except HTTPException as e:
        logger.warning(f"Email notification not sent: {e.detail}")
    except Exception as e:
        logger.warning(f"Email notification error: {str(e)}")

    return {"ok": True, "email_sent": email_sent}


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
