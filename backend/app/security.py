import hashlib
import os
import secrets
from datetime import datetime, timedelta

import bcrypt
import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .envelope import ApiError

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_SECONDS = 900
REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: str) -> str:
    now = datetime.utcnow()
    payload = {"sub": user_id, "iat": now, "exp": now + timedelta(seconds=ACCESS_TOKEN_TTL_SECONDS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as error:
        raise ApiError(401, "UNAUTHORIZED", "토큰이 없거나 만료되었습니다.") from error

    return payload["sub"]


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def issue_refresh_token(db: Session, user_id: str) -> str:
    raw_token = secrets.token_urlsafe(48)
    record = models.RefreshToken(
        user_id=user_id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_TTL_SECONDS),
    )
    db.add(record)
    db.commit()
    return raw_token


def consume_refresh_token(db: Session, raw_token: str) -> models.RefreshToken:
    record = db.query(models.RefreshToken).filter(models.RefreshToken.token_hash == _hash_token(raw_token)).first()
    now = datetime.utcnow()

    if not record or record.revoked_at is not None or record.expires_at < now:
        raise ApiError(401, "UNAUTHORIZED", "리프레시 토큰이 유효하지 않습니다.")

    record.revoked_at = now
    db.add(record)
    db.commit()
    return record


def revoke_refresh_token(db: Session, raw_token: str) -> None:
    record = db.query(models.RefreshToken).filter(models.RefreshToken.token_hash == _hash_token(raw_token)).first()

    if record and record.revoked_at is None:
        record.revoked_at = datetime.utcnow()
        db.add(record)
        db.commit()


def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> models.User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise ApiError(401, "UNAUTHORIZED", "토큰이 없거나 만료되었습니다.")

    user_id = decode_access_token(authorization.split(" ", 1)[1].strip())
    user = db.get(models.User, user_id)

    if not user:
        raise ApiError(401, "UNAUTHORIZED", "토큰이 없거나 만료되었습니다.")

    return user
