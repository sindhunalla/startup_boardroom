from typing import List

from pydantic import BaseModel, Field


class StartupIdea(BaseModel):
    name: str
    description: str


class AnalysisPoint(BaseModel):
    point: str
    explanation: str


class AgentAnalysis(BaseModel):
    agent_name: str

    score: float = Field(..., ge=0, le=10)
    confidence: float = Field(..., ge=0, le=1)

    strengths: List[AnalysisPoint] = Field(default_factory=list)
    weaknesses: List[AnalysisPoint] = Field(default_factory=list)

    evidence: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    unknowns: List[str] = Field(default_factory=list)

    what_to_test: List[str] = Field(default_factory=list)

    bottom_line: str


class ValidationExperiment(BaseModel):
    assumption: str
    experiment: str
    metric: str
    success_criteria: str
    failure_criteria: str


class ValidationReport(BaseModel):
    agent_name: str = "Validation Agent"

    critical_assumptions: List[str] = Field(default_factory=list)

    experiments: List[ValidationExperiment] = Field(
        default_factory=list
    )

    summary: str

class BoardroomSummary(BaseModel):
    strongest_area: str
    weakest_area: str
    biggest_disagreement: str
    key_question: str
    summary: str

class BoardroomResults(BaseModel):
    startup: StartupIdea
    analyses: List[AgentAnalysis]
    validation: ValidationReport
    boardroom_summary: BoardroomSummary