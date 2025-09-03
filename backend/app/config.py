from pydantic import BaseSettings, Field, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    llm_host: str = Field("http://llama-cpp:8080", env="LLAMA_CPP_HOST")
    llm_model: str = Field("/models/lfm2-vl-1.6b-q4_0.gguf", env="LLAMA_CPP_MODEL")
    llm_openai_endpoint: str = Field(
        "http://llama-cpp:8080/v1/chat/completions", env="LLAMA_CPP_OPENAI_ENDPOINT"
    )
    llm_provider: str = Field("local", env="LLM_PROVIDER")
    models_dir: str = Field("models", env="MODELS_DIR")
    openai_api_key: str | None = Field(None, env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4o-mini", env="OPENAI_MODEL")
    redis_url: str = Field("redis://redis:6379/0", env="REDIS_URL")
    chroma_url: str = Field("http://chromadb:8000", env="CHROMA_URL")
    frontend_backup_dir: str = Field("frontend-backup", env="FRONTEND_BACKUP_DIR")
    voice_agent_dir: str = Field(
        "frontend-backup/voice-agent", env="VOICE_AGENT_DIR", description="Storage for voice agent data"
    )
    brave_api_key: str | None = Field(None, env="BRAVE_API_KEY")
    whisper_cpp_bin: str = Field("whispercpp", env="WHISPER_CPP_BIN")
    whisper_cpp_model: str = Field("ggml-base.en.bin", env="WHISPER_CPP_MODEL")
    google_api_token: str | None = Field(None, env="GOOGLE_API_TOKEN")
    onedrive_api_token: str | None = Field(None, env="ONEDRIVE_API_TOKEN")
    sandbox_image: str = Field("python:3.11-slim", env="SANDBOX_IMAGE")
    logs_dir: str = Field("logs", env="LOGS_DIR")
    audit_dir: str = Field("audit", env="AUDIT_DIR")
    auth_db: str = Field("auth/users.json", env="AUTH_DB")


settings = Settings()
