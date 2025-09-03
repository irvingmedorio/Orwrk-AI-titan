from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, EmailStr


class AgentCreate(BaseModel):
    """Payload to create a new agent."""

    name: str = Field(..., description="Unique agent name")
    description: str | None = Field(None, description="Optional agent description")


class AgentToggle(BaseModel):
    """Payload to toggle agent active state."""

    name: str
    active: bool


class AgentSchedule(BaseModel):
    """Payload to schedule agent activation."""

    name: str
    start_time: datetime


class AgentState(BaseModel):
    """Representation of an agent in the system."""

    name: str
    description: str = ""
    active: bool = True
    scheduled: datetime | None = None


class WebIntelligenceRequest(BaseModel):
    """Request schema for web intelligence module."""

    query: str


class FileSyncRequest(BaseModel):
    """Request schema to persist a file in the backend backup folder."""

    file_name: str
    content_base64: str = Field(
        ..., description="Base64-encoded file contents to allow binary uploads such as .zip"
    )


class CloudFileRequest(BaseModel):
    """Interact with cloud storage providers."""

    action: Literal["upload", "list"]
    file_path: str | None = Field(
        None, description="Local file path required for upload actions"
    )


class VoiceProcessRequest(BaseModel):
    """Request schema for voice processing."""

    audio_path: str | None = Field(None, description="Path to local audio or video file")
    media_url: str | None = Field(None, description="URL to audio or video to transcribe")
    media_base64: str | None = Field(
        None, description="Base64-encoded audio or video content",
    )
    media_filename: str | None = Field(
        None, description="Filename for provided base64 media data",
    )
    zip_name: str | None = Field(
        None, description="Optional filename for a .zip attachment provided inline"
    )
    zip_base64: str | None = Field(
        None, description="Base64-encoded contents of the attached .zip file"
    )


class VoiceNote(BaseModel):
    """Single note entry for the voice agent."""

    id: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class VoiceNoteCreate(BaseModel):
    """Create a new voice note."""

    content: str


class VoiceNoteUpdate(BaseModel):
    """Update an existing voice note."""

    content: str


class AgendaItem(BaseModel):
    """Single agenda item for the voice agent."""

    id: str
    content: str
    completed: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgendaItemCreate(BaseModel):
    """Create a new agenda item."""

    content: str


class AgendaItemUpdate(BaseModel):
    """Update an existing agenda item."""

    content: str | None = None
    completed: bool | None = None


class ChatMessage(BaseModel):
    """Single chat message entry."""

    role: str
    content: str
    media_url: str | None = Field(
        None, description="URL to audio or video media that should be transcribed",
    )
    transcript: str | None = None
    attachment_name: str | None = Field(
        None, description="Optional filename for an attached .zip file"
    )
    attachment_base64: str | None = Field(
        None, description="Base64-encoded contents of the attached file"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSaveRequest(BaseModel):
    """Request to persist a chat message for a project."""

    project_id: str
    message: ChatMessage


class ChatHistoryResponse(BaseModel):
    """Response model containing project chat history."""

    project_id: str
    messages: list[ChatMessage] = Field(default_factory=list)


class LLMChatMessage(BaseModel):
    """Minimal chat message for direct LLM calls."""

    role: str
    content: str


class LLMChatRequest(BaseModel):
    """Request schema for the generic LLM chat endpoint."""

    messages: list[LLMChatMessage] = Field(..., min_items=1)


class UserRegister(BaseModel):
    """Register a new user account."""

    email: EmailStr
    nickname: str
    password: str


class UserLogin(BaseModel):
    """Authenticate an existing user."""

    email: EmailStr
    password: str


class SandboxRunRequest(BaseModel):
    """Request to execute a task inside the sandbox.""" 

    task: str = Field(..., description="Descripción de la tarea a ejecutar")


class SandboxRunResponse(BaseModel):
    """Progress logs from the sandbox run."""

    logs: list[str] = Field(default_factory=list)


class PlanGenerateRequest(BaseModel):
    """Request to generate a new business plan from a topic."""

    topic: str = Field(..., description="Idea or problem to analyze")


class PlanStep(BaseModel):
    """Single step inside an implementation plan."""

    description: str
    assigned_agent: str | None = None
    completed: bool = False
    result: str | None = None


class ImplementationPlan(BaseModel):
    """Full plan delivered by Business Advisor Agent."""

    id: str | None = None
    title: str
    objectives: str
    cost: str
    roi: str
    steps: list[PlanStep]


class StepUpdate(BaseModel):
    """Update for a specific plan step."""

    plan_id: str
    step_index: int
    success: bool
    details: str | None = None


class LLMConfig(BaseModel):
    """Current LLM configuration."""

    provider: str
    model: str
    endpoint: str


class LLMConfigUpdate(BaseModel):
    """Update fields for LLM configuration."""

    provider: str | None = None
    model: str | None = None
    endpoint: str | None = None


class LLMUploadResponse(BaseModel):
    """Response after uploading a model file."""

    path: str
