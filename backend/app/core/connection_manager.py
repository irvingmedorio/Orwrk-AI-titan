from fastapi import WebSocket
import logging
import json

class ConnectionManager:
    def __init__(self):
        # Store connections with a session_id as the key
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logging.info(f"New connection for session_id '{session_id}': {websocket.client}. Total connections: {len(self.active_connections)}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logging.info(f"Connection for session_id '{session_id}' closed. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, session_id: str):
        websocket = self.active_connections.get(session_id)
        if websocket:
            await websocket.send_text(message)

    async def send_json_to_session(self, data: dict, session_id: str):
        websocket = self.active_connections.get(session_id)
        if websocket:
            await websocket.send_json(data)

    async def broadcast(self, message: str):
        for session_id, connection in self.active_connections.items():
            await connection.send_text(message)

    async def broadcast_json(self, data: dict):
        for session_id, connection in self.active_connections.items():
            await connection.send_json(data)

manager = ConnectionManager()
