# routers/logs.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.dao.logs_dao import select_all_logs
import io

router = APIRouter(prefix="/v1/logs", tags=["Logs"])


@router.get("/")
def get_logs():
    return select_all_logs()


@router.get("/export/excel")
def export_logs_excel():
    try:
        from openpyxl import Workbook  # import aqui dentro — não crasha ao arrancar
    except ImportError:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="openpyxl não está instalado no servidor.")

    logs = select_all_logs()
    wb = Workbook()
    ws = wb.create_sheet("Logs", 0)
    ws.append(["ID", "Username", "Ação", "Detalhe", "IP", "Data"])

    for log in logs:
        ws.append([
            getattr(log, "idlog", "") or "",
            getattr(log, "username", "") or "",
            getattr(log, "acao", "") or "",
            getattr(log, "detalhe", "") or "",
            getattr(log, "ip", "") or "",
            str(getattr(log, "criado_em", "") or ""),
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=relatorio_logs.xlsx"},
    )