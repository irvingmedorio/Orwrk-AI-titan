import os
import autogen
from autogen.agentchat.contrib.llm_proxy import LLMProxy
from app.agents.tools_definition import crush_file_system_tool, web_search_tool

# LLM Configuration
# Point to the OpenAI-compatible server run by the llama-cpp-python docker container
# The API key is not required for the local server but is good practice to include
config_list = [
    {
        "model": os.getenv("LLAMA_CPP_MODEL", "LFM2-1.2B-Q4_0.gguf"), # Model name is for reference
        "api_key": "not-required",
        "base_url": os.getenv("LLAMA_CPP_HOST", "http://llama-cpp:8080") + "/v1",
    }
]

llm_config = {
    "config_list": config_list,
    "cache_seed": 42, # Use a seed for caching responses
}

# 1. Define the Research Agent
research_agent = autogen.ConversableAgent(
    name="ResearchAgent",
    system_message="""You are a Research Agent. Your job is to find information on the web.
    You must use the WebSearchTool to answer questions.
    After finding the information, report it back to the planner.""",
    llm_config=llm_config,
    human_input_mode="NEVER",
    # Do not register the tool here, the UserProxyAgent will execute it
)

# 2. Define the Code Agent
code_agent = autogen.ConversableAgent(
    name="CodeAgent",
    system_message="""You are a Code Agent. Your job is to perform file system operations.
    You must use the CrushFileSystemTool for ANY file system access (ls, cat, put, etc).
    You are not allowed to write or execute any other shell commands.
    When asked to write a file, use the 'put' command with the content as an argument.
    Example: crush put my_file.py "print('hello world')"
    Provide the project_id for all operations.
    Report the result of your operation back to the planner.""",
    llm_config=llm_config,
    human_input_mode="NEVER",
)

# 3. Define the User Proxy Agent (Planner)
# This agent acts as the user's proxy. It can execute tools on behalf of other agents.
user_proxy_agent = autogen.UserProxyAgent(
    name="Planner",
    human_input_mode="TERMINATE", # 'TERMINATE' means the user will be prompted for input when the conversation ends.
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config=False, # We are not executing code directly from markdown
    system_message="""You are the Planner. You orchestrate the other agents.
    You receive requests from the user and create a plan.
    You can delegate tasks to the ResearchAgent or CodeAgent.
    When a tool needs to be executed, you are the one to call it.
    Summarize the final result for the user.""",
)

# Register the tools with the proxy agent that will execute them
# This is a secure pattern where the LLM-powered agents SUGGEST the tool call,
# and a designated agent (the user proxy) executes it.
# We can add a human confirmation step here later.
user_proxy_agent.register_function(
    function_map={
        crush_file_system_tool.name: crush_file_system_tool._run,
        web_search_tool.name: web_search_tool._run,
    }
)

# 4. Create the Group Chat and Manager
groupchat = autogen.GroupChat(
    agents=[user_proxy_agent, research_agent, code_agent],
    messages=[],
    max_round=12
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# This setup creates a basic multi-agent team that can be used for tasks.
# We can now initiate a chat with this team.
# Example:
# user_proxy_agent.initiate_chat(
#     manager,
#     message="List all files in the root of project 'test-project'."
# )
