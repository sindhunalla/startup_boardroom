from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def competitor_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Competition Analyst for Startup Boardroom.

Analyze ONLY the competitive landscape for this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Evaluate:
- Direct competitors
- Indirect alternatives
- Existing substitutes
- Competitive differentiation
- Switching costs and defensibility
- Likely competitive threats
- Important competitive assumptions

Rules:
- Do not invent competitor revenue, users, funding, market share, or other statistics.
- If a specific competitor cannot be identified confidently, discuss the relevant competitor category instead.
- Do not pretend uncertain information is factual.
- Keep strengths and weaknesses concise.
- Separate facts, assumptions, and unknowns.
- Suggest practical things the founder should test.

Return a structured AgentAnalysis.
"""

    return llm.invoke(prompt)