import base64
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File

from ...config import settings
from ...agent_manager import manager
from ...chat_manager import save_message, load_history
from ...sandbox_manager import SandboxManager
from ...transcriber import transcribe_file, AUDIO_VIDEO_EXTS
from ...schemas import (
    AgentCreate,
    AgentToggle,
    AgentSchedule,
    AgentState,
    WebIntelligenceRequest,
    FileSyncRequest,
    CloudFileRequest,
    VoiceProcessRequest,
    VoiceNote,
    VoiceNoteCreate,
    VoiceNoteUpdate,
    AgendaItem,
    AgendaItemCreate,
    AgendaItemUpdate,
    ChatSaveRequest,
    ChatHistoryResponse,
    LLMChatRequest,
    SandboxRunRequest,
    SandboxRunResponse,
    PlanGenerateRequest,
    ImplementationPlan,
    StepUpdate,
    LLMConfig,
    LLMConfigUpdate,
    LLMUploadResponse,
    UserRegister,
    UserLogin,
)
from ...voice_notes import list_notes, add_note, update_note, delete_note
from ...voice_agenda import list_items, add_item, update_item, delete_item
from ...business_advisor import create_plan, update_step, generate_plan
from ...users import register_user, authenticate_user
from ...llm_client import llm_client
from ...agents.tools_definition import google_drive_tool, onedrive_tool

router = APIRouter()


@router.get("/health", summary="Health check")
def health() -> dict[str, str]:
    """Return API health status."""
    return {"status": "ok"}


@router.post("/auth/register", summary="Register user")
def auth_register(payload: UserRegister) -> dict[str, str]:
    """Create a new user with hashed password."""
    try:
        register_user(payload.email, payload.nickname, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "registered"}


