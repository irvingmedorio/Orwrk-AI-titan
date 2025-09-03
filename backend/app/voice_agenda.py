import json
import uuid
from datetime import datetime
from pathlib import Path

from .config import settings

_agenda_dir = Path(settings.voice_agent_dir)
_agenda_dir.mkdir(parents=True, exist_ok=True)
_agenda_file = _agenda_dir / "agenda.json"


def _load_agenda() -> list[dict[str, str]]:
    if _agenda_file.exists():
        return json.loads(_agenda_file.read_text())
    return []


def _save_agenda(items: list[dict[str, str]]) -> None:
    _agenda_file.write_text(json.dumps(items, ensure_ascii=False, indent=2))


def list_items() -> list[dict[str, str]]:
    return _load_agenda()


def add_item(content: str) -> dict[str, str]:
    items = _load_agenda()
    item = {
        "id": uuid.uuid4().hex,
        "content": content,
        "completed": False,
        "timestamp": datetime.utcnow().isoformat(),
    }
    items.append(item)
    _save_agenda(items)
    return item


def update_item(item_id: str, content: str | None = None, completed: bool | None = None) -> dict[str, str] | None:
    items = _load_agenda()
    for item in items:
        if item["id"] == item_id:
            if content is not None:
                item["content"] = content
            if completed is not None:
                item["completed"] = completed
            _save_agenda(items)
            return item
    return None


def delete_item(item_id: str) -> bool:
    items = _load_agenda()
    new_items = [i for i in items if i["id"] != item_id]
    if len(new_items) == len(items):
        return False
    _save_agenda(new_items)
    return True
