import json

from dotenv import load_dotenv

from utils.llm import get_llm
from models.schemas import (
    StartupIdea,
    AgentAnalysis,
    ValidationReport,
)


load_dotenv(override=True)

llm = get_llm()


def validation_agent(
    idea: StartupIdea,
    analyses: list[AgentAnalysis],
) -> ValidationReport:

    analyses_text = json.dumps(
        [analysis.model_dump() for analysis in analyses],
        indent=2,
    )

    prompt = f"""
You are the Validation Agent for Startup Boardroom.

Your job is to identify the most important assumptions behind the startup
and design practical experiments that can test those assumptions.

Startup:
{idea.name}

Description:
{idea.description}

Analyst reports:
{analyses_text}

Focus on:

- Critical assumptions
- The assumptions that could most seriously cause the startup to fail
- Practical validation experiments
- What metric should be measured
- What result would count as success
- What result would count as failure

Do NOT make the final startup decision.

Do NOT create an overall startup score.

Do NOT average analyst scores.

Return ONLY valid JSON.

The JSON must contain EXACTLY these fields:

{{
  "agent_name": "Validation Agent",
  "critical_assumptions": [],
  "experiments": [],
  "summary": ""
}}

Each item inside "critical_assumptions" must be a string.

Each item inside "experiments" must be an object with EXACTLY these fields:

{{
  "assumption": "",
  "experiment": "",
  "metric": "",
  "success_criteria": "",
  "failure_criteria": ""
}}

Rules:

- critical_assumptions must contain a maximum of 5 strings.
- experiments must contain a maximum of 5 objects.
- All experiment fields must be strings.
- Keep experiments practical and realistic.
- Prefer experiments that can be performed before building a full product.
- Do not invent market statistics.
- Do not invent customer numbers.
- Do not invent revenue figures.
- Do not invent funding figures.
- Do not assume that the startup has already launched.
- If the analyst reports contain unsupported claims, treat them as assumptions
  rather than facts.
- Make success and failure criteria measurable where possible.
- Keep the summary concise.
- Do not produce Markdown.
- Do not produce tables.
- Do not produce code fences.

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

    import json

from models.schemas import (
    StartupIdea,
    AgentAnalysis,
    ValidationReport,
    ValidationExperiment,
)
from utils.llm import get_llm


def validation_agent(
    idea: StartupIdea,
    analyses: list[AgentAnalysis],
) -> ValidationReport:

    llm = get_llm()

    analyses_text = "\n\n".join(
        f"""
AGENT: {analysis.agent_name}
SCORE: {analysis.score}
CONFIDENCE: {analysis.confidence}

STRENGTHS:
{chr(10).join(f"- {item.point}: {item.explanation}" for item in analysis.strengths)}

WEAKNESSES:
{chr(10).join(f"- {item.point}: {item.explanation}" for item in analysis.weaknesses)}

ASSUMPTIONS:
{chr(10).join(f"- {item}" for item in analysis.assumptions)}

UNKNOWNS:
{chr(10).join(f"- {item}" for item in analysis.unknowns)}

WHAT TO TEST:
{chr(10).join(f"- {item.point}: {item.explanation}" for item in analysis.what_to_test)}

BOTTOM LINE:
{analysis.bottom_line}
"""
        for analysis in analyses
    )

    prompt = f"""
You are the Validation Agent in a startup boardroom.

Your job is to identify the most important assumptions behind this startup
and turn them into practical validation experiments.

STARTUP:
Name: {idea.name}
Description: {idea.description}

ANALYST REPORTS:
{analyses_text}

Return ONLY valid JSON.

Use exactly this structure:

{{
  "agent_name": "Validation Agent",
  "critical_assumptions": [
    "short assumption 1",
    "short assumption 2",
    "short assumption 3"
  ],
  "experiments": [
    {{
      "assumption": "short assumption",
      "experiment": "simple experiment",
      "metric": "metric to measure",
      "success_criteria": "clear success condition",
      "failure_criteria": "clear failure condition"
    }}
  ],
  "summary": "short summary"
}}

IMPORTANT:
- Return valid JSON only.
- Do not use markdown.
- Do not wrap the JSON in ``` fences.
- Keep every string short.
- Provide exactly 3 critical assumptions.
- Provide exactly 3 experiments.
- Keep each experiment concise.
- Keep the summary under 40 words.
"""

    response = llm.invoke(prompt)
    content = response.content.strip()

    # Remove accidental markdown fences if the model adds them.
    if content.startswith("```"):
        content = content.replace("```json", "", 1)
        content = content.replace("```", "")
        content = content.strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError as error:
        print("\n========== VALIDATION JSON ERROR ==========")
        print(f"JSON error: {error}")
        print("\nRAW VALIDATION RESPONSE:")
        print(content)
        print("===========================================\n")

        raise ValueError(
            "Validation Agent returned malformed JSON."
        ) from error

    return ValidationReport.model_validate(data)