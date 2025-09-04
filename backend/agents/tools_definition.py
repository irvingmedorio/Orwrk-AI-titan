"""Definitions of tools used by agents."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List

import httpx
from langchain.tools import StructuredTool

from backend.app.config import settings
from backend.app.sandbox_manager import SandboxManager
from backend.tools.crush_tool import (
    CrushCommandInput,
    execute_crush_command,
)


# ---------------------------------------------------------------------------
# Core filesystem interaction via Crush
# ---------------------------------------------------------------------------
CrushFileSystemTool = StructuredTool.from_function(
    func=execute_crush_command,
    name="crush",
    description="Safely interact with the project filesystem via crush",
    args_schema=CrushCommandInput,
)


# ---------------------------------------------------------------------------
# Placeholder business-advisor tools
# ---------------------------------------------------------------------------


def web_intelligence_tool(query: str) -> Dict[str, Any]:
    """Analyze market trends and competitors using Brave search API."""
    api_key = settings.brave_api_key
    if not api_key:
        return {"error": "BRAVE_API_KEY not configured"}
    headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
    params = {"q": query, "count": 3}
    resp = httpx.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers=headers,
        params=params,
        timeout=10.0,
    )
    if resp.status_code != 200:
        return {"error": f"search failed: {resp.status_code}"}
    data = resp.json()
    results = [
        {"title": item.get("title"), "url": item.get("url")}
        for item in data.get("web", {}).get("results", [])
    ]
    return {"results": results}


def deep_reasoning_engine(topic: str) -> str:
    """Perform multi-step strategic reasoning with LFM2-VL-1.6B."""
    payload = {
        "model": "lfm2-vl-1.6b",
        "messages": [{"role": "user", "content": topic}],
    }
    resp = httpx.post(settings.llm_openai_endpoint, json=payload, timeout=30.0)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def sandbox_execution(task: str) -> List[str]:
    """Run a task inside an isolated Docker sandbox and return logs."""
    manager = SandboxManager()
    return manager.run_task(task)


def file_management_tool(action: str, path: str, content: str | None = None) -> str:
    """Create or manage business plan files under ``business-plans`` directory."""
    base_dir = Path("business-plans").resolve()
    base_dir.mkdir(parents=True, exist_ok=True)
    target = (base_dir / Path(path).name).resolve()
    if base_dir not in target.parents and target != base_dir:
        raise ValueError("Invalid path")

    if action == "write":
        if content is None:
            raise ValueError("content required for write")
        target.write_text(content, encoding="utf-8")
        return str(target)
    if action == "read":
        return target.read_text(encoding="utf-8")
    if action == "list":
        return ",".join(p.name for p in base_dir.iterdir())
    if action == "delete":
        if target.exists():
            target.unlink()
        return "deleted"
    raise ValueError("Unsupported action")


def voice_processing_tool(audio_path: str) -> str:
    """Transcribe audio with Whisper.cpp and return text."""
    cmd = [
        settings.whisper_cpp_bin,
        "-m",
        settings.whisper_cpp_model,
        audio_path,
        "--output-json",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    transcript = " ".join(seg.get("text", "").strip() for seg in data.get("segments", []))
    return transcript


def browser_automation_tool(url: str, actions: List[str]) -> str:
    """Automate headless browser tasks like form filling or posting content."""
    resp = httpx.get(url, timeout=10.0)
    return f"Fetched {url} with status {resp.status_code}"


def financial_modeling_tool(data: Dict[str, Any]) -> Dict[str, Any]:
    """Compute investment, revenue projections and ROI scenarios."""
    cost = float(data.get("cost", 0))
    revenue = float(data.get("revenue", 0))
    roi = (revenue - cost) / cost if cost else 0.0
    return {"investment": cost, "revenue": revenue, "roi": roi}


# Convert placeholder functions into StructuredTool instances
WebIntelligenceTool = StructuredTool.from_function(
    func=web_intelligence_tool,
    name="web_intelligence",
    description="Market trend analysis and competitor research",
)

DeepReasoningTool = StructuredTool.from_function(
    func=deep_reasoning_engine,
    name="deep_reasoning",
    description="Advanced business reasoning engine",
)

SandboxTool = StructuredTool.from_function(
    func=sandbox_execution,
    name="sandbox",
    description="Execute tasks inside isolated Docker sandbox",
)

FileManagementTool = StructuredTool.from_function(
    func=file_management_tool,
    name="file_management",
    description="Manage business plan files and backups",
)

VoiceProcessingTool = StructuredTool.from_function(
    func=voice_processing_tool,
    name="voice_processing",
    description="Transcribe audio and generate structured notes",
)

BrowserAutomationTool = StructuredTool.from_function(
    func=browser_automation_tool,
    name="browser_automation",
    description="Automate headless browser workflows",
)

FinancialModelingTool = StructuredTool.from_function(
    func=financial_modeling_tool,
    name="financial_modeling",
    description="Project costs, revenues, and ROI scenarios",
)


def google_drive_tool(action: str, file_path: str) -> Dict[str, Any]:
    """Interact with Google Drive using an OAuth2 token."""
    token = settings.google_api_token
    if not token:
        raise RuntimeError("GOOGLE_API_TOKEN not configured")
    headers = {"Authorization": f"Bearer {token}"}
    if action == "upload":
        with open(file_path, "rb") as f:
            resp = httpx.post(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
                headers=headers,
                data=f,
            )
        resp.raise_for_status()
        return resp.json()
    if action == "list":
        resp = httpx.get("https://www.googleapis.com/drive/v3/files", headers=headers)
        resp.raise_for_status()
        return resp.json()
    raise ValueError("Unsupported action")


def onedrive_tool(action: str, file_path: str) -> Dict[str, Any]:
    """Interact with OneDrive using an OAuth2 token."""
    token = settings.onedrive_api_token
    if not token:
        raise RuntimeError("ONEDRIVE_API_TOKEN not configured")
    headers = {"Authorization": f"Bearer {token}"}
    if action == "upload":
        with open(file_path, "rb") as f:
            resp = httpx.put(
                f"https://graph.microsoft.com/v1.0/me/drive/root:/{Path(file_path).name}:/content",
                headers=headers,
                data=f,
            )
        resp.raise_for_status()
        return resp.json()
    if action == "list":
        resp = httpx.get(
            "https://graph.microsoft.com/v1.0/me/drive/root/children", headers=headers
        )
        resp.raise_for_status()
        return resp.json()
    raise ValueError("Unsupported action")


__all__ = [
    "CrushFileSystemTool",
    "WebIntelligenceTool",
    "DeepReasoningTool",
    "SandboxTool",
    "FileManagementTool",
    "VoiceProcessingTool",
    "BrowserAutomationTool",
    "FinancialModelingTool",
    "google_drive_tool",
    "onedrive_tool",
]
