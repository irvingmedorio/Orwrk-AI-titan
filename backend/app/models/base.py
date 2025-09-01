from pydantic import BaseModel
from enum import Enum
from typing import Optional

class AgentStatus(str, Enum):
    IDLE = 'Idle'
    THINKING = 'Thinking'
    EXECUTING = 'Executing'
    AWAITING_CONFIRMATION = 'Awaiting Confirmation'
    ERROR = 'Error'
    INACTIVE = 'Inactive'
    DEEP_REASONING = 'Deep Reasoning'

class Agent(BaseModel):
    name: str
    status: AgentStatus
    task: str
    reactivationTime: Optional[str] = None
    modelFile: Optional[str] = None

class MessageSender(str, Enum):
    USER = 'User'
    PLANNER = 'Onwrk-agen'
    RESEARCH = 'ResearchAgent'
    CODE = 'CodeAgent'
    CLOUD = 'CloudAgent'
    VOICE = 'VoiceAgent'

class ChatMessage(BaseModel):
    id: str
    sender: str # Can be 'User' or any agent name
    text: str
    timestamp: str
    # suggestion: Optional[TaskSuggestion] = None # Add later
    # deepReasoningState: Optional[DeepReasoningState] = None # Add later
    # webIntelligenceState: Optional[WebIntelligenceMission] = None # Add later

class WebSocketMessage(BaseModel):
    event: str
    data: dict
