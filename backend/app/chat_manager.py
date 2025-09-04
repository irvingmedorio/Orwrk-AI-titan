import base64
import json
import re
from pathlib import Path
from typing import List
from .config import settings
from .schemas import ChatMessage
from .transcriber import transcribe_file, AUDIO_VIDEO_EXTS

_base = Path(settings.frontend_backup_dir) / "chat"
_base.mkdir(parents=True, exist_ok=True)


def _sanitize_project_id(project_id: str) -> str:
    if not re.fullmatch(r"[a-zA-Z0-9_-]+", project_id):
        raise ValueError("Invalid project_id")
    return project_id


def save_message(project_id: str, message: ChatMessage) -> List[ChatMessage]:
    """Persist a chat message to a project's history."""
    project_id = _sanitize_project_id(project_id)
    path = _base / f"{project_id}.json"
    if path.exists():
        data = json.loads(path.read_text())
    else:
        data = []

    if message.attachment_base64 and message.attachment_name:
        attach_dir = _base / project_id
        attach_dir.mkdir(parents=True, exist_ok=True)
        file_name = Path(message.attachment_name).name
        if file_name != message.attachment_name or file_name in {"", ".", ".."}:
            raise ValueError("Invalid attachment name")
        file_path = attach_dir / file_name
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(message.attachment_base64))
        if file_path.suffix.lower() in AUDIO_VIDEO_EXTS:
            try:
                message.transcript = transcribe_file(file_path)
            except Exception:
                message.transcript = None

    data.append(message.dict())
    path.write_text(json.dumps(data, default=str))
    return [ChatMessage(**m) for m in data]


def load_history(project_id: str) -> List[ChatMessage]:
    """Return stored chat history for a project."""
    project_id = _sanitize_project_id(project_id)
    path = _base / f"{project_id}.json"
    if not path.exists():
        return []
    data = json.loads(path.read_text())
    return [ChatMessage(**m) for m in data]
