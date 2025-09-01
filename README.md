# Onwrk-AI: The Autonomous AI Agent Studio

Welcome to Onwrk-AI, a full-stack, locally-run, and security-focused platform for orchestrating teams of AI agents. This project provides a sophisticated frontend and a powerful Python backend, all containerized with Docker for easy setup and deployment.

The system is designed around a core philosophy of security and user control, featuring a sandboxed file system tool, explicit user confirmations for critical actions (planned), and a flexible, multi-agent architecture powered by Microsoft AutoGen.

## Architecture Overview

The entire system is orchestrated by Docker Compose and consists of the following services:

- **Frontend:** A React/Vite/TypeScript application providing a rich user interface for interacting with the agents, viewing system metrics, and managing tasks. Served by NGINX.
- **Backend API:** A Python FastAPI application that serves the API, manages WebSocket connections for real-time communication, and orchestrates background tasks.
- **Celery Worker:** A background worker process (using Celery) that executes long-running agent tasks, ensuring the API remains responsive.
- **Redis:** Acts as the message broker for Celery and can be used for caching.
- **ChromaDB:** A vector database used to provide long-term memory for the AI agents.
- **Llama.cpp Server:** A dedicated service to run a local Large Language Model (GGUF format) with an OpenAI-compatible API, allowing for private and efficient LLM inference.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker Engine:** Version 20.10+
- **Docker Compose:** Version 2.0+
- **Git:** For cloning the repository.
- **A GGUF-compatible LLM model file:** The project is configured to use a model from Liquid AI's LEAP library, such as **LFM2-1.2B**. You can find models at [https://leap.liquid.ai/models](https://leap.liquid.ai/models).

## Environment Preparation

Follow these steps carefully to set up your local environment.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/onwrk-ai.git
cd onwrk-ai
```

### 2. Create the Model Directory

The Llama.cpp server needs a place to find your LLM.

```bash
mkdir models
```

Download your chosen GGUF model file and place it inside this newly created `./models` directory.

### 3. Configure Environment Variables

The backend requires a `.env` file for configuration and secrets.

```bash
# Navigate to the backend directory
cd backend

# Copy the example file
cp .env.example .env
```

Now, open `backend/.env` in a text editor and configure the variables. **The most critical variable is `LLAMA_CPP_COMMAND`**.

- **LLAMA_CPP_COMMAND**: You **must** update this to point to the model file you downloaded. The configuration defaults to the recommended model. For example:
  ```
  LLAMA_CPP_COMMAND="--model /models/LFM2-1.2B.gguf --host 0.0.0.0 --port 8080"
  ```
- **Other Variables**: The default values for `CELERY_BROKER_URL`, `CHROMA_DB_HOST`, etc., are configured to work within the Docker network and generally do not need to be changed.

## Deployment

With the environment prepared, you can launch the entire application stack with a single command from the root directory of the project.

```bash
# Make sure you are in the root directory of the project
docker-compose up --build
```

- `--build`: This flag tells Docker Compose to build the images from the Dockerfiles the first time you run it or if you make any changes to the Dockerfiles or application code.
- It may take some time to download all the Docker images and build the containers on the first run.

Once all services are running, you can access the application:

- **Frontend UI:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

## How It Works

1.  The user interacts with the **Frontend** UI.
2.  Chat messages and commands are sent to the **Backend API** via WebSockets.
3.  The API triggers a long-running agent task using the **Celery Worker**.
4.  The agents, running in the background, use the **Llama.cpp Server** to think and reason.
5.  For file system operations, the `CodeAgent` uses the secure `CrushFileSystemTool`, which runs sandboxed commands.
6.  For memory, agents can (in a future implementation) store and retrieve information from the **ChromaDB** vector store.
7.  During the conversation, the **Celery Worker** publishes every intermediate agent message to a **Redis** Pub/Sub channel.
8.  The **Backend API**'s Redis listener picks up these messages and streams them in real-time to the correct user session on the **Frontend** via WebSockets.
---
*Note on the LLM Service*: The `llama-cpp` service uses a public image from Docker Hub (`phidata/llama-cpp-python`) to ensure reliability.

## Testing the Backend

You can use the automatically generated API documentation (Swagger UI) to test the backend endpoints:

1.  Navigate to [http://localhost:8000/docs](http://localhost:8000/docs).
2.  Use the `/api/tasks/run-simulation` endpoint to test the Celery worker.
3.  Use the `/api/memory` endpoints to test the ChromaDB connection.
4.  To test the full agent flow, you'll need a WebSocket client (like the application's UI) to send a `chat_message` event. The client must connect to `/ws/{session_id}` where `session_id` is a unique identifier for the chat session (e.g., `/ws/my-test-session-123`). The body of the message should be a JSON object like:
    ```json
    {
      "event": "chat_message",
      "data": {
        "text": "List all files in project 'test-project'.",
        "project_id": "test-project"
      }
    }
    ```
    You will then receive an `ack` message with a `task_id`, followed by a stream of `agent_message` events.
