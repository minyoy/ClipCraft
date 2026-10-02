import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

API_PREFIX = "/api/v1"


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: list[dict] | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []


def new_request_id() -> str:
    return f"req_{uuid.uuid4().hex[:20]}"


def envelope(data, **meta_extra):
    return {"data": data, "meta": {"request_id": new_request_id(), **meta_extra}}


def envelope_list(data, *, page: int, page_size: int, total: int) -> dict:
    total_pages = ((total + page_size - 1) // page_size) if page_size else 0
    return {
        "data": data,
        "meta": {
            "request_id": new_request_id(),
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    }


def error_body(code: str, message: str, details: list[dict] | None = None) -> dict:
    return {
        "error": {"code": code, "message": message, "details": details or []},
        "meta": {"request_id": new_request_id()},
    }


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(request: Request, exc: ApiError):
        return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        if not request.url.path.startswith(API_PREFIX):
            return JSONResponse(status_code=422, content={"detail": exc.errors()})

        details = [{"field": ".".join(str(part) for part in error["loc"][1:]), "reason": error["msg"]} for error in exc.errors()]
        return JSONResponse(status_code=422, content=error_body("VALIDATION_ERROR", "요청 값이 올바르지 않습니다.", details))
