import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai.chat_models.base import OpenAIRateLimitError

from models.schemas import StartupIdea, BoardroomResults

from agents.market import market_research_agent
from agents.competitor import competitor_analysis_agent
from agents.finance import finance_analysis_agent
from agents.risk import risk_analysis_agent
from agents.strategy import strategy_analysis_agent
from agents.validation import validation_agent
from agents.boardroom import boardroom_summary_agent


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Startup Boardroom backend is running",
    }


@app.post("/analyze", response_model=BoardroomResults)
async def analyze_startup(idea: StartupIdea):

    try:
        # Run the five independent analysts in parallel.
        results = await asyncio.gather(
            asyncio.to_thread(market_research_agent, idea),
            asyncio.to_thread(competitor_analysis_agent, idea),
            asyncio.to_thread(finance_analysis_agent, idea),
            asyncio.to_thread(risk_analysis_agent, idea),
            asyncio.to_thread(strategy_analysis_agent, idea),
        )

        (
            market_analysis,
            competitor_analysis,
            finance_analysis,
            risk_analysis,
            strategy_analysis,
        ) = results

        analyses = [
            market_analysis,
            competitor_analysis,
            finance_analysis,
            risk_analysis,
            strategy_analysis,
        ]

        # These two agents depend on the five analyst reports,
        # so they run after the analysts finish.
        validation_report, boardroom_summary = await asyncio.gather(
            asyncio.to_thread(validation_agent, idea, analyses),
            asyncio.to_thread(boardroom_summary_agent, idea, analyses),
        )

        return BoardroomResults(
            startup=idea,
            analyses=analyses,
            validation=validation_report,
            boardroom_summary=boardroom_summary,
        )

    except OpenAIRateLimitError:
        raise HTTPException(
            status_code=429,
            detail=(
                "The AI boardroom has temporarily reached its API request limit. "
                "Please wait for the limit to reset and try again."
            ),
        )

    except Exception as error:
        print("ANALYSIS ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail=(
                "The boardroom encountered an unexpected error while "
                "analyzing the startup."
            ),
        )