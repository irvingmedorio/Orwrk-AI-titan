from langchain.tools import StructuredTool
from app.tools.crush_tool import execute_crush_command, CrushCommandInput, CrushExecutionResult

# This is the bridge between our securely implemented Python function
# and the LangChain/AutoGen framework.

# By wrapping `execute_crush_command` in a StructuredTool and providing
# the `CrushCommandInput` as the args_schema, we ensure that the LLM
# can only call this tool by providing arguments that pass Pydantic validation.
# This prevents a wide range of injection and misuse attacks.

crush_file_system_tool = StructuredTool.from_function(
    func=execute_crush_command,
    name="CrushFileSystemTool",
    description="""
    Use this tool to interact with the file system.
    It allows you to perform safe file operations like listing files (ls),
    reading files (cat, get), writing files (put), and deleting files (del).
    All operations are jailed to a secure project-specific directory.
    You must provide a `project_id` for all operations.
    """,
    args_schema=CrushCommandInput,
    # The return type can also be specified for better type hinting and parsing
    # return_schema=CrushExecutionResult
)

# In the future, other tools can be defined here:
# e.g., google_drive_tool, onedrive_tool, web_search_tool, etc.

# A simple tool for the research agent
def web_search(query: str) -> str:
    """A tool for searching the web. For now, it returns dummy data."""
    return f"Search results for '{query}':\n1. The history of AI.\n2. Latest trends in LLMs."

web_search_tool = StructuredTool.from_function(
    func=web_search,
    name="WebSearchTool",
    description="Use this tool to search the web for information."
)
