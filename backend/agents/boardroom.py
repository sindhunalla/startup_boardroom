import json

from dotenv import load_dotenv

from utils.llm import get_llm
from models.schemas import (
    StartupIdea,
    AgentAnalysis,
    BoardroomSummary,
)


load_dotenv(override=True)

llm = get_llm()


def boardroom_summary_agent(
    idea: StartupIdea,
    analyses: list[AgentAnalysis],
) -> BoardroomSummary:

    analyses_text = json.dumps(
        [analysis.model_dump() for analysis in analyses],
        indent=2,
    )

    prompt = f"""
You are the Boardroom Summary Agent for Startup Boardroom.

Your job is to synthesize the five independent analyst reports.

Startup:
{idea.name}

Description:
{idea.description}

Analyst reports:
{analyses_text}

Your job is NOT to make the final startup decision.

Do NOT average the analyst scores.

Instead identify:

- The strongest area across the reports
- The weakest area across the reports
- The biggest disagreement between analysts
- The most important unanswered question
- A concise neutral founder takeaway

IMPORTANT:

The founder must remain the final decision-maker.

Do not say "build it", "don't build it", "invest", or "reject"
as a definitive recommendation.

Return ONLY valid JSON.

The JSON must contain EXACTLY these fields:

{{
  "strongest_area": "",
  "weakest_area": "",
  "biggest_disagreement": "",
  "key_question": "",
  "summary": ""
}}

Rules:

- All five fields must be strings.
- strongest_area should identify the strongest recurring positive signal.
- weakest_area should identify the biggest weakness or concern.
- biggest_disagreement should explain where analysts disagree.
- key_question should identify the most important unanswered question.
- summary should be concise and neutral.
- Do not invent facts or statistics.
- Do not introduce information that is not present in the startup description
  or analyst reports.
- Do not calculate or average scores.
- Do not produce Markdown.
- Do not produce a table.
- Do not include code fences.

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

    return BoardroomSummary.model_validate(data)