from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, security
from ..database import get_db
from ..envelope import ApiError, envelope
from ..schemas import (
    AuthTokens,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    SignupRequest,
    UserOut,
)

router = APIRouter(prefix="/api/v1", tags=["auth"])


def _issue_tokens(db: Session, user: models.User) -> AuthTokens:
    return AuthTokens(
        user=UserOut.model_validate(user),
        access_token=security.create_access_token(user.id),
        expires_in=security.ACCESS_TOKEN_TTL_SECONDS,
        refresh_token=security.issue_refresh_token(db, user.id),
        refresh_expires_in=security.REFRESH_TOKEN_TTL_SECONDS,
    )


@router.post("/auth/signup", status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if not payload.terms_accepted:
        raise ApiError(422, "TERMS_NOT_ACCEPTED", "필수 약관에 동의해주세요.")

    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise ApiError(409, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일이에요.")

    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=security.hash_password(payload.password),
        marketing_consent=payload.marketing_consent,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return envelope(_issue_tokens(db, user))


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user or not security.verify_password(payload.password, user.password_hash):
        raise ApiError(401, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.")

    return envelope(_issue_tokens(db, user))


@router.post("/auth/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    record = security.consume_refresh_token(db, payload.refresh_token)
    user = db.get(models.User, record.user_id)

    if not user:
        raise ApiError(401, "UNAUTHORIZED", "리프레시 토큰이 유효하지 않습니다.")

    return envelope(_issue_tokens(db, user))


@router.post("/auth/logout", status_code=204)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    security.revoke_refresh_token(db, payload.refresh_token)


@router.post("/auth/password/forgot", status_code=202)
def forgot_password(payload: ForgotPasswordRequest):
    return envelope({"accepted": True, "message": "계정이 존재하면 비밀번호 재설정 안내를 전송합니다."})


@router.get("/users/me")
def get_me(current_user: models.User = Depends(security.get_current_user)):
    return envelope(UserOut.model_validate(current_user))
