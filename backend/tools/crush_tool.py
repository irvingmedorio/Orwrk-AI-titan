"""Secure wrapper around the `crush` filesystem utility."""

from __future__ import annotations

import logging
import shlex
import subprocess
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)


ALLOWED_COMMANDS = {"ls", "get", "put", "del", "info", "glob", "cat"}
BASE_WORKSPACE = Path("/workspaces")


class CrushCommandInput(BaseModel):
    """Validation model for crush commands."""

    project_id: str = Field(..., description="Workspace identifier")
    command: str = Field(..., description="Crush subcommand")
    path: Optional[str] = Field(None, description="Target path relative to project workspace")
    content: Optional[str] = Field(None, description="Content for put operations")

    @field_validator("command")
    def validate_command(cls, v: str) -> str:
        if v not in ALLOWED_COMMANDS:
            raise ValueError("Command not allowed")
        return v


class CrushCommandOutput(BaseModel):
    """Result of a crush command."""

    stdout: str
    stderr: str
    returncode: int


def execute_crush_command(data: CrushCommandInput) -> CrushCommandOutput:
    """Execute a crush command in a safe, sandboxed workspace."""

    workspace = BASE_WORKSPACE / data.project_id
    workspace.mkdir(parents=True, exist_ok=True)

    cmd: List[str] = ["crush", data.command]
    if data.path:
        resolved = (workspace / data.path).resolve()
        if workspace not in resolved.parents and resolved != workspace:
            raise ValueError("Path escapes workspace")
        cmd.append(str(resolved.relative_to(workspace)))
    if data.content is not None:
        cmd.append(data.content)

    logger.info("Executing crush command: %s", shlex.join(cmd))
    try:
        result = subprocess.run(
            cmd,
            cwd=workspace,
            capture_output=True,
            text=True,
            check=False,
        )
        logger.debug("stdout: %s", result.stdout)
        logger.debug("stderr: %s", result.stderr)
        return CrushCommandOutput(
            stdout=result.stdout,
            stderr=result.stderr,
            returncode=result.returncode,
        )
    except Exception as exc:  # pragma: no cover - logging error path
        logger.exception("Crush command failed: %s", exc)
        raise
