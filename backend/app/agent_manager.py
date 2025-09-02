from datetime import datetime
from typing import Dict, List

from .schemas import AgentState


class AgentManager:
    """Simple in-memory manager for agent state."""

    def __init__(self) -> None:
        self._agents: Dict[str, AgentState] = {}

    def create(self, name: str, description: str | None = None) -> AgentState:
        agent = AgentState(name=name, description=description or "")
        self._agents[name] = agent
        return agent

    def list_active(self) -> List[AgentState]:
        return [agent for agent in self._agents.values() if agent.active]

    def toggle(self, name: str, active: bool) -> AgentState | None:
        agent = self._agents.get(name)
        if agent:
            agent.active = active
        return agent

    def schedule(self, name: str, start_time: datetime) -> AgentState | None:
        agent = self._agents.get(name)
        if agent:
            agent.scheduled = start_time
        return agent


manager = AgentManager()
