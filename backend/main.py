import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
@app.post("/svc/api/analyze", response_model=BoardroomResults)
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

        # IMPORTANT:
        # Run these one at a time so they don't compete for
        # Groq's tokens-per-minute limit.
        validation_report = await asyncio.to_thread(
            validation_agent,
            idea,
            analyses,
        )

        # Small pause to allow the Groq TPM window to recover.
        await asyncio.sleep(2)

        boardroom_summary = await asyncio.to_thread(
            boardroom_summary_agent,
            idea,
            analyses,
        )

        return BoardroomResults(
            startup=idea,
            analyses=analyses,
            validation=validation_report,
            boardroom_summary=boardroom_summary,
        )

    except Exception as error:
        import traceback

        print("\n========== ANALYSIS ERROR ==========")
        print(repr(error))
        traceback.print_exc()
        print("====================================\n")

        raise HTTPException(
            status_code=500,
            detail=(
                "The boardroom encountered an unexpected error while "
                "analyzing the startup."
            ),
        )
