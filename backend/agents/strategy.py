import json

from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)


llm = get_llm()


def strategy_analysis_agent(idea: StartupIdea) -> AgentAnalysis:
    prompt = f"""
You are the Strategy Analyst (Operator) for Startup Boardroom.

Analyze ONLY how this startup could build, launch, and gain an advantage.

Startup name:
{idea.name}

Startup description:
{idea.description}

Focus on:
- Best initial customer segment
- Positioning
- Go-to-market
- Distribution strategy
- Product strategy
- Potential moat or defensibility
- Key execution challenges
- Strategic assumptions
- Highest-priority actions

Return ONLY valid JSON.

The JSON must contain EXACTLY these fields:

{{
  "agent_name": "Strategy Analyst (Operator)",
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
- evidence must contain strings.
- assumptions must contain strings.
- unknowns must contain strings.
- Keep every list to a maximum of 3 items.
- Keep explanations concise.
- Do not invent statistics, customer numbers, market data, revenue, funding, or other facts.
- Clearly distinguish assumptions from known information.
- Be practical and actionable.
- bottom_line must be a short strategic conclusion.

Return ONLY the JSON object.
"""

    response = llm.invoke(prompt)

    content = response.content

    if not isinstance(content, str):
        content = str(content)

    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]

    if content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    data = json.loads(content)

    return AgentAnalysis.model_validate(data)