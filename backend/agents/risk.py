import json

from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm()


def risk_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Risk Analyst (Contrarian) for Startup Boardroom.

Analyze ONLY the risks and failure modes of this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Focus on:
- Market risks
- Business-model risks
- Execution risks
- Customer adoption risks
- Competition risks
- Operational risks
- Regulatory or compliance risks
- Important unknowns
- Assumptions that could be wrong
- What the founder should test

Return ONLY valid JSON.

The JSON must contain EXACTLY these fields:

{{
  "agent_name": "Risk Analyst (Contrarian)",
  "score": 0,
  "confidence": 0.0,
  "strengths": [],
  "weaknesses": [],
  "evidence": [],
  "assumptions": [],
  "unknowns": [],
  "what_to_test": [],
  "bottom_line": ""
}}

Rules:

- score must be a number from 0 to 10.
- confidence must be a number from 0 to 1.
- strengths must contain objects with "point" and "explanation".
- weaknesses must contain objects with "point" and "explanation".
- what_to_test must contain objects with "point" and "explanation".
- evidence, assumptions, and unknowns must contain strings.
- Keep every list to a maximum of 3 items.
- Keep explanations concise.
- Do not invent statistics or market data.
- Do not invent competitor revenue, users, funding, or market share.
- Clearly distinguish assumptions from known information.
- A score of 10 means relatively low risk.
- A score of 0 means extremely high risk.
- bottom_line must be a short risk-focused conclusion.

Return ONLY the JSON object.
"""

    response = llm.invoke(prompt)

    content = response.content

    if not isinstance(content, str):
        content = str(content)

    content = content.strip()

    # Remove accidental markdown code fences.
    if content.startswith("```json"):
        content = content[7:]

    if content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    data = json.loads(content)

    return AgentAnalysis.model_validate(data)