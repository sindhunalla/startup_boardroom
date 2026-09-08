import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv(override=True)

MODEL_NAME = "openai/gpt-oss-20b"


def get_llm():
    """
    Create the shared Groq LLM configuration used by
    all Startup Boardroom agents.
    """
    return ChatGroq(
        model=MODEL_NAME,
        temperature=0,
        max_tokens=2500,
        max_retries=2,
    )