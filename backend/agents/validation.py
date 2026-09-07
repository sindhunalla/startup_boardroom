from dotenv import load_dotenv
from utils.llm import get_llm

from models.schemas import (
    StartupIdea,
    AgentAnalysis,
    ValidationReport,
)


load_dotenv(override=True)


llm = get_llm().with_structured_output(AgentAnalysis)


def validation_agent(
    idea: StartupIdea,
    analyses: list[AgentAnalysis],
) -> ValidationReport:

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

WHAT TO TEST:
{analysis.what_to_test}

BOTTOM LINE:
{analysis.bottom_line}
"""
            for analysis in analyses
        ]
    )

    prompt = f"""
You are the Validation Agent for Startup Boardroom.

Your job is to turn the five analyst reports into practical validation experiments.

Startup name:
{idea.name}

Startup description:
{idea.description}

Analyst reports:
{analyses}

Identify:
- The most critical assumptions behind the startup
- Which assumptions are most dangerous if wrong
- Practical experiments to test them
- A measurable metric for each experiment
- Clear success criteria
- Clear failure criteria

Rules:
- Do not invent market statistics or factual evidence.
- Base your recommendations on the startup idea and analyst reports.
- Prioritize a small number of high-impact assumptions.
- Experiments should be realistic for an early-stage founder.
- Do not give the startup a score.
- Keep the recommendations concise.

Return a structured ValidationReport.
"""
    return llm.invoke(prompt)