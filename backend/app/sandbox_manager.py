"""Sandbox manager to execute tasks in ephemeral Docker containers."""
from __future__ import annotations

from datetime import datetime
import uuid
from pathlib import Path
import logging
import asyncio

import docker

from .config import settings
from .ws_manager import ws_manager

logger = logging.getLogger(__name__)


class SandboxManager:
    """Launches ephemeral containers to run tasks in isolation."""

    def __init__(self) -> None:
        self.client = docker.from_env()
        self.image = settings.sandbox_image
        self.logs_dir = Path(settings.logs_dir) / "sandbox"
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    def run_task(self, task: str) -> list[str]:
        """Run a simple script inside a temporary container.

        Parameters
        ----------
        task: str
            High-level task description that will be echoed inside the container.
        """
        progress: list[str] = []
        log_file = self.logs_dir / f"{datetime.utcnow().isoformat()}_{uuid.uuid4().hex}.log"
        progress.append("🧪 Iniciando entorno de pruebas...")
        asyncio.run(ws_manager.broadcast("🧪 Iniciando entorno de pruebas..."))
        container = None
        try:
            container = self.client.containers.run(
                self.image,
                ["bash", "-lc", f"echo '{task}'"],
                detach=True,
                tty=True,
            )
            progress.append("🔧 Ejecutando tarea en sandbox...")
            asyncio.run(ws_manager.broadcast("🔧 Ejecutando tarea en sandbox..."))
            result = container.wait()
            logs = container.logs().decode()
            log_file.write_text(logs)
            progress.append("✅ Tarea completada")
            asyncio.run(ws_manager.broadcast("✅ Tarea completada"))
        except docker.errors.DockerException as exc:
            msg = f"Error de sandbox: {exc}"
            progress.append(f"❌ {msg}")
            asyncio.run(ws_manager.broadcast(f"❌ {msg}"))
            logger.error(msg)
        finally:
            if container is not None:
                container.remove(force=True)
        return progress
