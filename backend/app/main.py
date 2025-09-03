from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from .config import settings
from .api.v1.routes import router as api_router
from .scheduler import start_scheduler
from .ws_manager import ws_manager

app = FastAPI(title="Onwrk-AI Backend", version="0.1.0")


@app.get("/", summary="Root")
def root() -> dict[str, str]:
    """Basic root endpoint."""
    return {"message": "Onwrk-AI backend running"}


app.include_router(api_router, prefix="/api/v1")


@app.websocket("/ws/progress")
async def progress_ws(websocket: WebSocket) -> None:
    """WebSocket endpoint that streams progress events to clients."""
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.on_event("startup")
async def _startup() -> None:  # pragma: no cover - scheduler side effect
    """Start background services when the API boots."""
    start_scheduler()
