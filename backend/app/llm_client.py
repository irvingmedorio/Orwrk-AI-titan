from __future__ import annotations

"""Utility to access local or external LLM providers via a unified API."""

from typing import List, Dict

import httpx

from .config import settings

try:  # Optional imports so the backend can run without these packages installed
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover - library is optional
    OpenAI = None  # type: ignore


class LLMClient:
    """Small helper that routes chat completions to the configured provider."""

    def __init__(self) -> None:
        self.provider = settings.llm_provider.lower()
        self.model = settings.llm_model
        self.endpoint = settings.llm_openai_endpoint

    def update_config(
        self,
        provider: str | None = None,
        model: str | None = None,
        endpoint: str | None = None,
    ) -> None:
        """Update runtime configuration for the client."""
        if provider:
            self.provider = provider.lower()
            settings.llm_provider = provider
        if model:
            self.model = model
            settings.llm_model = model
        if endpoint:
            self.endpoint = endpoint
            settings.llm_openai_endpoint = endpoint

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Generate a chat completion using the selected provider."""
        if self.provider == "openai" and OpenAI and settings.openai_api_key:
            client = OpenAI(api_key=settings.openai_api_key)
            resp = client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
            )
            return resp.choices[0].message.content or ""

        # Default: local llama.cpp OpenAI‑compatible endpoint
        payload = {"model": self.model, "messages": messages}
        resp = httpx.post(self.endpoint, json=payload, timeout=60.0)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


llm_client = LLMClient()
