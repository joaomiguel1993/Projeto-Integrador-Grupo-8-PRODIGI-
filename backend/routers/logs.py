from fastapi import APIRouter
from backend.dao.logs_dao import select_all_logs

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("/")
def get_logs():
    return select_all_logs()