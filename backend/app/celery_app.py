from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List

import httpx
from celery import Celery

from .config import settings

celery_app = Celery(
    "onwrk_ai",
    broker=settings.redis_url,
    backend=settings.redis_url,
)


@celery_app.task
def web_intelligence_task(query: str) -> List[Dict[str, Any]]:
    """Run a Brave web search asynchronously."""
    api_key = settings.brave_api_key
    if not api_key:
        return []
    headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
    params = {"q": query, "count": 3}
    resp = httpx.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers=headers,
        params=params,
        timeout=10.0,
    )
    if resp.status_code != 200:
        return []
    data = resp.json()
    return [
        {"title": item.get("title"), "url": item.get("url")}
        for item in data.get("web", {}).get("results", [])
    ]


@celery_app.task
def cleanup_backups(days: int = 7) -> int:
    """Remove backup files older than the given number of days."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    base = Path(settings.frontend_backup_dir)
    count = 0
    for path in base.glob("*"):
        if path.is_file() and datetime.fromtimestamp(path.stat().st_mtime) < cutoff:
            path.unlink()
            count += 1
    return count


@celery_app.task
def activate_agent(name: str) -> bool:
    """Activate an agent by name."""
    from .agent_manager import manager

    agent = manager.toggle(name, True)
    return agent is not None
