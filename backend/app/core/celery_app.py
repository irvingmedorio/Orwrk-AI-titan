import os
from celery import Celery
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the broker URL from environment variables
# The default is for running inside Docker with the 'redis' service name.
celery_broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
celery_result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Create the Celery application instance
# The first argument is the name of the current module.
# The 'backend' argument specifies where Celery should look for tasks.
celery_app = Celery(
    "Onwrk-AI-Worker",
    broker=celery_broker_url,
    backend=celery_result_backend,
    include=["app.tasks"]  # List of modules to import when the worker starts.
)

# Optional configuration
celery_app.conf.update(
    task_track_started=True,
)
