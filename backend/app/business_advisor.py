from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from autogen import GroupChat, GroupChatManager, UserProxyAgent

from ..agents.team import BusinessAdvisorAgent, LLM_CONFIG
from .config import settings
from .schemas import ImplementationPlan, StepUpdate
from .audit import log_event

_audit_dir = Path(settings.audit_dir)
_audit_dir.mkdir(parents=True, exist_ok=True)


def _plan_path(plan_id: str) -> Path:
    return _audit_dir / f"plan_{plan_id}.json"


def create_plan(plan: ImplementationPlan) -> ImplementationPlan:
    plan_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    data = plan.model_dump()
    data["id"] = plan_id
    data["steps"] = [s.model_dump() for s in plan.steps]
    path = _plan_path(plan_id)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    log_event(f"Plan {plan_id} creado: {plan.title}")
    return ImplementationPlan.model_validate(data)


def generate_plan(topic: str) -> ImplementationPlan:
    """Use the BusinessAdvisorAgent to produce an implementation plan."""

    user = UserProxyAgent(name="user", human_input_mode="NEVER")
    chat = GroupChat(agents=[user, BusinessAdvisorAgent], messages=[], max_round=2)
    manager = GroupChatManager(groupchat=chat, llm_config=LLM_CONFIG)
    user.initiate_chat(manager, message=topic)
    for msg in reversed(chat.messages):
        if msg.get("role") == "assistant":
            try:
                data = json.loads(msg.get("content", "{}"))
                return ImplementationPlan.model_validate(data)
            except Exception:  # pragma: no cover - model may output non-JSON
                continue
    raise ValueError("Plan generation failed")


def update_step(payload: StepUpdate) -> str:
    path = _plan_path(payload.plan_id)
    if not path.exists():
        raise ValueError("Plan not found")
    data = json.loads(path.read_text(encoding="utf-8"))
    steps = data.get("steps", [])
    if payload.step_index < 0 or payload.step_index >= len(steps):
        raise ValueError("Invalid step index")
    step = steps[payload.step_index]
    step["completed"] = payload.success
    step["result"] = payload.details
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    if payload.success:
        log_event(f"Plan {payload.plan_id} paso {payload.step_index} completado")
        if payload.step_index + 1 < len(steps):
            return "next_step_ready"
        return "plan_completed"
    log_event(
        f"Plan {payload.plan_id} error en paso {payload.step_index}: {payload.details}"
    )
    return "error"
