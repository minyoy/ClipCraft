from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import models, security
from ..database import get_db
from ..envelope import ApiError, envelope, envelope_list
from ..schemas import (
    ProjectCreateRequest,
    ProjectDuplicateRequest,
    ProjectPatchRequest,
    ProjectRestoreRequest,
    ProjectSummary,
)

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


def _get_owned_project(db: Session, user: models.User, project_id: str, *, include_deleted: bool = False) -> models.Project:
    project = db.get(models.Project, project_id)

    if not project or project.user_id != user.id or (not include_deleted and project.deleted_at is not None):
        raise ApiError(404, "RESOURCE_NOT_FOUND", "프로젝트를 찾을 수 없습니다.")

    return project


@router.get("")
def list_projects(
    query: str = "",
    sort: str = "updated",
    order: str | None = None,
    status: list[str] | None = Query(default=None),
    starred: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    if page < 1:
        raise ApiError(422, "VALIDATION_ERROR", "page는 1 이상이어야 해요.")
    if not (1 <= page_size <= 100):
        raise ApiError(422, "VALIDATION_ERROR", "page_size는 1~100이어야 해요.")

    filtered = db.query(models.Project).filter(models.Project.user_id == current_user.id, models.Project.deleted_at.is_(None))

    if query:
        filtered = filtered.filter(models.Project.title.ilike(f"%{query}%"))
    if status:
        filtered = filtered.filter(models.Project.status.in_(status))
    if starred is not None:
        filtered = filtered.filter(models.Project.starred == starred)

    sort_by_name = sort == "name"
    sort_column = models.Project.title if sort_by_name else models.Project.updated_at
    descending = (not sort_by_name) if order is None else order == "desc"
    filtered = filtered.order_by(sort_column.desc() if descending else sort_column.asc())

    total = filtered.count()
    projects = filtered.offset((page - 1) * page_size).limit(page_size).all()

    return envelope_list([ProjectSummary.model_validate(project) for project in projects], page=page, page_size=page_size, total=total)


@router.post("", status_code=201)
def create_project(
    payload: ProjectCreateRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = models.Project(user_id=current_user.id, title=payload.title, format=payload.format)
    db.add(project)
    db.commit()
    db.refresh(project)

    return envelope(ProjectSummary.model_validate(project))


@router.get("/{project_id}")
def get_project(
    project_id: str,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(db, current_user, project_id)
    return envelope(ProjectSummary.model_validate(project))


@router.patch("/{project_id}")
def patch_project(
    project_id: str,
    payload: ProjectPatchRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(db, current_user, project_id)

    if project.version != payload.version:
        raise ApiError(409, "VERSION_CONFLICT", "다른 곳에서 먼저 수정됐어요. 새로고침 후 다시 시도해주세요.")
    if payload.title is None and payload.starred is None and payload.format is None:
        raise ApiError(422, "VALIDATION_ERROR", "변경할 값을 하나 이상 보내주세요.")

    if payload.title is not None:
        project.title = payload.title
    if payload.starred is not None:
        project.starred = payload.starred
    if payload.format is not None:
        project.format = payload.format

    project.version += 1
    db.add(project)
    db.commit()
    db.refresh(project)

    return envelope(ProjectSummary.model_validate(project))


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    version: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(db, current_user, project_id)

    if project.version != version:
        raise ApiError(409, "VERSION_CONFLICT", "다른 곳에서 먼저 수정됐어요. 새로고침 후 다시 시도해주세요.")

    project.deleted_at = datetime.utcnow()
    db.add(project)
    db.commit()


@router.post("/{project_id}/restore")
def restore_project(
    project_id: str,
    payload: ProjectRestoreRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(db, current_user, project_id, include_deleted=True)

    if project.deleted_at is None:
        raise ApiError(409, "CONFLICT", "삭제되지 않은 프로젝트예요.")
    if project.version != payload.deleted_version:
        raise ApiError(409, "VERSION_CONFLICT", "삭제 시점 정보가 일치하지 않아요.")

    project.deleted_at = None
    project.version += 1
    db.add(project)
    db.commit()
    db.refresh(project)

    return envelope(ProjectSummary.model_validate(project))


@router.post("/{project_id}/duplicate", status_code=201)
def duplicate_project(
    project_id: str,
    payload: ProjectDuplicateRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(db, current_user, project_id)
    title = payload.title.strip() if payload.title else f"{project.title} 복사본"

    duplicate = models.Project(user_id=current_user.id, title=title, format=project.format)
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)

    return envelope(ProjectSummary.model_validate(duplicate))
