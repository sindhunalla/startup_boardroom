from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import (
    StartupIdea,
    AgentAnalysis,
    BoardroomSummary,
)


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def boardroom_summary_agent(
    idea: StartupIdea,
    analyses: list[AgentAnalysis],
) -> BoardroomSummary:

    analyst_context = "\n\n".join(
        [
            f"""
ANALYST: {analysis.agent_name}

SCORE: {analysis.score}/10
CONFIDENCE: {analysis.confidence}

STRENGTHS:
{analysis.strengths}

WEAKNESSES:
{analysis.weaknesses}

ASSUMPTIONS:
{analysis.assumptions}

UNKNOWNS:
{analysis.unknowns}

BOTTOM LINE:
{analysis.bottom_line}
"""
            for analysis in analyses
        ]
    )

    prompt = f"""
You are the Boardroom Summary Agent for Startup Boardroom.

Your job is to synthesize the five independent analyst reports without making the final decision.

Startup name:
{idea.name}

Startup description:
{idea.description}

Analyst reports:
{analyses}

Identify:
- The strongest area across the reports
- The weakest area
- The biggest disagreement between analysts
- The most important unanswered question
- A concise summary of what the founder should understand

Rules:
- Do not average or combine analyst scores into a final score.
- Do not declare the startup a winner or loser.
- Preserve meaningful disagreement between analysts.
- Do not invent facts or statistics.
- Base the summary only on the provided reports.
- Keep the synthesis concise.

Return a structured BoardroomSummary.
"""
    return llm.invoke(prompt)