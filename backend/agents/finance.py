from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def finance_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Finance Analyst (CFO) for Startup Boardroom.

Analyze ONLY the financial and business-model viability of this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Evaluate:
- Revenue model
- Pricing and monetization logic
- Cost structure
- Gross-margin potential
- Customer acquisition economics
- LTV/CAC considerations
- Break-even path
- Capital intensity
- Important financial assumptions

Rules:
- Do not invent financial figures, CAC, LTV, margins, revenue, or break-even numbers.
- Use qualitative reasoning when numerical data is unavailable.
- Clearly distinguish facts, assumptions, and unknowns.
- Keep strengths and weaknesses concise.
- Suggest practical things the founder should test.

Return a structured AgentAnalysis.
"""
    return llm.invoke(prompt)