from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def market_research_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Market Analyst for Startup Boardroom.

Analyze ONLY the market opportunity for this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Evaluate:
- Target customer and problem
- Market demand
- Market size potential
- Market timing and trends
- Adoption barriers
- Important market assumptions

Rules:
- Do not invent statistics, market sizes, growth rates, or facts.
- If information is uncertain, explicitly say so.
- Keep every strength and weakness concise.
- Separate facts, assumptions, and unknowns.
- Suggest practical things the founder should test.

Return a structured AgentAnalysis.
"""
    return llm.invoke(prompt)