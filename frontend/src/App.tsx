import { useState } from "react"

type AnalysisPoint = {
  point: string
  explanation: string
}

type AgentAnalysis = {
  agent_name: string
  score: number
  confidence: number
  strengths: AnalysisPoint[]
  weaknesses: AnalysisPoint[]
  evidence: string[]
  assumptions: string[]
  unknowns: string[]
  what_to_test: string[]
  bottom_line: string
}

type ValidationExperiment = {
  assumption: string
  experiment: string
  metric: string
  success_criteria: string
  failure_criteria: string
}

type ValidationReport = {
  agent_name: string
  critical_assumptions: string[]
  experiments: ValidationExperiment[]
  summary: string
}

type BoardroomSummary = {
  strongest_area: string
  weakest_area: string
  biggest_disagreement: string
  key_question: string
  summary: string
}

type AnalysisResponse = {
  startup: {
    name: string
    description: string
  }
  analyses: AgentAnalysis[]
  validation: ValidationReport
  boardroom_summary: BoardroomSummary
}

type AgentConfig = {
  icon: string
  label: string
  role: string
  quote: string
  bg: string
  accent: string
  number: string
}

const agentConfig: Record<string, AgentConfig> = {
  "Market Research Agent": {
    icon: "↗",
    label: "MARKET",
    role: "The Optimist",
    quote: "Is there actually a hungry customer here?",
    bg: "bg-[#DDF0F2]",
    accent: "bg-[#8BCBD2]",
    number: "01",
  },

  "Competitor Analysis Agent": {
    icon: "×",
    label: "COMPETITION",
    role: "The Skeptic",
    quote: "Someone is probably already doing this.",
    bg: "bg-[#F8D8CE]",
    accent: "bg-[#F27D68]",
    number: "02",
  },

  "Finance Analysis Agent": {
    icon: "$",
    label: "FINANCE",
    role: "The CFO",
    quote: "Cool idea. But do the numbers work?",
    bg: "bg-[#F5E6A9]",
    accent: "bg-[#D9B72D]",
    number: "03",
  },

  "Risk Analysis Agent": {
    icon: "!",
    label: "RISK",
    role: "The Contrarian",
    quote: "What happens when things go wrong?",
    bg: "bg-[#D9EDC8]",
    accent: "bg-[#91B86F]",
    number: "04",
  },

  "Strategy Analysis Agent": {
    icon: "↗",
    label: "STRATEGY",
    role: "The Operator",
    quote: "If we had to win, where would we start?",
    bg: "bg-[#E1D3ED]",
    accent: "bg-[#A88BC3]",
    number: "05",
  },
}

