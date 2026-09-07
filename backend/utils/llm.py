from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

MODEL_NAME = "gpt-5.6-luna"


def get_llm():
    """
    Shared LLM configuration for Startup Boardroom agents.
    """

    return ChatOpenAI(
        model=MODEL_NAME,
        temperature=0,
        max_tokens=500,
        max_retries=0,
    )