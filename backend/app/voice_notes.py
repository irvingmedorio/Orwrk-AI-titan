"""Utility helpers to persist Voice Agent notes separately."""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

from .config import settings

_voice_dir = Path(settings.voice_agent_dir)
_voice_dir.mkdir(parents=True, exist_ok=True)
_notes_file = _voice_dir / "notes.json"


def _load_notes() -> list[dict[str, str]]:
    if _notes_file.exists():
        return json.loads(_notes_file.read_text())
    return []


def _save_notes(notes: list[dict[str, str]]) -> None:
    _notes_file.write_text(json.dumps(notes, ensure_ascii=False, indent=2))


def list_notes() -> list[dict[str, str]]:
    return _load_notes()


def add_note(content: str) -> dict[str, str]:
    notes = _load_notes()
    note = {
        "id": uuid.uuid4().hex,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
    }
    notes.append(note)
    _save_notes(notes)
    return note


def update_note(note_id: str, content: str) -> dict[str, str] | None:
    notes = _load_notes()
    for note in notes:
        if note["id"] == note_id:
            note["content"] = content
            _save_notes(notes)
            return note
    return None


def delete_note(note_id: str) -> bool:
    notes = _load_notes()
    new_notes = [n for n in notes if n["id"] != note_id]
    if len(new_notes) == len(notes):
        return False
    _save_notes(new_notes)
    return True
