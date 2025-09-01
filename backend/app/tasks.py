import time
import logging
import json
from typing import Any, Dict, List, Optional, Union
from autogen import Agent, ConversableAgent

from app.core.celery_app import celery_app
from app.agents.team import user_proxy_agent, manager
from app.core.redis_client import sync_redis_client, STREAM_CHANNEL

# Configure logging
logging.basicConfig(level=logging.INFO)

@celery_app.task(bind=True)
def run_agent_chat(self, user_message: str, project_id: str, session_id: str):
    """
    Celery task to run a full agent chat session with real-time streaming.
    """
    logging.info(f"Starting agent chat for session '{session_id}' with message: '{user_message}'")
    self.update_state(state='PROGRESS', meta={'status': 'Initializing agent team...'})

    def _stream_message_to_redis(
        message: Union[Dict, str], recipient: Agent, sender: Agent
    ) -> Union[Dict, str]:
        """
        Callback function to stream agent messages to Redis Pub/Sub.
        """
        # The message content is in the 'content' key
        content = message if isinstance(message, str) else message.get("content")

        # Format the payload for the frontend
        payload = {
            "event": "agent_message",
            "data": {
                "sender": sender.name,
                "recipient": recipient.name,
                "content": content,
            }
        }

        # The data to be published must contain the session_id for routing
        publish_data = {
            "session_id": session_id,
            "payload": payload
        }

        sync_redis_client.publish(STREAM_CHANNEL, json.dumps(publish_data))
        logging.info(f"Published message from {sender.name} to Redis for session {session_id}")

        # Return the original message to continue the AutoGen workflow
        return message

    # Register the reply function to stream all messages.
    # This will call our callback for every message received by the user_proxy_agent.
    user_proxy_agent.register_reply(
        trigger=user_proxy_agent, # The agent that triggers the callback
        reply_func=_stream_message_to_redis,
        position=2, # Position in the reply function list
    )

    try:
        # We need to inject the project_id into the context for the crush_tool.
        message_with_context = f"project_id: {project_id}\n\nUser query: {user_message}"

        # Clear previous chat history for this agent run
        user_proxy_agent.clear_history()

        user_proxy_agent.initiate_chat(
            manager,
            message=message_with_context,
        )
        final_response = "Agent chat finished."
    except Exception as e:
        logging.error(f"An error occurred during agent chat: {e}")
        final_response = f"An error occurred: {e}"
    finally:
        # IMPORTANT: Unregister the reply function to prevent it from being active
        # in subsequent, unrelated tasks that might reuse this agent object.
        user_proxy_agent.unregister_reply(
            trigger=user_proxy_agent,
            reply_func=_stream_message_to_redis
        )
        logging.info("Unregistered streaming callback.")

    logging.info(final_response)

    return {'status': 'COMPLETED', 'final_response': final_response}


@celery_app.task(bind=True)
def run_simulated_agent_task(self, task_name: str, duration: int):
    """
    A sample Celery task that simulates a long-running operation performed by an agent.
    """
    logging.info(f"Starting task: '{task_name}'. Will run for {duration} seconds.")
    self.update_state(state='PROGRESS', meta={'current': 0, 'total': duration, 'status': 'Starting up...'})

    for i in range(duration):
        time.sleep(1)
        status_message = f"Working on step {i+1} of {duration}..."
        self.update_state(state='PROGRESS', meta={'current': i + 1, 'total': duration, 'status': status_message})
        logging.info(f"Task '{task_name}': {status_message}")

    final_message = f"Task '{task_name}' completed successfully."
    logging.info(final_message)
    return {'current': duration, 'total': duration, 'status': final_message, 'result': 42}
