from __future__ import annotations

from typing import List
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect


class WebSocketManager:
    """Simple connection manager for broadcasting progress messages."""

    def __init__(self) -> None:
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        """Send a message to all active connections."""
        for ws in list(self.connections):
            try:
                await ws.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(ws)


ws_manager = WebSocketManager()
