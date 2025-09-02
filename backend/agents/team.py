"""Agent team definitions using Microsoft AutoGen."""

from autogen import ConversableAgent

from app.config import settings

from .tools_definition import (
    BrowserAutomationTool,
    CrushFileSystemTool,
    DeepReasoningTool,
    FileManagementTool,
    FinancialModelingTool,
    SandboxTool,
    VoiceProcessingTool,
    WebIntelligenceTool,
    google_drive_tool,
    onedrive_tool,
)

# Build an AutoGen LLM configuration that targets the local llama.cpp server
_llm_base_url = settings.llm_openai_endpoint.rsplit("/chat/completions", 1)[0]
LLM_CONFIG = {
    "config_list": [
        {
            "model": "lfm2-vl-1.6b",
            "base_url": _llm_base_url,
            "api_key": "EMPTY",  # llama.cpp does not require a key
        }
    ]
}


CodeAgent = ConversableAgent(
    name="code_agent",
    system_message="Agent responsible for code execution via crush",
    description="Interacts with project filesystem using CrushFileSystemTool",
    tools=[CrushFileSystemTool],
    llm_config=LLM_CONFIG,
)

ResearchAgent = ConversableAgent(
    name="research_agent",
    system_message="Agent limited to performing web research",
    llm_config=LLM_CONFIG,
)

CloudAgent = ConversableAgent(
    name="cloud_agent",
    system_message="Agent to interact with cloud storage via OAuth2",
    tools=[google_drive_tool, onedrive_tool],
    llm_config=LLM_CONFIG,
)

BusinessAdvisorAgent = ConversableAgent(
    name="business_advisor_agent",
    system_message="Autonomous strategist generating validated business plans",
    tools=[
        WebIntelligenceTool,
        DeepReasoningTool,
        SandboxTool,
        FileManagementTool,
        VoiceProcessingTool,
        BrowserAutomationTool,
        FinancialModelingTool,
    ],
    llm_config=LLM_CONFIG,
)

__all__ = [
    "CodeAgent",
    "ResearchAgent",
    "CloudAgent",
    "BusinessAdvisorAgent",
    "LLM_CONFIG",
]
