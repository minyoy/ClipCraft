import re
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, field_validator

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(value: str) -> str:
    value = value.strip().lower()
    if not value or len(value) > 254 or not EMAIL_RE.match(value):
        raise ValueError("올바른 이메일 형식이 아니에요")
    return value


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    marketing_consent: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    terms_accepted: bool
    marketing_consent: bool = False

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not (2 <= len(value) <= 50):
            raise ValueError("이름은 2~50자여야 해요")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not (8 <= len(value) <= 72):
            raise ValueError("비밀번호는 8~72자여야 해요")
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise ValueError("비밀번호는 영문과 숫자를 포함해야 해요")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = True

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class AuthTokens(BaseModel):
    user: UserOut
    access_token: str
    token_type: Literal["Bearer"] = "Bearer"
    expires_in: int
    refresh_token: str
    refresh_expires_in: Optional[int] = None


PROJECT_FORMATS = {"9:16", "16:9", "1:1"}


class ProjectSummary(BaseModel):
    id: str
    title: str
    status: str
    format: str
    source_duration_seconds: Optional[float]
    exported_duration_seconds: Optional[float]
    scene_count: int
    source_size_bytes: Optional[int]
    starred: bool
    preview_url: Optional[str]
    analysis_progress: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    version: int

    model_config = {"from_attributes": True}


class ProjectCreateRequest(BaseModel):
    title: str
    format: str = "9:16"

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if not (1 <= len(value) <= 100):
            raise ValueError("제목은 1~100자여야 해요")
        return value

    @field_validator("format")
    @classmethod
    def validate_format(cls, value: str) -> str:
        if value not in PROJECT_FORMATS:
            raise ValueError("지원하지 않는 영상 비율이에요")
        return value


class ProjectPatchRequest(BaseModel):
    version: int
    title: Optional[str] = None
    starred: Optional[bool] = None
    format: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not (1 <= len(value) <= 100):
            raise ValueError("제목은 1~100자여야 해요")
        return value

    @field_validator("format")
    @classmethod
    def validate_format(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in PROJECT_FORMATS:
            raise ValueError("지원하지 않는 영상 비율이에요")
        return value


class ProjectDuplicateRequest(BaseModel):
    title: Optional[str] = None


class ProjectRestoreRequest(BaseModel):
    deleted_version: int
