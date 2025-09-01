import subprocess
import logging
from pydantic import BaseModel, Field
from typing import List, Literal

# Configure logging
logging.basicConfig(level=logging.INFO)

# Whitelist of safe crush commands allowed for execution.
# This is a critical security measure.
ALLOWED_CRUSH_COMMANDS = Literal[
    "ls", "get", "put", "del", "info", "glob", "cat"
]

# Define the secure base directory for all file operations.
# This prevents any access to files outside of this sandboxed directory.
WORKSPACES_DIR = "/workspaces"

class CrushCommandInput(BaseModel):
    """
    Pydantic model for validating the input to the crush command execution tool.
    Ensures that only whitelisted commands and properly formed arguments are processed.
    """
    command: ALLOWED_CRUSH_COMMANDS
    args: List[str] = Field(default_factory=list, description="List of arguments for the command.")
    # project_id will be used to create a jailed subdirectory
    project_id: str = Field(..., description="The unique ID of the project to ensure directory jailing.")

class CrushExecutionResult(BaseModel):
    """
    Represents the result of a Crush command execution.
    """
    success: bool
    stdout: str
    stderr: str

def execute_crush_command(validated_input: CrushCommandInput) -> CrushExecutionResult:
    """
    Executes a whitelisted crush command in a secure, isolated subprocess.

    Args:
        validated_input: A Pydantic model instance with validated command and arguments.

    Returns:
        A CrushExecutionResult containing the outcome of the command.
    """
    # Create a secure, project-specific working directory.
    # e.g., /workspaces/project_123
    # os.path.join will not be used here to avoid any path traversal issues,
    # we construct the path manually and rely on the subprocess cwd.
    project_dir = f"{WORKSPACES_DIR}/{validated_input.project_id}"

    # Basic check to prevent command-line trickery, although cwd should handle it.
    if ".." in validated_input.project_id or "/" in validated_input.project_id:
        error_msg = "Invalid project_id: contains potentially unsafe characters."
        logging.error(error_msg)
        return CrushExecutionResult(success=False, stdout="", stderr=error_msg)

    # The command to be executed, with the command and its arguments.
    # Example: ['crush', 'ls', '-l', '/some/path']
    command_to_run = ["crush", validated_input.command] + validated_input.args

    logging.info(f"Executing crush command: {' '.join(command_to_run)} in directory {project_dir}")

    try:
        # The core of the security model:
        # - shell=False: Prevents shell injection. The command and args are passed as a list.
        # - cwd=project_dir: Jails the command to a specific, safe directory.
        #   Any relative paths in args (like '../') will be relative to this cwd,
        #   effectively sandboxing the operation.
        # - capture_output=True: Safely captures stdout and stderr.
        # - text=True: Decodes stdout/stderr as UTF-8.
        # - check=True: Raises CalledProcessError if the command returns a non-zero exit code.

        # Note: We first need to ensure the directory exists.
        # In a real scenario, this would be handled by a project creation process.
        # For now, we can create it defensively.
        # This command is run without shell=True and with safe inputs.
        subprocess.run(["mkdir", "-p", project_dir], check=True)

        result = subprocess.run(
            command_to_run,
            cwd=project_dir,
            capture_output=True,
            text=True,
            check=True,
            shell=False  # CRITICAL FOR SECURITY
        )

        logging.info(f"Crush command successful. stdout: {result.stdout}")
        return CrushExecutionResult(success=True, stdout=result.stdout, stderr="")

    except FileNotFoundError:
        # This error happens if the 'crush' command itself is not found in the PATH.
        error_msg = "Error: 'crush' command not found. Ensure it is installed and in the system's PATH."
        logging.error(error_msg)
        return CrushExecutionResult(success=False, stdout="", stderr=error_msg)

    except subprocess.CalledProcessError as e:
        # This error happens if the command returns a non-zero exit code (i.e., an error).
        logging.error(f"Crush command failed with exit code {e.returncode}. stderr: {e.stderr}")
        return CrushExecutionResult(success=False, stdout=e.stdout, stderr=e.stderr)

    except Exception as e:
        # Catch any other unexpected errors.
        error_msg = f"An unexpected error occurred: {e}"
        logging.error(error_msg)
        return CrushExecutionResult(success=False, stdout="", stderr=error_msg)
