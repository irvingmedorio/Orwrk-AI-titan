from __future__ import annotations

from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .agent_manager import manager

scheduler = AsyncIOScheduler()


def _check_schedules() -> None:
    """Activate agents whose scheduled time has arrived."""
    now = datetime.utcnow()
    for agent in manager._agents.values():
        if agent.scheduled and not agent.active and agent.scheduled <= now:
            agent.active = True
            agent.scheduled = None


def start_scheduler() -> None:
    """Start the background scheduler."""
    scheduler.add_job(_check_schedules, "interval", seconds=60, id="agent_scheduler")
    scheduler.start()

