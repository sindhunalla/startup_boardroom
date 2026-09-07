from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def risk_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Risk Analyst (Contrarian) for Startup Boardroom.

Analyze ONLY the risks and failure modes of this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Evaluate:
- Biggest business risks
- Customer adoption risks
- Operational risks
- Technical risks
- Regulatory or compliance risks
- Competitive risks
- Scalability risks
- Important risk assumptions
- What could cause the startup to fail

Rules:
- Be skeptical and specific.
- Do not invent statistics, regulations, incidents, or other facts.
- If a risk depends on unknown information, label it as an assumption or unknown.
- Score risk from 0 to 10, where 10 means relatively low risk and 0 means extremely high risk.
- Keep strengths and weaknesses concise.
- Suggest practical things the founder should test.

Return a structured AgentAnalysis.
"""

    return llm.invoke(prompt)