function App() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const analyzeStartup = async () => {
    if (!name.trim() || !description.trim()) {
      setError("The board needs an idea first.")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })

      if (!response.ok) {
        let message = "Something went wrong while analyzing the startup."

        try {
          const errorData = await response.json()

          if (typeof errorData.detail === "string") {
            message = errorData.detail
          }
        } catch {
          // Keep the default message if the response isn't valid JSON.
        }

        throw new Error(message)
      }

      const data = await response.json()

      setResult(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the startup."
      )
    } finally {
      setLoading(false)
    }
  }

  const analyses = result ? result.analyses : []

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#242323]">

      {/* ========================================================= */}
      {/* BACKGROUND DECOR                                         */}
      {/* ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#B8DCE5]/40 blur-3xl" />

        <div className="absolute right-[-100px] top-[15%] h-80 w-80 rounded-full bg-[#D8C7E8]/35 blur-3xl" />

        <div className="absolute bottom-[-100px] left-[20%] h-80 w-80 rounded-full bg-[#C8F560]/15 blur-3xl" />

      </div>

      {/* ========================================================= */}
      {/* NAVIGATION                                                */}
      {/* ========================================================= */}

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">

        <button
          onClick={() => {
            setResult(null)
            setName("")
            setDescription("")
            setError("")
          }}
          className="group flex items-center gap-3"
        >

          <div className="flex h-10 w-10 rotate-[-3deg] items-center justify-center bg-[#C8F560] font-black shadow-[3px_3px_0_#242323] transition group-hover:rotate-3">
            SB
          </div>

          <div className="text-left">

            <div className="font-black tracking-tight">
              Startup Boardroom
            </div>

            <div className="text-[9px] font-bold leading-3 tracking-wide text-[#817B72] sm:text-[10px]">
              A Multi-Agent LLM-Based Boardroom for Collaborative Startup Idea Evaluation
            </div>

          </div>

        </button>

        <div className="hidden items-center gap-3 sm:flex">

          <span className="text-xs font-semibold text-[#817B72]">
            FIVE PERSPECTIVES
          </span>

          <span className="h-2 w-2 rounded-full bg-[#C8F560] shadow-[0_0_0_3px_#242323]" />

        </div>

      </nav>

      {/* ========================================================= */}
      {/* MAIN                                                      */}
      {/* ========================================================= */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-10">

        {/* ===================================================== */}
        {/* LANDING PAGE                                           */}
        {/* ===================================================== */}

        {!result && (

          <section className="mx-auto max-w-5xl pt-16 sm:pt-24">

            <div className="mb-8 flex items-center gap-3">

              <div className="h-px w-10 bg-[#242323]" />

              <span className="text-xs font-black uppercase tracking-[0.25em]">
                The founder's boardroom
              </span>

            </div>

            <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">

              <div>

                <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-[100px]">

                  Put your

                  <span className="relative mx-3 inline-block">

                    <span className="relative z-10">
                      idea
                    </span>

                    <span className="absolute bottom-1 left-[-5%] right-[-5%] -z-0 h-5 rotate-[-2deg] bg-[#C8F560] sm:h-7" />

                  </span>

                  <br />

                  <span className="italic">
                    in the room.
                  </span>

                </h1>

              </div>

              <div className="pb-2 lg:pb-4">

                <p className="max-w-md text-base leading-7 text-[#68635D] sm:text-lg">

                  Five independent AI perspectives will challenge,
                  question and pressure-test your startup.

                </p>

                <p className="mt-4 text-sm font-bold">

                  AI informs. You decide.

                  <span className="ml-2 text-[#8BAF37]">
                    ●
                  </span>

                </p>

              </div>

            </div>

            {/* ================================================= */}
            {/* INPUT AREA                                         */}
            {/* ================================================= */}

            <div className="relative mt-16">

              <div className="absolute -top-4 left-6 z-20 -rotate-1 bg-[#242323] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                Bring an idea
              </div>

              <div className="border-2 border-[#242323] bg-[#FFFDF7] p-6 shadow-[8px_8px_0_#C8F560] sm:p-9">

                <div className="mb-7">

                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#77716A]">
                    Startup name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. CampusCart"
                    className="w-full border-b-2 border-[#D8D1C7] bg-transparent px-1 py-3 text-xl font-bold outline-none transition placeholder:text-[#B9B2A8] focus:border-[#242323]"
                  />

                </div>

                <div className="mb-8">

                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#77716A]">
                    What's the idea?
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you building, who is it for, and what problem does it solve?"
                    rows={5}
                    className="w-full resize-none rounded-none border-b-2 border-[#D8D1C7] bg-transparent px-1 py-3 text-base leading-7 outline-none transition placeholder:text-[#B9B2A8] focus:border-[#242323]"
                  />

                </div>

                <button
                  onClick={analyzeStartup}
                  disabled={loading}
                  className="group flex w-full items-center justify-between border-2 border-[#242323] bg-[#242323] px-6 py-5 text-left text-white transition hover:bg-[#C8F560] hover:text-[#242323] disabled:cursor-not-allowed disabled:opacity-60 sm:px-7"
                >

                  <span className="text-base font-black uppercase tracking-wider sm:text-lg">

                    {loading
                      ? "Board in session..."
                      : "Enter the boardroom"}

                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8F560] text-xl text-[#242323] transition group-hover:translate-x-1">
                    ↗
                  </span>

                </button>

                {error && (

                  <div className="mt-5 border-2 border-[#242323] bg-[#F8D8CE] px-5 py-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#F27D68] font-black text-white">
                        !
                      </div>

                      <div>

                        <div className="text-sm font-black">
                          The boardroom needs a moment.
                        </div>

                        <div className="mt-1 text-sm leading-6 text-[#68635D]">
                          {error}
                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* ================================================= */}
            {/* AGENT INTRODUCTION                                 */}
            {/* ================================================= */}

            <div className="mt-16">

              <div className="mb-6 flex items-center justify-between">

                <h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#817B72]">
                  Who's sitting at the table?
                </h2>

                <span className="text-xs font-bold text-[#AAA298]">
                  05 analysts
                </span>

              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

                {Object.values(agentConfig).map((agent) => (

                  <div
                    key={agent.label}
                    className={`${agent.bg} border border-[#242323]/10 p-4 transition hover:-translate-y-1`}
                  >

                    <div className="mb-8 flex items-start justify-between">

                      <span className="text-2xl font-black">
                        {agent.icon}
                      </span>

                      <span className="text-[10px] font-black text-[#817B72]">
                        {agent.number}
                      </span>

                    </div>

                    <div className="text-[11px] font-black tracking-wider">
                      {agent.label}
                    </div>

                    <div className="mt-1 text-xs text-[#77716A]">
                      {agent.role}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>

        )}

        {/* ========================================================= */}
        {/* RESULTS                                                   */}
        {/* ========================================================= */}

        {result && (

          <section className="pt-14 sm:pt-20">

            {/* HEADER */}

            <div className="mb-12 border-b-2 border-[#242323] pb-8">

              <div className="mb-5 flex items-center gap-3">

                <span className="h-3 w-3 bg-[#C8F560] shadow-[0_0_0_2px_#242323]" />

                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  Boardroom session
                </span>

              </div>

              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

                <div>

                  <h1 className="text-5xl font-black tracking-[-0.05em] sm:text-7xl">
                    {result.startup.name}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#77716A]">

                    Five independent perspectives.
                    <br />
                    No AI verdict. No fake certainty.
                    Just useful disagreement.

                  </p>

                </div>

                <button
                  onClick={() => {
                    setResult(null)
                    setError("")
                  }}
                  className="w-fit border-2 border-[#242323] bg-[#FFFDF7] px-5 py-3 text-sm font-black transition hover:bg-[#C8F560]"
                >
                  ← NEW IDEA
                </button>

              </div>

            </div>

            {/* QUICK STATS */}

            <div className="mb-10 grid gap-3 sm:grid-cols-3">

              <div className="border border-[#242323] bg-[#FFFDF7] p-5">

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                  Perspectives
                </div>

                <div className="mt-2 text-4xl font-black">
                  {analyses.length.toString().padStart(2, "0")}
                </div>

              </div>

              <div className="border border-[#242323] bg-[#C8F560] p-5">

                <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Highest score
                </div>

                <div className="mt-2 text-4xl font-black">

                  {analyses.length > 0
                    ? Math.max(...analyses.map((a) => a.score)).toFixed(1)
                    : "—"}

                  <span className="ml-1 text-base">
                    /10
                  </span>

                </div>

              </div>

              <div className="border border-[#242323] bg-[#FFFDF7] p-5">

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                  Final decision
                </div>

                <div className="mt-2 text-4xl font-black">
                  YOU
                </div>

              </div>

            </div>

            {/* ANALYST CARDS */}

            <div className="grid gap-7 md:grid-cols-2">

              {analyses.map((analysis, index) => {

                const config =
                  agentConfig[analysis.agent_name] ||
                  agentConfig["Market Research Agent"]

                const scoreWidth = Math.min(
                  Math.max(analysis.score * 10, 0),
                  100
                )

                const confidencePercent = Math.round(
                  analysis.confidence * 100
                )

                const rotations = [
                  "rotate-[-0.4deg]",
                  "rotate-[0.3deg]",
                  "rotate-[-0.2deg]",
                  "rotate-[0.4deg]",
                  "rotate-[-0.3deg]",
                ]

                return (

                  <article
                    key={analysis.agent_name}
                    className={`group ${rotations[index % rotations.length]} border-2 border-[#242323] ${config.bg} shadow-[6px_6px_0_#242323] transition duration-300 hover:rotate-0 hover:shadow-[9px_9px_0_#242323]`}
                  >

                    {/* CARD HEADER */}

                    <div className="border-b-2 border-[#242323] p-5 sm:p-6">

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-4">

                          <div
                            className={`flex h-12 w-12 items-center justify-center ${config.accent} border-2 border-[#242323] text-xl font-black`}
                          >
                            {config.icon}
                          </div>

                          <div>

                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                              {config.number} · AI analyst
                            </div>

                            <h2 className="mt-1 text-xl font-black">
                              {config.label}
                            </h2>

                            <div className="mt-1 text-xs text-[#77716A]">
                              {config.role}
                            </div>

                          </div>

                        </div>

                        <div className="text-right">

                          <div className="text-4xl font-black leading-none">
                            {analysis.score}
                          </div>

                          <div className="mt-1 text-[9px] font-black uppercase tracking-wider">
                            / 10
                          </div>

                        </div>

                      </div>

                      <div className="mt-6 text-sm font-bold italic text-[#5F5A54]">
                        "{config.quote}"
                      </div>

                    </div>

                    {/* SCORE + CONFIDENCE */}

                    <div className="border-b-2 border-[#242323] bg-[#FFFDF7]/50 p-5 sm:p-6">

                      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider">

                        <span>
                          Assessment
                        </span>

                        <span>
                          {analysis.score}/10
                        </span>

                      </div>

                      <div className="h-3 border border-[#242323] bg-[#FFFDF7]">

                        <div
                          className={`h-full ${config.accent} transition-all duration-700`}
                          style={{
                            width: `${scoreWidth}%`,
                          }}
                        />

                      </div>

                      <div className="mt-5">

                        <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider">

                          <span>
                            Confidence
                          </span>

                          <span>
                            {confidencePercent}%
                          </span>

                        </div>

                        <div className="h-2 border border-[#242323] bg-[#FFFDF7]">

                          <div
                            className="h-full bg-[#242323] transition-all duration-700"
                            style={{
                              width: `${confidencePercent}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    {/* ANALYST CONTENT */}

                    <div className="p-5 sm:p-6">

                      {/* Bottom line */}

                      <div>

                        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                          Analyst take
                        </div>

                        <p className="text-[15px] leading-6 text-[#4F4A45]">
                          {analysis.bottom_line}
                        </p>

                      </div>

                      {/* Strengths */}

                      <div className="mt-8">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="flex h-5 w-5 items-center justify-center bg-[#C8F560] text-xs font-black">
                            +
                          </span>

                          <h3 className="text-xs font-black uppercase tracking-wider">
                            Strengths
                          </h3>

                        </div>

                        <div className="space-y-4">

                          {analysis.strengths.map(
                            (strength, i) => (

                              <div
                                key={i}
                                className="border-l-2 border-[#8BAF37] pl-3"
                              >

                                <div className="text-[15px] font-bold leading-6 text-[#4F4A45]">
                                  {strength.point}
                                </div>

                                <div className="mt-1 text-[14px] leading-6 text-[#68635D]">
                                  {strength.explanation}
                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                      {/* Weaknesses */}

                      <div className="mt-8">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="flex h-5 w-5 items-center justify-center bg-[#F27D68] text-xs font-black text-white">
                            !
                          </span>

                          <h3 className="text-xs font-black uppercase tracking-wider">
                            Watch-outs
                          </h3>

                        </div>

                        <div className="space-y-4">

                          {analysis.weaknesses.map(
                            (weakness, i) => (

                              <div
                                key={i}
                                className="border-l-2 border-[#F27D68] pl-3"
                              >

                                <div className="text-[15px] font-bold leading-6 text-[#4F4A45]">
                                  {weakness.point}
                                </div>

                                <div className="mt-1 text-[14px] leading-6 text-[#68635D]">
                                  {weakness.explanation}
                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                      {/* Evidence */}

                      <div className="mt-8 border-t border-[#242323]/15 pt-6">

                        <div className="mb-3 text-xs font-black uppercase tracking-wider">
                          Evidence
                        </div>

                        <div className="space-y-2">

                          {analysis.evidence.length > 0 ? (

                            analysis.evidence.map(
                              (item, i) => (

                                <div
                                  key={i}
                                  className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                                >

                                  <span className="font-black">
                                    •
                                  </span>

                                  <span>
                                    {item}
                                  </span>

                                </div>

                              )
                            )

                          ) : (

                            <div className="text-[14px] italic text-[#817B72]">
                              No specific evidence provided.
                            </div>

                          )}

                        </div>

                      </div>

                      {/* Assumptions */}

                      <div className="mt-7">

                        <div className="mb-3 text-xs font-black uppercase tracking-wider">
                          Assumptions
                        </div>

                        <div className="space-y-2">

                          {analysis.assumptions.length > 0 ? (

                            analysis.assumptions.map(
                              (item, i) => (

                                <div
                                  key={i}
                                  className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                                >

                                  <span className="font-black">
                                    →
                                  </span>

                                  <span>
                                    {item}
                                  </span>

                                </div>

                              )
                            )

                          ) : (

                            <div className="text-[14px] italic text-[#817B72]">
                              No major assumptions identified.
                            </div>

                          )}

                        </div>

                      </div>

                      {/* Unknowns */}

                      <div className="mt-7">

                        <div className="mb-3 text-xs font-black uppercase tracking-wider">
                          Unknowns
                        </div>

                        <div className="space-y-2">

                          {analysis.unknowns.length > 0 ? (

                            analysis.unknowns.map(
                              (item, i) => (

                                <div
                                  key={i}
                                  className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                                >

                                  <span className="font-black">
                                    ?
                                  </span>

                                  <span>
                                    {item}
                                  </span>

                                </div>

                              )
                            )

                          ) : (

                            <div className="text-[14px] italic text-[#817B72]">
                              No major unknowns identified.
                            </div>

                          )}

                        </div>

                      </div>

                      {/* What to test */}

                      <div className="mt-7 border-t border-[#242323]/15 pt-6">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="flex h-5 w-5 items-center justify-center bg-[#242323] text-xs font-black text-white">
                            ✓
                          </span>

                          <h3 className="text-xs font-black uppercase tracking-wider">
                            What to test
                          </h3>

                        </div>

                        <div className="space-y-3">

                          {analysis.what_to_test.length > 0 ? (

                            analysis.what_to_test.map(
                              (item, i) => (

                                <div
                                  key={i}
                                  className="border-l-2 border-[#242323] pl-3 text-[14px] leading-6 text-[#4F4A45]"
                                >
                                  {item}
                                </div>

                              )
                            )

                          ) : (

                            <div className="text-[14px] italic text-[#817B72]">
                              No specific tests suggested.
                            </div>

                          )}

                        </div>

                      </div>

                    </div>

                  </article>

                )
              })}

            </div>

            {/* ========================================================= */}
            {/* BOARDROOM SUMMARY                                         */}
            {/* ========================================================= */}

            <section className="mt-16">

              <div className="mb-7">

                <div className="mb-3 flex items-center gap-3">

                  <span className="h-3 w-3 bg-[#F27D68] shadow-[0_0_0_2px_#242323]" />

                  <span className="text-xs font-black uppercase tracking-[0.25em]">
                    The boardroom view
                  </span>

                </div>

                <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
                  What the board agrees on.
                </h2>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="border-2 border-[#242323] bg-[#C8F560] p-6 shadow-[5px_5px_0_#242323]">

                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Strongest area
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.strongest_area}
                  </p>

                </div>

                <div className="border-2 border-[#242323] bg-[#F8D8CE] p-6 shadow-[5px_5px_0_#242323]">

                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Weakest area
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.weakest_area}
                  </p>

                </div>

                <div className="border-2 border-[#242323] bg-[#DDF0F2] p-6">

                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Biggest disagreement
                  </div>

                  <p className="mt-4 text-[15px] leading-7 text-[#4F4A45]">
                    {result.boardroom_summary.biggest_disagreement}
                  </p>

                </div>

                <div className="border-2 border-[#242323] bg-[#E1D3ED] p-6">

                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Key question
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.key_question}
                  </p>

                </div>

              </div>

              <div className="mt-4 border-2 border-[#242323] bg-[#FFFDF7] p-6">

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                  Boardroom summary
                </div>

                <p className="mt-4 max-w-4xl text-[16px] leading-7 text-[#4F4A45]">
                  {result.boardroom_summary.summary}
                </p>

              </div>

            </section>

            {/* ========================================================= */}
            {/* VALIDATION AGENT                                          */}
            {/* ========================================================= */}

            <section className="mt-16">

              <div className="mb-7">

                <div className="mb-3 flex items-center gap-3">

                  <span className="h-3 w-3 bg-[#A88BC3] shadow-[0_0_0_2px_#242323]" />

                  <span className="text-xs font-black uppercase tracking-[0.25em]">
                    Validation room
                  </span>

                </div>

                <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
                  Don't guess.
                  <br />
                  <span className="italic">
                    Test.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#68635D]">
                  The Validation Agent turns the analysts'
                  assumptions into practical experiments you
                  can run before committing significant time
                  or money.
                </p>

              </div>

              <div className="border-2 border-[#242323] bg-[#E1D3ED] p-6 shadow-[6px_6px_0_#242323] sm:p-8">

                <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Critical assumptions
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">

                  {result.validation.critical_assumptions.length > 0 ? (

                    result.validation.critical_assumptions.map(
                      (assumption, i) => (

                        <div
                          key={i}
                          className="border-2 border-[#242323] bg-[#FFFDF7] p-4"
                        >

                          <div className="flex gap-3">

                            <span className="font-black">
                              0{i + 1}
                            </span>

                            <p className="text-[15px] font-bold leading-6">
                              {assumption}
                            </p>

                          </div>

                        </div>

                      )
                    )

                  ) : (

                    <div className="text-[14px] italic text-[#68635D]">
                      No critical assumptions identified.
                    </div>

                  )}

                </div>

              </div>

              <div className="mt-8 space-y-6">

                {result.validation.experiments.map(
                  (experiment, index) => (

                    <article
                      key={index}
                      className="border-2 border-[#242323] bg-[#FFFDF7] shadow-[5px_5px_0_#242323]"
                    >

                      <div className="border-b-2 border-[#242323] bg-[#242323] p-5 text-white sm:p-6">

                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                          <div>

                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#AAA298]">
                              Experiment {String(index + 1).padStart(2, "0")}
                            </div>

                            <h3 className="mt-2 text-xl font-black">
                              Test this assumption
                            </h3>

                          </div>

                          <div className="h-3 w-3 bg-[#C8F560]" />

                        </div>

                        <p className="mt-5 text-[15px] leading-7 text-[#D8D3CB]">
                          {experiment.assumption}
                        </p>

                      </div>

                      <div className="grid gap-0 md:grid-cols-2">

                        <div className="border-b border-[#242323]/15 p-5 md:border-r md:p-6">

                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                            Experiment
                          </div>

                          <p className="mt-3 text-[15px] leading-7 text-[#4F4A45]">
                            {experiment.experiment}
                          </p>

                        </div>

                        <div className="border-b border-[#242323]/15 p-5 md:p-6">

                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                            Metric
                          </div>

                          <p className="mt-3 text-[15px] font-bold leading-7 text-[#4F4A45]">
                            {experiment.metric}
                          </p>

                        </div>

                        <div className="border-b border-[#242323]/15 bg-[#D9EDC8] p-5 md:border-r md:p-6">

                          <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Success criteria
                          </div>

                          <p className="mt-3 text-[15px] leading-7 text-[#4F4A45]">
                            {experiment.success_criteria}
                          </p>

                        </div>

                        <div className="bg-[#F8D8CE] p-5 md:p-6">

                          <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Failure criteria
                          </div>

                          <p className="mt-3 text-[15px] leading-7 text-[#4F4A45]">
                            {experiment.failure_criteria}
                          </p>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

              <div className="mt-6 border-l-4 border-[#A88BC3] bg-[#F3EDF7] px-5 py-4">

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                  Validation agent
                </div>

                <p className="mt-2 text-[15px] leading-7 text-[#4F4A45]">
                  {result.validation.summary}
                </p>

              </div>

            </section>

            {/* ========================================================= */}
            {/* FOUNDER DECISION                                          */}
            {/* ========================================================= */}

            <section className="relative mt-16 overflow-hidden border-2 border-[#242323] bg-[#242323] text-white shadow-[8px_8px_0_#C8F560]">

              <div className="absolute right-[-40px] top-[-60px] h-40 w-40 rounded-full bg-[#C8F560]" />

              <div className="relative p-7 sm:p-10">

                <div className="max-w-3xl">

                  <div className="mb-5 flex items-center gap-3">

                    <span className="bg-[#C8F560] px-2 py-1 text-[10px] font-black text-[#242323]">
                      YOUR TURN
                    </span>

                    <span className="text-xs font-bold text-[#AAA298]">
                      Founder decision
                    </span>

                  </div>

                  <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">

                    The board has
                    <br />

                    <span className="text-[#C8F560]">
                      opinions.
                    </span>

                    <br />

                    You have the call.

                  </h2>

                  <p className="mt-6 max-w-xl text-sm leading-7 text-[#BDB8B0]">

                    Don't blindly follow the highest score.
                    Look for disagreements, identify the assumptions
                    that matter most, and figure out what you can
                    actually test in the real world.

                  </p>

                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() => {
                      setResult(null)
                      setName("")
                      setDescription("")
                      setError("")
                    }}
                    className="border-2 border-[#C8F560] bg-[#C8F560] px-6 py-4 text-sm font-black text-[#242323] transition hover:bg-white"
                  >
                    TEST ANOTHER IDEA ↗
                  </button>

                  <button
                    onClick={() => {
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    }}
                    className="border-2 border-white/20 px-6 py-4 text-sm font-black text-white transition hover:border-white"
                  >
                    BACK TO TOP ↑
                  </button>

                </div>

              </div>

            </section>

          </section>

        )}

        {/* ========================================================= */}
        {/* FOOTER                                                    */}
        {/* ========================================================= */}

        <footer className="mt-24 flex flex-col justify-between gap-3 border-t border-[#D8D1C7] pt-6 text-xs font-semibold text-[#817B72] sm:flex-row">

          <span>
            STARTUP BOARDROOM © 2026
          </span>

          <span>
            AI informs. Founder decides.
          </span>

        </footer>

      </main>

    </div>
  )
}

export default App