import json

from dotenv import load_dotenv

from utils.llm import get_llm
from models.schemas import StartupIdea, AgentAnalysis


load_dotenv(override=True)

llm = get_llm()


def market_research_agent(idea: StartupIdea) -> AgentAnalysis:

    prompt = f"""
You are the Market Analyst (Optimist) for Startup Boardroom.

Analyze ONLY the market opportunity for this startup.

Startup name:
{idea.name}

Startup description:
{idea.description}

Focus on:
- Target customer and problem
- Market demand
- Market size potential
- Market timing and trends
- Adoption barriers
- Important market assumptions
- What should be tested

Do NOT invent statistics, market sizes, growth rates, users,
revenue, funding, or other unsupported facts.

If specific market information is unavailable, say so clearly
and discuss the opportunity qualitatively.

Return ONLY one valid JSON object.

The JSON must have EXACTLY these fields:

{{
  "agent_name": "Market Analyst (Optimist)",
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
- Do not invent facts.
- Clearly distinguish assumptions from known information.
- Be optimistic but realistic.
- bottom_line must be a short market conclusion.

IMPORTANT JSON RULES:

- Use double quotes for all JSON keys and string values.
- Do NOT use single quotes.
- Do NOT add trailing commas.
- Do NOT use Markdown.
- Do NOT use tables.
- Do NOT use code fences.
- Do NOT write anything before or after the JSON object.
- Make sure every opening brace has a matching closing brace.
- Make sure every opening bracket has a matching closing bracket.

IMPORTANT:

Every object inside strengths, weaknesses, and what_to_test MUST have
this exact structure:

{{
  "point": "short statement",
  "explanation": "short explanation"
}}

Return ONLY the JSON object.
"""

    response = llm.invoke(prompt)

    content = response.content

    if not isinstance(content, str):
        content = str(content)

    content = content.strip()

    # Remove Markdown code fences if the model adds them.
    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    # Extract JSON object if the model adds extra text.
    start = content.find("{")
    end = content.rfind("}")

    if start != -1 and end != -1:
        content = content[start:end + 1]

    try:
        data = json.loads(content)

    except json.JSONDecodeError as error:
        print("\n========== MARKET JSON ERROR ==========")
        print("JSON parsing failed.")
        print(f"Error: {error}")
        print("\nModel response:")
        print(content)
        print("=======================================\n")

        raise

    return AgentAnalysis.model_validate(data)