import fastapi
import logging
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

import json
import asyncio
from celery.result import AsyncResult
from app.core.celery_app import celery_app
from app.tasks import run_simulated_agent_task, run_agent_chat
from app.core.connection_manager import manager
from app.models.base import Agent, AgentStatus, ChatMessage, WebSocketMessage
from app.core.vector_store import vector_store_manager
from app.core.redis_client import async_redis_client, STREAM_CHANNEL

# Configure logging
logging.basicConfig(level=logging.INFO)

async def redis_pubsub_listener():
    """Listens to the Redis pub/sub channel and broadcasts messages to websockets."""
    pubsub = async_redis_client.pubsub()
    await pubsub.subscribe(STREAM_CHANNEL)
    logging.info(f"Subscribed to Redis channel: {STREAM_CHANNEL}")
    while True:
        try:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                logging.info(f"Received message from Redis: {message['data']}")
                # The message data is expected to be a JSON string with 'session_id' and 'payload'
                data = json.loads(message['data'])
                session_id = data.get("session_id")
                payload = data.get("payload")
                if session_id and payload:
                    await manager.send_json_to_session(payload, session_id)
            await asyncio.sleep(0.01) # Short sleep to prevent a busy-wait loop
        except Exception as e:
            logging.error(f"Error in Redis listener: {e}")
            # Potentially reconnect here
            await asyncio.sleep(1)


app = fastapi.FastAPI(
    title="Onwrk-AI Backend",
    description="The powerful, secure, and extensible backend for the Onwrk-AI Autonomous Agent Studio.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    # This is a good place to initialize connections
    logging.info("FastAPI application startup...")
    # The vector_store_manager is already initialized upon import
    if vector_store_manager.client:
        logging.info("ChromaDB connection successful.")
    else:
        logging.warning("ChromaDB connection failed. Memory features will be unavailable.")

    # Start the Redis listener as a background task
    asyncio.create_task(redis_pubsub_listener())

# In-memory data store (will be replaced by a proper database/state manager)
# This mimics the initial state from the frontend's zustand store.
agents_db: List[Agent] = [
    Agent(name='Onwrk-agen', status=AgentStatus.IDLE, task='Awaiting user input...'),
    Agent(name='ResearchAgent', status=AgentStatus.IDLE, task='Ready for research tasks.'),
    Agent(name='CodeAgent', status=AgentStatus.IDLE, task='Awaiting coding instructions.'),
    Agent(name='CloudAgent', status=AgentStatus.IDLE, task='Standing by for cloud operations.'),
]

@app.get("/")
async def root():
    """Root endpoint to check if the backend is running."""
    return {"message": "Onwrk-AI Backend is running"}

@app.get("/api/agents", response_model=List[Agent])
async def get_agents():
    """Returns the current list of all agents."""
    return agents_db

@app.post("/api/tasks/run-simulation", status_code=202)
async def run_task_simulation(task_name: str, duration: int):
    """
    Triggers a simulated agent task in the background.
    """
    task = run_simulated_agent_task.delay(task_name, duration)
    return {"message": "Task simulation started.", "task_id": task.id}

@app.get("/api/tasks/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Retrieves the status of a background task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    result = {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result
    }
    return result

@app.post("/api/memory")
async def add_memory(text: str, doc_id: str):
    """
    Adds a text to the vector memory.
    """
    vector_store_manager.add_text(text=text, metadata={"source": "manual"}, doc_id=doc_id)
    return {"message": "Memory added."}

@app.get("/api/memory/query")
async def query_memory(query: str):
    """
    Queries the vector memory.
    """
    results = vector_store_manager.query_text(query_text=query, n_results=2)
    return {"results": results}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    The main WebSocket endpoint for real-time communication.
    Handles incoming messages and broadcasts updates.
    A unique session_id is required for each connection.
    """
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            logging.info(f"Received data from session '{session_id}': {data}")

            try:
                message = WebSocketMessage(**data)

                # Route message based on event type
                if message.event == "chat_message":
                    # Extract data for the agent chat
                    user_text = message.data.get("text")
                    project_id = message.data.get("project_id", "default-project")

                    if not user_text:
                        raise ValueError("'text' field is required for chat_message event.")

                    # Start the agent chat in the background using Celery
                    # Pass the session_id to the task so it knows where to publish results
                    task = run_agent_chat.delay(
                        user_message=user_text,
                        project_id=project_id,
                        session_id=session_id
                    )

                    # Send an immediate acknowledgement to the user
                    ack_data = {
                        "event": "ack",
                        "data": {
                            "message": "Agent task has been started.",
                            "task_id": task.id
                        }
                    }
                    await manager.send_json_to_session(ack_data, session_id)

                else:
                    # Handle other event types or send an error
                    error_data = {
                        "event": "error",
                        "data": {"message": f"Event type '{message.event}' not supported."}
                    }
                    await manager.send_json_to_session(error_data, session_id)

            except Exception as e:
                logging.error(f"Error processing message for session '{session_id}': {e}")
                error_response = {
                    "event": "error",
                    "data": {"message": str(e)}
                }
                await manager.send_json_to_session(error_response, session_id)

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logging.info(f"Client for session '{session_id}' disconnected.")
    except Exception as e:
        logging.error(f"An error occurred in websocket for session '{session_id}': {e}")
        manager.disconnect(session_id)