@router.post("/auth/login", summary="Authenticate user")
def auth_login(payload: UserLogin) -> dict[str, str]:
    """Verify user credentials."""
    if authenticate_user(payload.email, payload.password):
        return {"status": "ok"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/agents/create", summary="Create new agent", response_model=AgentState)
def create_agent(payload: AgentCreate) -> AgentState:
    """Register a new agent in memory."""
    return manager.create(payload.name, payload.description)


@router.get("/agents/active", summary="List active agents", response_model=list[AgentState])
def list_active_agents() -> list[AgentState]:
    """Return all currently active agents."""
    return manager.list_active()


@router.post("/agents/toggle", summary="Toggle agent state", response_model=AgentState)
def toggle_agent(payload: AgentToggle) -> AgentState:
    """Enable or disable an agent."""
    agent = manager.toggle(payload.name, payload.active)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/agents/schedule", summary="Schedule agent activation", response_model=AgentState)
def schedule_agent(payload: AgentSchedule) -> AgentState:
    """Store activation time for an agent."""
    agent = manager.schedule(payload.name, payload.start_time)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/web-intelligence", summary="Web intelligence search")
def web_intelligence(req: WebIntelligenceRequest) -> dict[str, Any]:
    """Perform a simple Brave search for the given query."""
    api_key = settings.brave_api_key
    if not api_key:
        raise HTTPException(status_code=503, detail="BRAVE_API_KEY not configured")
    headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
    params = {"q": req.query, "count": 3}
    resp = httpx.get(
        "https://api.search.brave.com/res/v1/web/search", headers=headers, params=params, timeout=10.0
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Search API error")
    data = resp.json()
    results = [
        {"title": item.get("title"), "url": item.get("url")}
        for item in data.get("web", {}).get("results", [])
    ]
    return {"results": results}


@router.post("/llm/chat", summary="Generic LLM chat completion")
def llm_chat(req: LLMChatRequest) -> dict[str, str]:
    """Forward messages to the configured LLM provider and return its reply."""
    try:
        reply = llm_client.chat([m.dict() for m in req.messages])
    except Exception as exc:  # pragma: no cover - provider errors
        raise HTTPException(status_code=500, detail="LLM provider error") from exc
    return {"response": reply}


@router.get("/llm/config", summary="Get LLM configuration", response_model=LLMConfig)
def llm_get_config() -> LLMConfig:
    """Return current LLM provider and model info."""
    return LLMConfig(
        provider=llm_client.provider, model=llm_client.model, endpoint=llm_client.endpoint
    )


@router.post("/llm/config", summary="Update LLM configuration", response_model=LLMConfig)
def llm_update_config(cfg: LLMConfigUpdate) -> LLMConfig:
    """Update provider, model or endpoint for the LLM client."""
    llm_client.update_config(cfg.provider, cfg.model, cfg.endpoint)
    return LLMConfig(
        provider=llm_client.provider, model=llm_client.model, endpoint=llm_client.endpoint
    )


@router.post("/llm/upload", summary="Upload new local model", response_model=LLMUploadResponse)
async def llm_upload_model(file: UploadFile = File(...)) -> LLMUploadResponse:
    """Receive a .gguf model file and store it under the models directory."""
    filename = Path(file.filename).name
    if not filename.endswith(".gguf"):
        raise HTTPException(status_code=400, detail="Model must be a .gguf file")
    models_dir = Path(settings.models_dir)
    models_dir.mkdir(parents=True, exist_ok=True)
    dest = models_dir / filename
    content = await file.read()
    with open(dest, "wb") as f:
        f.write(content)
    llm_client.update_config(model=str(dest))
    return LLMUploadResponse(path=str(dest))


@router.post("/cloud/google", summary="Google Drive action")
def cloud_google(req: CloudFileRequest) -> dict[str, Any]:
    """Upload or list files on Google Drive using a stored OAuth token."""
    try:
        return google_drive_tool(req.action, req.file_path or "")
    except Exception as exc:  # pragma: no cover - network errors
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/cloud/onedrive", summary="OneDrive action")
def cloud_onedrive(req: CloudFileRequest) -> dict[str, Any]:
    """Upload or list files on OneDrive using a stored OAuth token."""
    try:
        return onedrive_tool(req.action, req.file_path or "")
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/files/sync", summary="Persist file to backend backup")
def file_sync(req: FileSyncRequest) -> dict[str, str]:
    """Save a file into the configured backup directory."""
    backup_dir = Path(settings.frontend_backup_dir)
    backup_dir.mkdir(parents=True, exist_ok=True)
    sanitized = Path(req.file_name).name
    if sanitized != req.file_name or sanitized in {"", ".", ".."}:
        raise HTTPException(status_code=400, detail="Invalid file name")
    path = backup_dir / sanitized
    with open(path, "wb") as f:
        f.write(base64.b64decode(req.content_base64))
    return {"status": "synced", "path": str(path)}


@router.post(
    "/chat/save", summary="Save chat message", response_model=ChatHistoryResponse
)
def chat_save(req: ChatSaveRequest) -> ChatHistoryResponse:
    """Persist a chat message for a project."""
    if req.message.media_url:
        try:
            resp = httpx.get(req.message.media_url, timeout=10.0)
            resp.raise_for_status()
            suffix = Path(req.message.media_url).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(resp.content)
                tmp_path = Path(tmp.name)
            if tmp_path.suffix.lower() in AUDIO_VIDEO_EXTS:
                req.message.transcript = transcribe_file(tmp_path)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Media URL transcription failed") from exc
    try:
        messages = save_message(req.project_id, req.message)
    except ValueError as exc:  # project_id invalid
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ChatHistoryResponse(project_id=req.project_id, messages=messages)


@router.get(
    "/chat/history/{project_id}", summary="Get chat history", response_model=ChatHistoryResponse
)
def chat_history(project_id: str) -> ChatHistoryResponse:
    """Return stored chat conversation for a project."""
    try:
        messages = load_history(project_id)
    except ValueError as exc:  # project_id invalid
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ChatHistoryResponse(project_id=project_id, messages=messages)


@router.post("/sandbox/run", summary="Run task in isolated sandbox", response_model=SandboxRunResponse)
def sandbox_run(req: SandboxRunRequest) -> SandboxRunResponse:
    """Execute a task inside an ephemeral Docker container and return progress logs."""
    manager = SandboxManager()
    logs = manager.run_task(req.task)
    return SandboxRunResponse(logs=logs)


@router.post(
    "/business-advisor/generate",
    summary="Generate business plan",
    response_model=ImplementationPlan,
)
def business_advisor_generate(req: PlanGenerateRequest) -> ImplementationPlan:
    """Invoke Business Advisor Agent to create a plan from a topic."""
    try:
        return generate_plan(req.topic)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Plan generation failed") from exc


@router.post(
    "/business-advisor/plan",
    summary="Register implementation plan",
    response_model=ImplementationPlan,
)
def business_advisor_plan(plan: ImplementationPlan) -> ImplementationPlan:
    """Store a plan proposed by the Business Advisor Agent."""
    return create_plan(plan)


@router.post(
    "/business-advisor/check",
    summary="Report step outcome",
)
def business_advisor_check(payload: StepUpdate) -> dict[str, str]:
    """Record the result of a plan step and return next action."""
    try:
        status = update_step(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": status}


@router.post("/voice-agent/process", summary="Process voice input")
def voice_agent_process(req: VoiceProcessRequest) -> dict[str, Any]:
    """Transcribe audio and analyze attachments with local LFM2-VL-1.6B."""
    voice_dir = Path(settings.voice_agent_dir)
    voice_dir.mkdir(parents=True, exist_ok=True)
    stored: dict[str, str] = {}

    # Persist optional ZIP attachment
    if req.zip_base64 and req.zip_name:
        zip_path = voice_dir / Path(req.zip_name).name
        with open(zip_path, "wb") as f:
            f.write(base64.b64decode(req.zip_base64))
        stored["zip_path"] = str(zip_path)

    transcript = ""
    media_path: Path | None = None
    if req.media_base64 and req.media_filename:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(req.media_filename).suffix) as tmp:
            tmp.write(base64.b64decode(req.media_base64))
            media_path = Path(tmp.name)
    elif req.media_url:
        try:
            resp = httpx.get(req.media_url, timeout=10.0)
            resp.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(req.media_url).suffix) as tmp:
                tmp.write(resp.content)
                media_path = Path(tmp.name)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Media download failed") from exc
    elif req.audio_path:
        media_path = Path(req.audio_path)

    if media_path and media_path.suffix.lower() in AUDIO_VIDEO_EXTS:
        try:
            transcript = transcribe_file(media_path)
            stored["transcript"] = transcript
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Transcription failed") from exc

    # Load Business Advisor Agent profile
    agent_path = Path(__file__).resolve().parents[4] / "agents" / "experts" / "business-advisor.json"
    with open(agent_path, "r", encoding="utf-8") as f:
        agent_cfg = json.load(f)
    system_prompt = agent_cfg.get("prompt", "")

    messages = [{"role": "system", "content": system_prompt}]
    if transcript:
        messages.append({"role": "user", "content": transcript})
    if stored.get("zip_path"):
        messages.append({"role": "user", "content": f"Analiza el archivo {stored['zip_path']}"})

    try:
        llm_resp = httpx.post(
            settings.llm_openai_endpoint,
            json={"model": "lfm2-vl-1.6b", "messages": messages},
            timeout=30.0,
        )
        llm_resp.raise_for_status()
        analysis = llm_resp.json()["choices"][0]["message"]["content"]
    except Exception as exc:  # pragma: no cover - network failures
        raise HTTPException(status_code=502, detail="LLM request failed") from exc

    sandbox = SandboxManager()
    logs = sandbox.run_task("Procesar entrada de voz")
    return {"status": "processed", **stored, "analysis": analysis, "logs": logs}


@router.get("/voice-agent/notes", summary="List voice notes", response_model=list[VoiceNote])
def voice_notes_list() -> list[VoiceNote]:
    return [VoiceNote(**n) for n in list_notes()]


@router.post("/voice-agent/notes", summary="Add voice note", response_model=VoiceNote)
def voice_notes_add(payload: VoiceNoteCreate) -> VoiceNote:
    note = add_note(payload.content)
    return VoiceNote(**note)


@router.put(
    "/voice-agent/notes/{note_id}", summary="Update voice note", response_model=VoiceNote
)
def voice_notes_update(note_id: str, payload: VoiceNoteUpdate) -> VoiceNote:
    note = update_note(note_id, payload.content)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return VoiceNote(**note)


@router.delete("/voice-agent/notes/{note_id}", summary="Delete voice note")
def voice_notes_delete(note_id: str) -> dict[str, str]:
    if not delete_note(note_id):
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted"}


@router.get(
    "/voice-agent/agenda", summary="List agenda items", response_model=list[AgendaItem]
)
def voice_agenda_list() -> list[AgendaItem]:
    return [AgendaItem(**i) for i in list_items()]


@router.post(
    "/voice-agent/agenda", summary="Add agenda item", response_model=AgendaItem
)
def voice_agenda_add(payload: AgendaItemCreate) -> AgendaItem:
    item = add_item(payload.content)
    return AgendaItem(**item)


@router.put(
    "/voice-agent/agenda/{item_id}",
    summary="Update agenda item",
    response_model=AgendaItem,
)
def voice_agenda_update(item_id: str, payload: AgendaItemUpdate) -> AgendaItem:
    item = update_item(item_id, payload.content, payload.completed)
    if not item:
        raise HTTPException(status_code=404, detail="Agenda item not found")
    return AgendaItem(**item)


@router.delete(
    "/voice-agent/agenda/{item_id}", summary="Delete agenda item"
)
def voice_agenda_delete(item_id: str) -> dict[str, str]:
    if not delete_item(item_id):
        raise HTTPException(status_code=404, detail="Agenda item not found")
    return {"status": "deleted"}
