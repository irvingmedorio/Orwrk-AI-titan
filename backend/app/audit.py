from datetime import datetime
from pathlib import Path

from .config import settings

_audit_dir = Path(settings.audit_dir)
_audit_dir.mkdir(parents=True, exist_ok=True)
_log_file = _audit_dir / "audit.log"


def log_event(message: str) -> None:
    """Append an event with timestamp to the audit log."""
    ts = datetime.utcnow().isoformat()
    with open(_log_file, "a", encoding="utf-8") as f:
        f.write(f"{ts} {message}\n")
