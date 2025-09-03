<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Onwrk-AI

Everything you need to run this autonomous development studio locally.

## Run Locally

### System Requirements

Install the following programs before cloning the repository:

- **Docker Engine 20.10+** and **Docker Compose 2.0+**
- **Node.js 16+**
- **Python 3.11+**
- At least **8 GB of RAM** and a GPU for optimal LFM2-VL-1.6B performance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-user/Onwrk-AI-titan-1.git
   cd Onwrk-AI-titan-1
   ```
2. Copy environment templates and set your keys:
   ```bash
   cp backend/.env.example backend/.env
   # edit backend/.env and .env.local with API keys and model paths
   ```
   The backend supports local llama.cpp or OpenAI models. Set `LLM_PROVIDER`
   to `local` or `openai` and provide the corresponding `OPENAI_API_KEY`
   in `backend/.env`.
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Download the LFM2-VL-1.6B model file (e.g. `lfm2-vl-1.6b-q4_0.gguf`) and place it in `models/`.
5. Start all services:
   ```bash
   docker-compose up --build
   ```
6. Open the frontend at http://localhost:3000.

### Switching the Local LLM

You can swap the model used by `llama.cpp` without rebuilding the stack:

1. Upload a new `.gguf` file via `POST /api/v1/llm/upload`.
2. Update the active model or endpoint using `POST /api/v1/llm/config`.
3. The current configuration can be retrieved with `GET /api/v1/llm/config`.

Uploaded models are stored under the directory defined by `MODELS_DIR` (default `models/`).

### Create a Local Installation Package

To bundle the project for offline installation, run the packaging script:

```bash
./package_local.sh
```

This builds the frontend, validates the backend, and produces `onwrk-ai-titan-local.tar.gz` in the project root. Transfer the archive to another machine and extract it with `tar -xzf onwrk-ai-titan-local.tar.gz`.

### Development

For frontend-only development without Docker:

1. Run the app:
   ```bash
   npm run dev
   ```

### LFM2-VL-1.6B Model Setup

This project is configured to use the [LFM2-VL-1.6B](https://leap.liquid.ai/models?model=lfm2-vl-1.6b) model with `llama.cpp`.

1. Download the model file (e.g. `lfm2-vl-1.6b-q4_0.gguf`) from Liquid AI and place it in the `models/` directory.
2. The `docker-compose.yml` file starts the `llama.cpp` service with this model, and `.env.example` exposes `LLAMA_CPP_MODEL` to override the path if needed.

## Backend API Overview

The FastAPI backend exposes endpoints to coordinate agents and local processing:

- `POST /api/v1/agents/create` – register a new specialist agent.
- `GET /api/v1/agents/active` – list currently active agents.
- `POST /api/v1/agents/toggle` – enable or disable an agent.
- `POST /api/v1/agents/schedule` – program an activation time.
- `POST /api/v1/auth/register` – create a user account (email, nickname, password hashed with bcrypt).
- `POST /api/v1/auth/login` – verify credentials against the local `AUTH_DB` store.
- `POST /api/v1/web-intelligence` – perform a Brave web search (requires `BRAVE_API_KEY`).
- `POST /api/v1/llm/chat` – send raw messages to the configured LLM provider (local llama.cpp or OpenAI).
- `GET /api/v1/llm/config` – retrieve the active LLM provider, model and endpoint.
- `POST /api/v1/llm/config` – update the LLM provider, model or endpoint at runtime.
- `POST /api/v1/llm/upload` – upload a new `.gguf` model file and switch to it.
- `POST /api/v1/cloud/google` – upload or list files on Google Drive using an OAuth token.
- `POST /api/v1/cloud/onedrive` – upload or list files on OneDrive using an OAuth token.
- `POST /api/v1/files/sync` – persist files to the `frontend-backup` directory (supports base64‑encoded binaries like `.zip`).
- `POST /api/v1/chat/save` – store a chat message for a project; `.zip`, audio or video attachments and media URLs are transcribed and persisted.
- `GET /api/v1/chat/history/{project_id}` – retrieve stored chat history.
- `POST /api/v1/voice-agent/process` – transcribe audio or video from an uploaded file or URL with Whisper.cpp, analyze attachments via the local LFM2-VL-1.6B model, and store artifacts under `frontend-backup/voice-agent`.
- `GET|POST|PUT|DELETE /api/v1/voice-agent/notes` – CRUD endpoints to manage Voice Agent notes separately.
- `POST /api/v1/business-advisor/generate` – generar un plan de negocio a partir de una idea usando el Business Advisor Agent.
- `POST /api/v1/business-advisor/plan` – registrar una "Solicitud de Implementación" y guardar su progreso en `/audit/`.
- `POST /api/v1/business-advisor/check` – reportar el resultado de un paso; la respuesta indica si continúa (`next_step_ready`), finaliza (`plan_completed`) o necesita intervención (`error`).
- `POST /api/v1/sandbox/run` – ejecuta una tarea en un contenedor efímero y devuelve logs de progreso.

Los eventos del Business Advisor se registran en el directorio configurado por `AUDIT_DIR` (por defecto `audit/`).

The `llama.cpp` service exposes an OpenAI-compatible endpoint at `http://localhost:8080/v1/chat/completions` for multimodal LFM2-VL-1.6B inference. AutoGen agents (CodeAgent, ResearchAgent, CloudAgent) are preconfigured to use this local endpoint so all multi-agent conversations execute entirely on-device.
