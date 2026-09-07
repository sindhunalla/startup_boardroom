from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def strategy_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Strategy Analyst (Operator) for Startup Boardroom.

Analyze ONLY how this startup could build, launch, and gain an advantage.

Startup name:
{idea.name}

Startup description:
{idea.description}

Evaluate:
- Best initial customer segment
- Strongest positioning
- Go-to-market approach
- Distribution strategy
- Product strategy
- Potential moat or defensibility
- Key execution challenges
- Most important strategic assumptions
- Highest-priority actions

Rules:
- Be practical and actionable.
- Do not invent statistics, customer numbers, market data, or other facts.
- Clearly distinguish facts, assumptions, and unknowns.
- Prioritize the few actions that matter most.
- Keep strengths and weaknesses concise.
- Suggest practical things the founder should test.

Return a structured AgentAnalysis.
"""

    return llm.invoke(prompt)