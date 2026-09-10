import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
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
  what_to_test: AnalysisPoint[]
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

type AgentAbout = {
  checks: string
  simple: string
  looksAt: string[]
  matters: string
}

type AgentConfig = {
  icon: string
  label: string
  role: string
  quote: string
  description: string
  about: AgentAbout
  bg: string
  accent: string
  number: string
}

const analystConfig: Record<string, AgentConfig> = {
  "Market Research Agent": {
    icon: "↗",
    label: "MARKET",
    role: "The Optimist",
    quote: "Is there actually a hungry customer here?",
    description:
      "Checks whether people have a real problem or need that your idea could solve.",
    about: {
      checks:
        "Whether people have a real problem or need that your idea could solve, and whether enough people might care about the solution.",
      simple: "Is there a real opportunity here?",
      looksAt: [
        "Who might use the product",
        "What problem they have and how important it is",
        "How often the problem happens",
        "Whether the idea could give people a useful reason to choose it",
      ],
      matters:
        "A product can be well made and still fail if very few people need it. This agent helps separate an interesting idea from a problem people genuinely care about.",
    },
    bg: "bg-[#DDF0F2]",
    accent: "bg-[#8BCBD2]",
    number: "01",
  },

  "Competitor Analysis Agent": {
    icon: "×",
    label: "COMPETITION",
    role: "The Skeptic",
    quote: "Someone is probably already doing this.",
    description:
      "Checks who else solves the same or a similar problem and why someone might choose your idea.",
    about: {
      checks:
        "Who else solves the same or similar problem, including existing products, services, and the ways people solve it themselves.",
      simple: "Why would someone choose your idea instead of the other options?",
      looksAt: [
        "Existing companies or products",
        "Other ways customers can solve the problem",
        "What makes your idea different or better",
        "How difficult it may be for others to copy or compete",
      ],
      matters:
        "You do not need to have no competitors. You need to understand the alternatives and have a clear reason someone might choose you.",
    },
    bg: "bg-[#F8D8CE]",
    accent: "bg-[#F27D68]",
    number: "02",
  },

  "Finance Analysis Agent": {
    icon: "$",
    label: "FINANCE",
    role: "The CFO",
    quote: "Cool idea. But do the numbers work?",
    description:
      "Checks whether the idea has a realistic way to make money and support its costs.",
    about: {
      checks:
        "Whether the idea has a realistic way to earn money and whether the business could eventually support its costs.",
      simple: "Can this idea make enough money to keep going?",
      looksAt: [
        "Who would pay and what they might pay for",
        "What the business needs to spend money on",
        "How costly it may be to serve each customer",
        "Whether the way you plan to make money can work over time",
      ],
      matters:
        "A startup needs more than customers. It needs a sensible path for money coming in to cover what the business needs to operate.",
    },
    bg: "bg-[#F5E6A9]",
    accent: "bg-[#D9B72D]",
    number: "03",
  },

  "Risk Analysis Agent": {
    icon: "!",
    label: "RISK",
    role: "The Contrarian",
    quote: "What happens when things go wrong?",
    description:
      "Looks for things that could go wrong, weak assumptions, and problems the founder may be overlooking.",
    about: {
      checks:
        "What could go wrong, which parts of the idea are uncertain, and which assumptions could cause serious problems if they are wrong.",
      simple: "What are we overlooking?",
      looksAt: [
        "Reasons customers may not use or pay for it",
        "Things that may be difficult, expensive, or slow to build",
        "Outside factors that could affect the idea",
        "Assumptions that need to be proven",
      ],
      matters:
        "This agent deliberately challenges the idea. Finding a problem early is useful because you can change the plan before investing too much effort.",
    },
    bg: "bg-[#D9EDC8]",
    accent: "bg-[#91B86F]",
    number: "04",
  },

  "Strategy Analysis Agent": {
    icon: "↗",
    label: "STRATEGY",
    role: "The Operator",
    quote: "If we had to win, where would we start?",
    description:
      "Focuses on the practical path from the idea to a first useful version, first users, and future growth.",
    about: {
      checks:
        "Whether there is a practical path from the idea to a first useful version, first users, and future growth.",
      simple: "What should we actually do next?",
      looksAt: [
        "Who to focus on first",
        "What the first version should include",
        "Which problems deserve attention first",
        "How the idea could improve after learning from users",
      ],
      matters:
        "A good idea still needs a plan. This agent turns the big idea into practical priorities and next steps.",
    },
    bg: "bg-[#E1D3ED]",
    accent: "bg-[#A88BC3]",
    number: "05",
  },
}

const supportAgentConfig: AgentConfig[] = [
  {
    icon: "◎",
    label: "BOARDROOM",
    role: "The Chair",
    quote: "What do all these perspectives actually tell us?",
    description:
      "Brings the five independent perspectives together, shows where they agree or disagree, and frames the most important question.",
    about: {
      checks:
        "What the five independent analysts collectively say, where they agree, and where they see the idea differently.",
      simple:
        "After hearing everyone, what should the founder pay attention to?",
      looksAt: [
        "The strongest area",
        "The weakest area",
        "Important disagreements",
        "The biggest question that still needs an answer",
      ],
      matters:
        "It gives you a clear picture of the discussion without hiding disagreement or turning everything into one artificial score. The founder still makes the final call.",
    },
    bg: "bg-[#F5E6A9]",
    accent: "bg-[#D9B72D]",
    number: "06",
  },

  {
    icon: "✓",
    label: "VALIDATION",
    role: "The Experimenter",
    quote: "What should we test before we commit?",
    description:
      "Turns important assumptions into practical experiments so you can learn from real-world evidence.",
    about: {
      checks:
        "Which important beliefs about the startup are still unproven and how they can be tested with real-world evidence.",
      simple: "What do we need to prove before we trust this idea?",
      looksAt: [
        "Important assumptions behind the idea",
        "Small practical experiments you can run",
        "What result you should measure",
        "What would count as a good or bad signal",
      ],
      matters:
        "AI can help you think through an idea, but real people and real results can tell you much more. Validation helps turn guesses into things you can test.",
    },
    bg: "bg-[#E1D3ED]",
    accent: "bg-[#A88BC3]",
    number: "07",
  },
]

const processSteps = [
  {
    number: "01",
    title: "Submit",
    description:
      "Describe your startup idea, customer, and the problem you want to solve.",
    bg: "bg-[#FFFDF7]",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Five independent AI analysts examine the idea from different business perspectives.",
    bg: "bg-[#DDF0F2]",
  },
  {
    number: "03",
    title: "Synthesize",
    description:
      "The Boardroom Agent compares the perspectives and highlights agreement and disagreement.",
    bg: "bg-[#F5E6A9]",
  },
  {
    number: "04",
    title: "Validate",
    description:
      "The Validation Agent turns important assumptions into practical experiments.",
    bg: "bg-[#E1D3ED]",
  },
  {
    number: "05",
    title: "Decide",
    description:
      "The AI provides perspectives and evidence. The founder makes the final decision.",
    bg: "bg-[#C8F560]",
  },
]
function InfoButton({
  text,
  about,
  open,
  onClick,
  previous,
  next,
  onPrevious,
  onNext,
}: {
  text?: string
  about?: AgentAbout
  open: boolean
  onClick: () => void
  previous?: string
  next?: string
  onPrevious?: () => void
  onNext?: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const onClickRef = useRef(onClick)

  onClickRef.current = onClick

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node

      const clickedButton =
        buttonRef.current?.contains(target)

      const clickedPopup =
        popupRef.current?.contains(target)

      if (!clickedButton && !clickedPopup) {
        onClickRef.current()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClickRef.current()
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      )
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [open])

  const popup = open
    ? createPortal(
        <div
          ref={popupRef}
          className="
            fixed
            left-1/2
            top-1/2
            z-[9999]
            w-[min(32rem,calc(100vw-2rem))]
            max-h-[80vh]
            -translate-x-1/2
            -translate-y-1/2
            overflow-y-auto
            border-2
            border-[#242323]
            bg-[#FFFDF7]
            p-6
            text-left
            shadow-[6px_6px_0_#242323]
          "
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#817B72]">
              About this
            </span>

            <button
              type="button"
              onClick={onClick}
              aria-label="Close explanation"
              className="flex h-6 w-6 cursor-pointer items-center justify-center text-lg font-black text-[#242323] hover:opacity-60"
            >
              ×
            </button>
          </div>

          {about ? (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#817B72]">
                  What it checks
                </div>

                <p className="text-[14px] leading-6 text-[#4F4A45]">
                  {about.checks}
                </p>
              </div>

              <div className="border-l-2 border-[#C8F560] pl-4">
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#817B72]">
                  In simple words
                </div>

                <p className="text-[15px] font-bold leading-6 text-[#242323]">
                  {about.simple}
                </p>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#817B72]">
                  What it looks at
                </div>

                <ul className="space-y-2">
                  {about.looksAt.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-[14px] leading-6 text-[#5F5A54]"
                    >
                      <span className="font-black">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#242323]/15 pt-4">
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#817B72]">
                  Why it matters
                </div>

                <p className="text-[14px] leading-6 text-[#4F4A45]">
                  {about.matters}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[14px] leading-6 text-[#4F4A45]">
              {text}
            </p>
          )}

          {(previous || next) && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t-2 border-[#242323] pt-4">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!previous}
                className={`border-2 border-[#242323] px-3 py-2 text-[11px] font-black ${
                  previous
                    ? "bg-[#FFFDF7] hover:bg-[#C8F560]"
                    : "cursor-not-allowed opacity-30"
                }`}
              >
                ← PREVIOUS
              </button>

              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#817B72]">
                Perspective
              </span>

              <button
                type="button"
                onClick={onNext}
                disabled={!next}
                className={`border-2 border-[#242323] px-3 py-2 text-[11px] font-black ${
                  next
                    ? "bg-[#C8F560] hover:bg-white"
                    : "cursor-not-allowed opacity-30"
                }`}
              >
                NEXT →
              </button>
            </div>
          )}
        </div>,
        document.body
      )
    : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-label={open ? "Hide explanation" : "Show explanation"}
        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-[#242323] text-[10px] font-black ${
          open
            ? "bg-[#242323] text-white"
            : "bg-transparent text-[#242323] hover:bg-[#242323] hover:text-white"
        }`}
      >
        i
      </button>

      {popup}
    </>
  )
}

function AnalysisPointList({
  items,
  accentClass,
}: {
  items: AnalysisPoint[]
  accentClass: string
}) {
  if (items.length === 0) {
    return (
      <div className="text-[14px] italic text-[#817B72]">
        Nothing specific identified.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className={`border-l-2 ${accentClass} pl-3`}
        >
          <div className="text-[15px] font-bold leading-6 text-[#4F4A45]">
            {item.point}
          </div>

          <div className="mt-1 text-[14px] leading-6 text-[#68635D]">
            {item.explanation}
          </div>
        </div>
      ))}
    </div>
  )
}


function downloadBoardroomPDF(result: AnalysisResponse) {
  const pdf = new jsPDF("p", "mm", "a4")

  const pageWidth = 210
  const pageHeight = 297
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const bottomLimit = pageHeight - 22

  const startupName = result.startup?.name || "Startup Idea"
  const startupDescription = result.startup?.description || ""

  const colors = {
    ink: [36, 35, 35] as [number, number, number],
    paper: [247, 242, 232] as [number, number, number],
    white: [255, 253, 247] as [number, number, number],
    lime: [200, 245, 96] as [number, number, number],
    blue: [184, 220, 229] as [number, number, number],
    tomato: [242, 125, 104] as [number, number, number],
    lavender: [216, 199, 232] as [number, number, number],
    butter: [244, 216, 121] as [number, number, number],
    green: [217, 237, 200] as [number, number, number],
    muted: [95, 90, 84] as [number, number, number],
    lightMuted: [129, 123, 114] as [number, number, number],
    line: [36, 35, 35] as [number, number, number],
  }

  const analystColors = [
    colors.lime,
    colors.blue,
    colors.butter,
    colors.tomato,
    colors.lavender,
  ]

  const safeName = startupName
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()

  const analyses = result.analyses || []
  const validation = result.validation
  const boardroom = result.boardroom_summary

  const averageScore =
    analyses.length > 0
      ? analyses.reduce((sum, analysis) => sum + analysis.score, 0) /
        analyses.length
      : 0

  const highestScore =
    analyses.length > 0
      ? Math.max(...analyses.map((analysis) => analysis.score))
      : 0

  pdf.setProperties({
    title: `${startupName} — Startup Boardroom`,
    subject: "AI Startup Evaluation",
    author: "Startup Boardroom",
    creator: "Startup Boardroom",
    keywords: "startup, boardroom, AI, analysis, validation",
  })

  let y = 0

  const setFill = (color: [number, number, number]) => {
    pdf.setFillColor(...color)
  }

  const setText = (color: [number, number, number]) => {
    pdf.setTextColor(...color)
  }

  const setDraw = (color: [number, number, number]) => {
    pdf.setDrawColor(...color)
  }

  const drawBackground = () => {
    setFill(colors.paper)
    pdf.rect(0, 0, pageWidth, pageHeight, "F")

    // Decorative background shapes.
    setFill([239, 232, 216])
    pdf.circle(194, 24, 25, "F")

    setFill([235, 225, 239])
    pdf.circle(8, 270, 22, "F")

    setFill([230, 242, 216])
    pdf.circle(202, 278, 17, "F")
  }

  const drawTopAccent = (
    color: [number, number, number] = colors.lime
  ) => {
    setFill(color)
    pdf.rect(0, 0, pageWidth, 7, "F")

    setFill(colors.ink)
    pdf.rect(0, 7, pageWidth, 1.2, "F")
  }

  const drawFooter = () => {
    setDraw(colors.ink)
    pdf.setLineWidth(0.35)
    pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(6.5)
    setText(colors.lightMuted)

    pdf.text(
      "STARTUP BOARDROOM",
      margin,
      pageHeight - 8
    )

    pdf.text(
      `${startupName}  ·  ${String(pdf.getNumberOfPages()).padStart(
        2,
        "0"
      )}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    )
  }

  const startPage = (
    accent: [number, number, number] = colors.lime
  ) => {
    drawBackground()
    drawTopAccent(accent)
    y = 22
  }

  const addPage = (
    accent: [number, number, number] = colors.lime
  ) => {
    drawFooter()
    pdf.addPage()
    startPage(accent)
  }

  const ensureSpace = (
    height: number,
    accent: [number, number, number] = colors.lime
  ) => {
    if (y + height > bottomLimit) {
      addPage(accent)
    }
  }

  const wrap = (
    text: unknown,
    width: number,
    fontSize: number
  ) => {
    pdf.setFontSize(fontSize)

    return pdf.splitTextToSize(
      String(text ?? ""),
      width
    )
  }

  const addLabel = (
    text: string,
    x: number,
    labelY: number,
    color = colors.lightMuted
  ) => {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(6.5)
    setText(color)

    pdf.text(
      text.toUpperCase(),
      x,
      labelY
    )
  }

  const addSectionHeader = (
    number: string,
    title: string,
    accent: [number, number, number]
  ) => {
    ensureSpace(22, accent)

    setFill(accent)
    pdf.rect(
      margin,
      y - 8,
      15,
      10,
      "F"
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(7.5)
    setText(colors.ink)

    pdf.text(
      number,
      margin + 7.5,
      y - 1.5,
      { align: "center" }
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(20)
    setText(colors.ink)

    pdf.text(
      title,
      margin + 20,
      y
    )

    y += 13

    setFill(colors.ink)
    pdf.rect(
      margin,
      y,
      28,
      1.2,
      "F"
    )

    y += 8
  }

  const addCard = (
    x: number,
    cardY: number,
    width: number,
    height: number,
    fill: [number, number, number],
    shadow = true
  ) => {
    if (shadow) {
      setFill(colors.ink)
      pdf.rect(
        x + 2,
        cardY + 2,
        width,
        height,
        "F"
      )
    }

    setFill(fill)
    setDraw(colors.ink)
    pdf.setLineWidth(0.55)

    pdf.rect(
      x,
      cardY,
      width,
      height,
      "FD"
    )
  }

  const addTextBlock = (
    text: unknown,
    x: number,
    blockY: number,
    width: number,
    fontSize = 9,
    lineHeight = 4.7,
    font: "normal" | "bold" | "italic" = "normal",
    color = colors.muted
  ) => {
    pdf.setFont("helvetica", font)
    pdf.setFontSize(fontSize)
    setText(color)

    const lines = wrap(
      text,
      width,
      fontSize
    )

    if (lines.length > 0) {
      pdf.text(
        lines,
        x,
        blockY
      )
    }

    return blockY + Math.max(
      1,
      lines.length
    ) * lineHeight
  }

  const addBulletList = (
    title: string,
    items: string[],
    accent: [number, number, number]
  ) => {
    if (!items || items.length === 0) return

    ensureSpace(18, accent)

    addLabel(
      title,
      margin,
      y
    )

    y += 6

    items.forEach((item) => {
      const lines = wrap(
        item,
        contentWidth - 10,
        8.5
      )

      const itemHeight =
        Math.max(1, lines.length) * 4.2 + 4

      ensureSpace(
        itemHeight + 1,
        accent
      )

      setFill(accent)
      pdf.rect(
        margin,
        y - 3,
        3,
        3,
        "F"
      )

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8.5)
      setText(colors.muted)

      pdf.text(
        lines,
        margin + 7,
        y
      )

      y += itemHeight
    })

    y += 3
  }

  const addMetric = (
    x: number,
    metricY: number,
    width: number,
    label: string,
    value: string,
    accent: [number, number, number]
  ) => {
    addCard(
      x,
      metricY,
      width,
      30,
      colors.white,
      false
    )

    setFill(accent)
    pdf.rect(
      x,
      metricY,
      5,
      30,
      "F"
    )

    addLabel(
      label,
      x + 10,
      metricY + 8
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(15)
    setText(colors.ink)

    pdf.text(
      value,
      x + 10,
      metricY + 22
    )
  }

  
  const addQuoteBlock = (
    quote: string,
    accent: [number, number, number]
  ) => {
    const lines = wrap(
      `"${quote}"`,
      contentWidth - 22,
      10
    )

    const height = Math.max(
      25,
      12 + lines.length * 5
    )

    ensureSpace(
      height + 5,
      accent
    )

    setFill(colors.ink)
    pdf.rect(
      margin,
      y,
      contentWidth,
      height,
      "F"
    )

    setFill(accent)
    pdf.rect(
      margin,
      y,
      5,
      height,
      "F"
    )

    pdf.setFont("helvetica", "italic")
    pdf.setFontSize(10)
    setText(colors.white)

    pdf.text(
      lines,
      margin + 12,
      y + 10
    )

    y += height + 7
  }

  // ==================================================
  // PAGE 1 — COVER
  // ==================================================

  startPage(colors.lime)

  y = 29

  addLabel(
    "STARTUP BOARDROOM  /  PRIVATE BOARD PACK",
    margin,
    y,
    colors.ink
  )

  y += 16

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(32)
  setText(colors.ink)

  const titleLines = wrap(
    startupName,
    145,
    32
  )

  pdf.text(
    titleLines,
    margin,
    y
  )

  y += titleLines.length * 12 + 7

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10.5)
  setText(colors.muted)

  const descriptionLines = wrap(
    startupDescription,
    142,
    10.5
  )

  pdf.text(
    descriptionLines,
    margin,
    y
  )

  y += descriptionLines.length * 5.3 + 18

  // Decorative boardroom card.
  addCard(
    margin,
    y,
    contentWidth,
    67,
    colors.ink
  )

  setFill(colors.lime)
  pdf.rect(
    margin,
    y,
    contentWidth,
    7,
    "F"
  )

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(7)
  setText(colors.ink)

  pdf.text(
    "BOARDROOM SESSION",
    margin + 9,
    y + 5
  )

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(20)
  setText(colors.white)

  pdf.text(
    "Five perspectives.",
    margin + 10,
    y + 28
  )

  pdf.text(
    "One clearer decision.",
    margin + 10,
    y + 40
  )

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8)
  setText([205, 205, 205])

  pdf.text(
    "AI informs. The founder decides.",
    margin + 10,
    y + 53
  )

  // Small decorative dots.
  setFill(colors.tomato)
  pdf.circle(
    pageWidth - margin - 23,
    y + 23,
    4,
    "F"
  )

  setFill(colors.blue)
  pdf.circle(
    pageWidth - margin - 12,
    y + 34,
    3,
    "F"
  )

  y += 81

  const cardGap = 5
  const cardWidth =
    (contentWidth - cardGap * 2) / 3

  addMetric(
    margin,
    y,
    cardWidth,
    "Perspectives",
    String(analyses.length).padStart(2, "0"),
    colors.lime
  )

  addMetric(
    margin + cardWidth + cardGap,
    y,
    cardWidth,
    "Highest score",
    `${highestScore.toFixed(1)}/10`,
    colors.blue
  )

  addMetric(
    margin + (cardWidth + cardGap) * 2,
    y,
    cardWidth,
    "Average",
    `${averageScore.toFixed(1)}/10`,
    colors.tomato
  )

  y += 43

  addLabel(
    "BOARDROOM PRINCIPLE",
    margin,
    y
  )

  y += 8

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(11)
  setText(colors.ink)

  pdf.text(
    "No single score decides whether the startup wins.",
    margin,
    y
  )

  y += 7

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8.5)
  setText(colors.muted)

  pdf.text(
    "The value is in the perspectives, disagreements, assumptions and tests.",
    margin,
    y
  )

  drawFooter()

  // ==================================================
  // PAGE 2 — EXECUTIVE SNAPSHOT
  // ==================================================

  pdf.addPage()
  startPage(colors.lime)

  addSectionHeader(
    "01",
    "Executive snapshot",
    colors.lime
  )

  y = addTextBlock(
    "Five independent analysts pressure-test the same startup from different operating lenses. The goal is not artificial certainty — it is a sharper view of what deserves attention.",
    margin,
    y,
    contentWidth,
    9,
    4.7,
    "normal",
    colors.muted
  )

  y += 9

  analyses.forEach((analysis, index) => {
    const config =
      Object.values(analystConfig)[index]

    if (!config) return

    const accent =
      analystColors[index % analystColors.length]

    ensureSpace(
      38,
      accent
    )

    const cardY = y

    addCard(
      margin,
      cardY,
      contentWidth,
      31,
      colors.white,
      false
    )

    setFill(accent)
    pdf.rect(
      margin,
      cardY,
      7,
      31,
      "F"
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9.5)
    setText(colors.ink)

    pdf.text(
      `${config.number}  ${config.label}`,
      margin + 13,
      cardY + 9
    )

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(7)
    setText(colors.muted)

    pdf.text(
      config.role,
      margin + 13,
      cardY + 15
    )

    // Score.
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(17)
    setText(colors.ink)

    pdf.text(
      analysis.score.toFixed(1),
      pageWidth - margin - 35,
      cardY + 11
    )

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(6)
    setText(colors.lightMuted)

    pdf.text(
      "/10",
      pageWidth - margin - 23,
      cardY + 11
    )

    // Score bar.
    const barX = margin + 13
    const barY = cardY + 22
    const barWidth = 105

    setFill([225, 221, 213])
    pdf.rect(
      barX,
      barY,
      barWidth,
      3,
      "F"
    )

    setFill(accent)
    pdf.rect(
      barX,
      barY,
      barWidth *
        Math.min(
          Math.max(analysis.score / 10, 0),
          1
        ),
      3,
      "F"
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(6)
    setText(colors.lightMuted)

    pdf.text(
      `CONFIDENCE ${Math.round(
        analysis.confidence * 100
      )}%`,
      pageWidth - margin - 40,
      cardY + 23
    )

    y += 37
  })

  y += 4

  // Key boardroom signals.
  addLabel(
    "KEY BOARDROOM SIGNALS",
    margin,
    y
  )

  y += 8

  const signalCards = [
    {
      label: "Strongest area",
      value:
        boardroom?.strongest_area ||
        "Not available",
      accent: colors.lime,
    },
    {
      label: "Weakest area",
      value:
        boardroom?.weakest_area ||
        "Not available",
      accent: colors.tomato,
    },
    {
      label: "Key question",
      value:
        boardroom?.key_question ||
        "Not available",
      accent: colors.lavender,
    },
  ]

  signalCards.forEach((signal) => {
    const lines = wrap(
      signal.value,
      contentWidth - 22,
      9
    )

    const height = Math.max(
      27,
      17 + lines.length * 4.5
    )

    ensureSpace(
      height + 5,
      signal.accent
    )

    addCard(
      margin,
      y,
      contentWidth,
      height,
      colors.white,
      false
    )

    setFill(signal.accent)
    pdf.rect(
      margin,
      y,
      6,
      height,
      "F"
    )

    addLabel(
      signal.label,
      margin + 12,
      y + 8
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9)
    setText(colors.ink)

    pdf.text(
      lines,
      margin + 12,
      y + 16
    )

    y += height + 6
  })

  drawFooter()

  // ==================================================
  // PAGES 3–7 — ANALYST REPORTS
  // ==================================================

  analyses.forEach((analysis, index) => {
    const config =
      Object.values(analystConfig)[index]

    if (!config) return

    const accent =
      analystColors[index % analystColors.length]

    pdf.addPage()
    startPage(accent)

    // Analyst header.
    addLabel(
      `${config.number}  /  INDEPENDENT ANALYST`,
      margin,
      y,
      colors.ink
    )

    y += 11

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(25)
    setText(colors.ink)

    pdf.text(
      config.label,
      margin,
      y
    )

    y += 7

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8.5)
    setText(colors.muted)

    pdf.text(
      config.role,
      margin,
      y
    )

    y += 12

    // Score hero.
    addCard(
      margin,
      y,
      contentWidth,
      39,
      colors.white,
      true
    )

    setFill(accent)
    pdf.rect(
      margin,
      y,
      7,
      39,
      "F"
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(31)
    setText(colors.ink)

    pdf.text(
      analysis.score.toFixed(1),
      margin + 14,
      y + 25
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    setText(colors.lightMuted)

    pdf.text(
      "/ 10",
      margin + 39,
      y + 24
    )

    const scoreBarX = margin + 54
    const scoreBarY = y + 16
    const scoreBarWidth = 104

    setFill([225, 221, 213])
    pdf.rect(
      scoreBarX,
      scoreBarY,
      scoreBarWidth,
      5,
      "F"
    )

    setFill(accent)
    pdf.rect(
      scoreBarX,
      scoreBarY,
      scoreBarWidth *
        Math.min(
          Math.max(analysis.score / 10, 0),
          1
        ),
      5,
      "F"
    )

    addLabel(
      `CONFIDENCE  ${Math.round(
        analysis.confidence * 100
      )}%`,
      scoreBarX,
      y + 29
    )

    y += 50

    // Analyst take — uses the actual `bottom_line` field.
    addLabel(
      "Analyst take",
      margin,
      y
    )

    y += 7

    const takeLines = wrap(
      analysis.bottom_line,
      contentWidth,
      11
    )

    ensureSpace(
      takeLines.length * 5.5 + 8,
      accent
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    setText(colors.ink)

    pdf.text(
      takeLines,
      margin,
      y
    )

    y += takeLines.length * 5.5 + 10

    // Strengths / weaknesses.
    const columnGap = 6
    const columnWidth =
      (contentWidth - columnGap) / 2

    const drawPointCard = (
      title: string,
      items: AnalysisPoint[],
      x: number,
      cardY: number,
      width: number,
      fill: [number, number, number]
    ) => {
      const safeItems = items || []

      const itemHeights = safeItems.map((item) => {
        const pointLines = wrap(
          item.point,
          width - 20,
          8
        )

        const explanationLines = wrap(
          item.explanation,
          width - 20,
          7
        )

        return (
          pointLines.length * 4 +
          explanationLines.length * 3.5 +
          6
        )
      })

      const height = Math.max(
        30,
        16 +
          itemHeights.reduce(
            (sum, itemHeight) =>
              sum + itemHeight,
            0
          )
      )

      addCard(
        x,
        cardY,
        width,
        height,
        fill,
        false
      )

      addLabel(
        title,
        x + 7,
        cardY + 9,
        colors.ink
      )

      let localY = cardY + 16

      if (safeItems.length === 0) {
        pdf.setFont("helvetica", "italic")
        pdf.setFontSize(7.5)
        setText(colors.muted)

        pdf.text(
          "Nothing specific identified.",
          x + 7,
          localY
        )
      } else {
        safeItems.forEach((item) => {
          const pointLines = wrap(
            item.point,
            width - 20,
            8
          )

          const explanationLines = wrap(
            item.explanation,
            width - 20,
            7
          )

          setFill(colors.ink)
          pdf.circle(
            x + 8,
            localY - 1.3,
            0.8,
            "F"
          )

          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(8)
          setText(colors.ink)

          pdf.text(
            pointLines,
            x + 12,
            localY
          )

          localY += pointLines.length * 4

          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7)
          setText(colors.muted)

          pdf.text(
            explanationLines,
            x + 12,
            localY
          )

          localY +=
            explanationLines.length * 3.5 +
            6
        })
      }

      return height
    }

    const strengths = analysis.strengths || []
    const weaknesses = analysis.weaknesses || []

    const strengthHeight =
      18 +
      strengths.reduce((sum, item) => {
        const pointLines = wrap(
          item.point,
          columnWidth - 20,
          8
        )

        const explanationLines = wrap(
          item.explanation,
          columnWidth - 20,
          7
        )

        return (
          sum +
          pointLines.length * 4 +
          explanationLines.length * 3.5 +
          6
        )
      }, 0)

    const weaknessHeight =
      18 +
      weaknesses.reduce((sum, item) => {
        const pointLines = wrap(
          item.point,
          columnWidth - 20,
          8
        )

        const explanationLines = wrap(
          item.explanation,
          columnWidth - 20,
          7
        )

        return (
          sum +
          pointLines.length * 4 +
          explanationLines.length * 3.5 +
          6
        )
      }, 0)

    const columnsHeight = Math.max(
      30,
      strengthHeight,
      weaknessHeight
    )

    ensureSpace(
      columnsHeight + 8,
      accent
    )

    const columnsY = y

    drawPointCard(
      "Strengths",
      strengths,
      margin,
      columnsY,
      columnWidth,
      colors.lime
    )

    drawPointCard(
      "Watch-outs",
      weaknesses,
      margin + columnWidth + columnGap,
      columnsY,
      columnWidth,
      colors.tomato
    )

    y =
      columnsY +
      columnsHeight +
      9

    addBulletList(
      "Evidence",
      analysis.evidence || [],
      colors.blue
    )

    addBulletList(
      "Assumptions",
      analysis.assumptions || [],
      colors.butter
    )

    addBulletList(
      "Unknowns",
      analysis.unknowns || [],
      colors.lavender
    )

    // What to test uses AnalysisPoint[], so render both point and explanation.
    if (
      analysis.what_to_test &&
      analysis.what_to_test.length > 0
    ) {
      ensureSpace(
        20,
        colors.lime
      )

      addLabel(
        "What to test",
        margin,
        y
      )

      y += 7

      analysis.what_to_test.forEach((item) => {
        const pointLines = wrap(
          item.point,
          contentWidth - 10,
          8.5
        )

        const explanationLines = wrap(
          item.explanation,
          contentWidth - 10,
          7.5
        )

        const height =
          pointLines.length * 4.2 +
          explanationLines.length * 3.8 +
          7

        ensureSpace(
          height,
          colors.lime
        )

        setFill(colors.lime)
        pdf.rect(
          margin,
          y - 3,
          3,
          Math.max(8, height - 4),
          "F"
        )

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(8.5)
        setText(colors.ink)

        pdf.text(
          pointLines,
          margin + 7,
          y
        )

        y += pointLines.length * 4.2 + 1

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(7.5)
        setText(colors.muted)

        pdf.text(
          explanationLines,
          margin + 7,
          y
        )

        y +=
          explanationLines.length * 3.8 +
          6
      })
    }

    addQuoteBlock(
      config.quote,
      accent
    )

    drawFooter()
  })

  // ==================================================
  // BOARDROOM SUMMARY
  // ==================================================

  pdf.addPage()
  startPage(colors.tomato)

  addSectionHeader(
    "07",
    "The boardroom",
    colors.tomato
  )

  y = addTextBlock(
    "The analysts are deliberately independent. Agreement is useful, but disagreement is signal too — it tells you where the idea needs a closer look.",
    margin,
    y,
    contentWidth,
    9,
    4.7,
    "normal",
    colors.muted
  )

  y += 9

  const summaryCards = [
    {
      label: "Strongest area",
      value:
        boardroom?.strongest_area ||
        "Not available",
      accent: colors.lime,
    },
    {
      label: "Weakest area",
      value:
        boardroom?.weakest_area ||
        "Not available",
      accent: colors.tomato,
    },
    {
      label: "Biggest disagreement",
      value:
        boardroom?.biggest_disagreement ||
        "Not available",
      accent: colors.blue,
    },
    {
      label: "Key question",
      value:
        boardroom?.key_question ||
        "Not available",
      accent: colors.butter,
    },
  ]

  summaryCards.forEach((card) => {
    const lines = wrap(
      card.value,
      contentWidth - 23,
      9
    )

    const height = Math.max(
      31,
      17 + lines.length * 4.5
    )

    ensureSpace(
      height + 6,
      card.accent
    )

    addCard(
      margin,
      y,
      contentWidth,
      height,
      colors.white,
      false
    )

    setFill(card.accent)
    pdf.rect(
      margin,
      y,
      6,
      height,
      "F"
    )

    addLabel(
      card.label,
      margin + 12,
      y + 8
    )

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9)
    setText(colors.ink)

    pdf.text(
      lines,
      margin + 12,
      y + 16
    )

    y += height + 7
  })

  ensureSpace(
    48,
    colors.tomato
  )

  addLabel(
    "Boardroom synthesis",
    margin,
    y
  )

  y += 7

  const synthesisLines = wrap(
    boardroom?.summary ||
      "No synthesis available.",
    contentWidth - 20,
    10
  )

  const synthesisHeight = Math.max(
    42,
    20 + synthesisLines.length * 5
  )

  addCard(
    margin,
    y,
    contentWidth,
    synthesisHeight,
    colors.white,
    true
  )

  setFill(colors.tomato)
  pdf.rect(
    margin,
    y,
    6,
    synthesisHeight,
    "F"
  )

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  setText(colors.muted)

  pdf.text(
    synthesisLines,
    margin + 14,
    y + 14
  )

  y += synthesisHeight + 12

  ensureSpace(
    45,
    colors.lime
  )

  // Human decision block.
  addCard(
    margin,
    y,
    contentWidth,
    44,
    colors.ink,
    true
  )

  addLabel(
    "FOUNDER DECISION",
    margin + 10,
    y + 10,
    colors.lime
  )

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(13)
  setText(colors.white)

  const decisionText =
    "Review the evidence, disagreements and validation plan — then make the call yourself."

  const decisionLines = wrap(
    decisionText,
    contentWidth - 20,
    13
  )

  pdf.text(
    decisionLines,
    margin + 10,
    y + 21
  )

  y += 55

  drawFooter()

  // ==================================================
  // VALIDATION PLAN
  // ==================================================

  pdf.addPage()
  startPage(colors.lime)

  addSectionHeader(
    "08",
    "Validation plan",
    colors.lime
  )

  const criticalAssumptions =
    validation?.critical_assumptions || []

  if (criticalAssumptions.length > 0) {
    addLabel(
      "Critical assumptions",
      margin,
      y
    )

    y += 8

    criticalAssumptions.forEach(
      (assumption, index) => {
        const lines = wrap(
          assumption,
          contentWidth - 22,
          8.5
        )

        const height = Math.max(
          22,
          12 + lines.length * 4.2
        )

        ensureSpace(
          height + 5,
          colors.butter
        )

        addCard(
          margin,
          y,
          contentWidth,
          height,
          colors.white,
          false
        )

        setFill(colors.butter)
        pdf.rect(
          margin,
          y,
          7,
          height,
          "F"
        )

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(7.5)
        setText(colors.ink)

        pdf.text(
          String(index + 1).padStart(2, "0"),
          margin + 10,
          y + 9
        )

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(8.5)
        setText(colors.ink)

        pdf.text(
          lines,
          margin + 22,
          y + 9
        )

        y += height + 5
      }
    )

    y += 4
  }

  const experiments =
    validation?.experiments || []

  experiments.forEach(
    (experiment, index) => {
      const accent =
        analystColors[
          index % analystColors.length
        ]

      const fields = [
        {
          label: "Assumption",
          value: experiment.assumption,
        },
        {
          label: "Experiment",
          value: experiment.experiment,
        },
        {
          label: "Metric",
          value: experiment.metric,
        },
        {
          label: "Success criteria",
          value: experiment.success_criteria,
        },
        {
          label: "Failure criteria",
          value: experiment.failure_criteria,
        },
      ]

      const fieldHeights = fields.map(
        (field) => {
          const lines = wrap(
            field.value,
            contentWidth - 54,
            7.5
          )

          return Math.max(
            8,
            lines.length * 3.8 + 5
          )
        }
      )

      const cardHeight =
        17 +
        fieldHeights.reduce(
          (sum, height) =>
            sum + height,
          0
        )

      ensureSpace(
        cardHeight + 8,
        accent
      )

      const cardY = y

      addCard(
        margin,
        cardY,
        contentWidth,
        cardHeight,
        colors.white,
        true
      )

      setFill(accent)
      pdf.rect(
        margin,
        cardY,
        contentWidth,
        9,
        "F"
      )

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(7)
      setText(colors.ink)

      pdf.text(
        `EXPERIMENT ${String(
          index + 1
        ).padStart(2, "0")}`,
        margin + 7,
        cardY + 6
      )

      let fieldY = cardY + 17

      fields.forEach(
        (field, fieldIndex) => {
          addLabel(
            field.label,
            margin + 8,
            fieldY
          )

          const lines = wrap(
            field.value,
            contentWidth - 54,
            7.5
          )

          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(7.5)
          setText(colors.muted)

          pdf.text(
            lines,
            margin + 43,
            fieldY
          )

          fieldY += fieldHeights[fieldIndex]
        }
      )

      y =
        cardY +
        cardHeight +
        8
    }
  )

  ensureSpace(
    44,
    colors.lavender
  )

  const validationSummary =
    validation?.summary ||
    "No validation summary available."

  const validationSummaryLines = wrap(
    validationSummary,
    contentWidth - 20,
    9
  )

  const validationSummaryHeight =
    Math.max(
      38,
      18 +
        validationSummaryLines.length * 4.5
    )

  addCard(
    margin,
    y,
    contentWidth,
    validationSummaryHeight,
    colors.lavender,
    false
  )

  addLabel(
    "Validation agent summary",
    margin + 9,
    y + 10,
    colors.ink
  )

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  setText(colors.muted)

  pdf.text(
    validationSummaryLines,
    margin + 9,
    y + 19
  )

  drawFooter()

  // ==================================================
  // FINAL PAGE — FOUNDER BRIEF
  // ==================================================

  pdf.addPage()
  startPage(colors.lime)

  y = 25

  setFill(colors.lime)
  pdf.rect(
    margin,
    y,
    contentWidth,
    13,
    "F"
  )

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(7.5)
  setText(colors.ink)

  pdf.text(
    "FINAL BOARDROOM BRIEF",
    margin + 7,
    y + 8
  )

  y += 31

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(28)
  setText(colors.ink)

  pdf.text(
    "So… what do you do?",
    margin,
    y
  )

  y += 15

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9.5)
  setText(colors.muted)

  const finalIntro =
    "The boardroom gives you perspectives, not permission. Look at what is supported, what is disputed, what is unknown, and what can be tested next."

  const finalIntroLines = wrap(
    finalIntro,
    contentWidth,
    9.5
  )

  pdf.text(
    finalIntroLines,
    margin,
    y
  )

  y += finalIntroLines.length * 5 + 17

  // Final decision card.
  const finalCardHeight = 72

  addCard(
    margin,
    y,
    contentWidth,
    finalCardHeight,
    colors.ink,
    true
  )

  addLabel(
    "YOUR NEXT MOVE",
    margin + 10,
    y + 12,
    colors.lime
  )

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(15)
  setText(colors.white)

  const finalDecision =
    boardroom?.key_question ||
    "Choose the most important uncertainty and test it."

  const finalDecisionLines = wrap(
    finalDecision,
    contentWidth - 20,
    15
  )

  pdf.text(
    finalDecisionLines,
    margin + 10,
    y + 26
  )

  setFill(colors.lime)
  pdf.rect(
    margin + 10,
    y + 52,
    35,
    2,
    "F"
  )

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(7.5)
  setText([205, 205, 205])

  pdf.text(
    "Turn uncertainty into evidence.",
    margin + 10,
    y + 63
  )

  y += 89

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(18)
  setText(colors.ink)

  pdf.text(
    "AI informs.",
    margin,
    y
  )

  y += 9

  pdf.text(
    "You decide.",
    margin,
    y
  )

  y += 17

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(7.5)
  setText(colors.lightMuted)

  pdf.text(
    "STARTUP BOARDROOM  ·  AI STARTUP EVALUATION  ·  2026",
    margin,
    y
  )

  drawFooter()

  // ==================================================
  // SAVE
  // ==================================================

  pdf.save(
    `${safeName || "startup"}-boardroom-report.pdf`
  )
}

function App() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openInfo, setOpenInfo] = useState<string | null>(null)

  const toggleInfo = (id: string) => {
    setOpenInfo((current) => (current === id ? null : id))
  }

  const analyzeStartup = async () => {
    if (!name.trim() || !description.trim()) {
      setError("The board needs an idea first.")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    setOpenInfo(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
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
          // Keep default message.
        }

        throw new Error(message)
      }

      const data: AnalysisResponse = await response.json()

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

  const analyses = result?.analyses ?? []

  const resetToLanding = () => {
    setResult(null)
    setName("")
    setDescription("")
    setError("")
    setOpenInfo(null)
  }

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#242323]">

      {/* BACKGROUND DECOR */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#B8DCE5]/40 blur-3xl" />

        <div className="absolute right-[-100px] top-[15%] h-80 w-80 rounded-full bg-[#D8C7E8]/35 blur-3xl" />

        <div className="absolute bottom-[-100px] left-[20%] h-80 w-80 rounded-full bg-[#C8F560]/15 blur-3xl" />
      </div>

      {/* NAVIGATION */}

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <button
          onClick={resetToLanding}
          className="group flex items-center gap-3"
        >
           <div className="group/logo relative flex h-11 w-11 rotate-[-4deg] items-center justify-center border-2 border-[#242323] bg-[#C8F560] shadow-[4px_4px_0_#242323] transition-all duration-200 group-hover:rotate-2 group-hover:shadow-[2px_2px_0_#242323]">

  {/* Boardroom table / connection line */}
  <div className="absolute bottom-[7px] left-[7px] right-[7px] h-[2px] bg-[#242323]" />

  {/* SB brand mark */}
  <span className="relative z-10 text-[18px] font-black tracking-[-0.08em] text-[#242323]">
    SB
  </span>

  {/* Small boardroom indicator */}
  <span className="absolute right-[4px] top-[4px] h-[4px] w-[4px] rounded-full bg-[#242323]" />

</div>

          <div className="text-left">
            <div className="font-black tracking-tight">
              Startup Boardroom
            </div>

            <div className="max-w-[280px] text-[9px] font-bold leading-3 tracking-wide text-[#817B72] sm:max-w-none sm:text-[10px]">
              A Multi-Agent LLM-Based Boardroom for Collaborative Startup Idea
              Evaluation
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-xs font-semibold text-[#817B72]">
            5 PERSPECTIVES + 2 SUPPORT AGENTS
          </span>

          <span className="h-2 w-2 rounded-full bg-[#C8F560] shadow-[0_0_0_3px_#242323]" />
        </div>
      </nav>

      {/* MAIN */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-10">

        {/* LANDING PAGE */}

        {!result && (
          <section className="mx-auto max-w-5xl pt-16 sm:pt-24">

            {/* HOW THE BOARDROOM WORKS */}

            <div className="mb-20">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-3 w-3 bg-[#C8F560] shadow-[0_0_0_2px_#242323]" />

                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  How the boardroom works
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {processSteps.map((step) => (
                  <div
                    key={step.number}
                    className={`border-2 border-[#242323] ${step.bg} p-5`}
                  >
                    <div className="text-2xl font-black">{step.number}</div>

                    <h3 className="mt-5 text-sm font-black uppercase tracking-wide">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-[14px] leading-6 text-[#68635D]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

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
                    <span className="relative z-10">idea</span>

                    <span className="absolute bottom-1 left-[-5%] right-[-5%] -z-0 h-5 rotate-[-2deg] bg-[#C8F560] sm:h-7" />
                  </span>

                  <br />

                  <span className="italic">in the room.</span>
                </h1>
              </div>

              <div className="pb-2 lg:pb-4">
                <p className="max-w-md text-base leading-7 text-[#68635D] sm:text-lg">
                  Five independent AI perspectives will challenge, question
                  and pressure-test your startup.
                </p>

                <p className="mt-4 text-sm font-bold">
                  AI informs. You decide.

                  <span className="ml-2 text-[#8BAF37]">●</span>
                </p>
              </div>
            </div>

            {/* INPUT AREA */}

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
                    {loading ? "Board in session..." : "Enter the boardroom"}
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

            {/* AGENT INTRODUCTION */}

<div className="mt-16">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-xs font-black uppercase tracking-[0.22em] text-[#817B72]">
        Who's sitting at the table?
      </h2>

      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#68635D]">
        Five independent analysts look at the startup from
        different angles. Two supporting agents then synthesize
        the discussion and turn uncertainty into things you can
        test.
      </p>
    </div>

    <span className="hidden text-xs font-bold text-[#AAA298] sm:block">
      05 + 02
    </span>
  </div>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
    {[
      ...Object.values(analystConfig),
      ...supportAgentConfig,
    ].map((agent, index, agents) => (
      <div
        key={agent.label}
        className={`${agent.bg} ${
          index >= 5
            ? "border-2 border-[#242323] shadow-[4px_4px_0_#242323]"
            : "border border-[#242323]/10"
        } p-5 transition hover:-translate-y-1`}
      >
        <div className="mb-8 flex items-start justify-between">
          <span className="text-2xl font-black">
            {agent.icon}
          </span>

          <div className="flex items-center gap-2">
            <InfoButton
              about={agent.about}
              open={openInfo === `intro-${agent.label}`}
              onClick={() =>
                toggleInfo(`intro-${agent.label}`)
              }
              previous={
                index > 0
                  ? agents[index - 1].label
                  : undefined
              }
              next={
                index < agents.length - 1
                  ? agents[index + 1].label
                  : undefined
              }
              onPrevious={() => {
                if (index > 0) {
                  setOpenInfo(
                    `intro-${agents[index - 1].label}`
                  )
                }
              }}
              onNext={() => {
                if (index < agents.length - 1) {
                  setOpenInfo(
                    `intro-${agents[index + 1].label}`
                  )
                }
              }}
            />

            <span className="text-[10px] font-black text-[#817B72]">
              {agent.number}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-black tracking-wider">
          {agent.label}
        </div>

        <div className="mt-1 text-xs text-[#77716A]">
          {agent.role}
        </div>

        <p className="mt-4 text-[13px] leading-5 text-[#5F5A54]">
          {agent.description}
        </p>
      </div>
    ))}
  </div>
</div>
</section>
)}

        {/* RESULTS */}

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
                    One synthesis.
                    <br />
                    No AI verdict. No fake certainty.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => downloadBoardroomPDF(result)}
                    className="w-fit border-2 border-[#242323] bg-[#C8F560] px-5 py-3 text-sm font-black transition hover:bg-white"
                  >
                    ↓ DOWNLOAD PDF
                  </button>

                  <button
                    onClick={resetToLanding}
                    className="w-fit border-2 border-[#242323] bg-[#FFFDF7] px-5 py-3 text-sm font-black transition hover:bg-[#C8F560]"
                  >
                    ← NEW IDEA
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}

            <div className="mb-10 grid gap-3 sm:grid-cols-3">
              <div className="border border-[#242323] bg-[#FFFDF7] p-5">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                    Perspectives
                  </div>

                  <InfoButton
                    text="There are five independent analyst perspectives. Each one evaluates a different business dimension, and their scores are intentionally kept separate."
                    open={openInfo === "quick-perspectives"}
                    onClick={() => toggleInfo("quick-perspectives")}
                  />
                </div>

                <div className="mt-2 text-4xl font-black">
                  {analyses.length.toString().padStart(2, "0")}
                </div>
              </div>

              <div className="border border-[#242323] bg-[#C8F560] p-5">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Highest score
                  </div>

                  <InfoButton
                    text="This is the highest score given by any individual analyst. It is not an overall startup score or prediction of success."
                    open={openInfo === "quick-highest"}
                    onClick={() => toggleInfo("quick-highest")}
                  />
                </div>

                <div className="mt-2 text-4xl font-black">
                  {analyses.length > 0
                    ? Math.max(...analyses.map((a) => a.score)).toFixed(1)
                    : "—"}

                  <span className="ml-1 text-base">/10</span>
                </div>

                <p className="mt-2 text-[12px] leading-5 text-[#4F4A45]">
                  The highest individual perspective — not an overall startup
                  verdict.
                </p>
              </div>

              <div className="border border-[#242323] bg-[#FFFDF7] p-5">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                    Final decision
                  </div>

                  <InfoButton
                    text="Startup Boardroom deliberately does not make the final decision for you. The purpose is to give you independent perspectives, disagreements, assumptions, and experiments so you can make a better-informed call."
                    open={openInfo === "quick-decision"}
                    onClick={() => toggleInfo("quick-decision")}
                  />
                </div>

                <div className="mt-2 text-4xl font-black">YOU</div>

                <p className="mt-2 text-[12px] leading-5 text-[#68635D]">
                  The system provides analysis; the founder decides.
                </p>
              </div>
            </div>

            {/* FIVE PERSPECTIVES */}

            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-3 w-3 bg-[#B8DCE5] shadow-[0_0_0_2px_#242323]" />

                <span className="text-xs font-black uppercase tracking-[0.25em]">
                  Five independent perspectives
                </span>

                <InfoButton
                  text="These five agents work independently. They are not asked to agree with each other, which makes disagreements useful signals rather than something to hide."
                  open={openInfo === "perspectives"}
                  onClick={() => toggleInfo("perspectives")}
                />
              </div>

              <p className="max-w-3xl text-[15px] leading-7 text-[#68635D]">
                Each analyst evaluates the idea from a different business
                perspective. Their scores are intentionally kept separate so
                you can see where the board agrees and where it disagrees.
              </p>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
  {/* ANALYST CARDS */}

  {analyses.map((analysis, index) => {
    const config = Object.values(analystConfig)[index]

    if (!config) {
      return null
    }

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
        className={`group ${
          rotations[index % rotations.length]
        } border-2 border-[#242323] ${
          config.bg
        } shadow-[6px_6px_0_#242323] transition duration-300 hover:rotate-0 hover:shadow-[9px_9px_0_#242323]`}
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

                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-xl font-black">
                    {config.label}
                  </h2>

                  <InfoButton
                    about={config.about}
                    open={
                      openInfo ===
                      `agent-${analysis.agent_name}`
                    }
                    onClick={() =>
                      toggleInfo(
                        `agent-${analysis.agent_name}`
                      )
                    }
                  />
                </div>

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

          <p className="mt-5 max-w-xl text-[13px] leading-5 text-[#5F5A54]">
            {config.description}
          </p>

          <div className="mt-4 text-sm font-bold italic text-[#5F5A54]">
            "{config.quote}"
          </div>
        </div>

                    {/* SCORE + CONFIDENCE */}

                    <div className="border-b-2 border-[#242323] bg-[#FFFDF7]/50 p-5 sm:p-6">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Assessment</span>

                          <InfoButton
                            text="The analyst's assessment of this specific business dimension. It is not a prediction of whether the entire startup will succeed."
                            open={
                              openInfo ===
                              `assessment-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `assessment-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <span>{analysis.score}/10</span>
                      </div>

                      <div className="h-3 border border-[#242323] bg-[#FFFDF7]">
                        <div
                          className={`h-full ${config.accent} transition-all duration-700`}
                          style={{ width: `${scoreWidth}%` }}
                        />
                      </div>

                      <p className="mt-2 text-[12px] leading-5 text-[#68635D]">
                        A higher score means this analyst views this particular
                        dimension more favorably.
                      </p>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>Confidence</span>

                            <InfoButton
                              text="Confidence reflects how strongly the analyst's conclusion is supported by the information available to it. It is not the probability that the startup will succeed."
                              open={
                                openInfo ===
                                `confidence-${analysis.agent_name}`
                              }
                              onClick={() =>
                                toggleInfo(
                                  `confidence-${analysis.agent_name}`
                                )
                              }
                            />
                          </div>

                          <span>{confidencePercent}%</span>
                        </div>

                        <div className="h-2 border border-[#242323] bg-[#FFFDF7]">
                          <div
                            className="h-full bg-[#242323] transition-all duration-700"
                            style={{
                              width: `${confidencePercent}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-[12px] leading-5 text-[#68635D]">
                          How strongly the analyst's conclusion is supported by
                          the information available to it.
                        </p>
                      </div>
                    </div>

                    {/* ANALYST CONTENT */}

                    <div className="p-5 sm:p-6">

                      {/* Bottom line */}

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                            Analyst take
                          </div>

                          <InfoButton
                            text="A concise summary of the analyst's overall perspective on its specific area of analysis."
                            open={
                              openInfo ===
                              `take-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(`take-${analysis.agent_name}`)
                            }
                          />
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

                          <InfoButton
                            text="Factors that make this particular dimension of the startup look favorable according to the analyst."
                            open={
                              openInfo ===
                              `strengths-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `strengths-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <AnalysisPointList
                          items={analysis.strengths}
                          accentClass="border-[#8BAF37]"
                        />
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

                          <InfoButton
                            text="Potential weaknesses, concerns, or conditions that could make this part of the startup harder to execute or less attractive."
                            open={
                              openInfo ===
                              `weaknesses-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `weaknesses-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <AnalysisPointList
                          items={analysis.weaknesses}
                          accentClass="border-[#F27D68]"
                        />
                      </div>

                      {/* Evidence */}

                      <div className="mt-8 border-t border-[#242323]/15 pt-6">
                        <div className="mb-1 flex items-center gap-2">
                          <div className="text-xs font-black uppercase tracking-wider">
                            Evidence
                          </div>

                          <InfoButton
                            text="Information or reasoning the analyst uses to support its assessment. Evidence helps you understand why the analyst reached its conclusion."
                            open={
                              openInfo ===
                              `evidence-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `evidence-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <p className="mb-3 text-[12px] leading-5 text-[#817B72]">
                          What supports this analyst's assessment.
                        </p>

                        <div className="space-y-2">
                          {analysis.evidence.length > 0 ? (
                            analysis.evidence.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                              >
                                <span className="font-black">•</span>

                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[14px] italic text-[#817B72]">
                              No specific evidence provided.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assumptions */}

                      <div className="mt-7">
                        <div className="mb-1 flex items-center gap-2">
                          <div className="text-xs font-black uppercase tracking-wider">
                            Assumptions
                          </div>

                          <InfoButton
                            text="Things that need to be true for the analyst's reasoning to hold. If an assumption is wrong, the conclusion may change."
                            open={
                              openInfo ===
                              `assumptions-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `assumptions-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <p className="mb-3 text-[12px] leading-5 text-[#817B72]">
                          Conditions the analysis is relying on.
                        </p>

                        <div className="space-y-2">
                          {analysis.assumptions.length > 0 ? (
                            analysis.assumptions.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                              >
                                <span className="font-black">→</span>

                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[14px] italic text-[#817B72]">
                              No major assumptions identified.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unknowns */}

                      <div className="mt-7">
                        <div className="mb-1 flex items-center gap-2">
                          <div className="text-xs font-black uppercase tracking-wider">
                            Unknowns
                          </div>

                          <InfoButton
                            text="Important information that is not yet known or established. Unknowns show where more research or real-world evidence may be needed."
                            open={
                              openInfo ===
                              `unknowns-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(
                                `unknowns-${analysis.agent_name}`
                              )
                            }
                          />
                        </div>

                        <p className="mb-3 text-[12px] leading-5 text-[#817B72]">
                          Questions that still need evidence.
                        </p>

                        <div className="space-y-2">
                          {analysis.unknowns.length > 0 ? (
                            analysis.unknowns.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-[14px] leading-6 text-[#68635D]"
                              >
                                <span className="font-black">?</span>

                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[14px] italic text-[#817B72]">
                              No major unknowns identified.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* What to test */}

                      <div className="mt-7 border-t border-[#242323]/15 pt-6">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center bg-[#242323] text-xs font-black text-white">
                            ✓
                          </span>

                          <h3 className="text-xs font-black uppercase tracking-wider">
                            What to test
                          </h3>

                          <InfoButton
                            text="Practical questions or assumptions that should be tested with real-world evidence before making an important decision."
                            open={
                              openInfo === `tests-${analysis.agent_name}`
                            }
                            onClick={() =>
                              toggleInfo(`tests-${analysis.agent_name}`)
                            }
                          />
                        </div>

                        <p className="mb-3 mt-2 text-[12px] leading-5 text-[#817B72]">
                          Practical things you can investigate before making a
                          decision.
                        </p>

                        {analysis.what_to_test.length > 0 ? (
                          <div className="space-y-4">
                            {analysis.what_to_test.map((item, i) => (
                              <div
                                key={i}
                                className="border-l-2 border-[#242323] pl-3"
                              >
                                <div className="text-[15px] font-bold leading-6 text-[#4F4A45]">
                                  {item.point}
                                </div>

                                <div className="mt-1 text-[14px] leading-6 text-[#68635D]">
                                  {item.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[14px] italic text-[#817B72]">
                            No specific tests suggested.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* BOARDROOM SUMMARY */}

            <section className="mt-16">
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-3 w-3 bg-[#F27D68] shadow-[0_0_0_2px_#242323]" />

                  <span className="text-xs font-black uppercase tracking-[0.25em]">
                    Boardroom summary
                  </span>

                  <InfoButton
                    text="The Boardroom Agent is the synthesis layer. It reviews the five independent analyst reports, identifies the strongest and weakest areas, surfaces disagreement, and frames the key question. It does not make the final decision."
                    open={openInfo === "boardroom-summary"}
                    onClick={() => toggleInfo("boardroom-summary")}
                  />
                </div>

                <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
                  What the board
                  <br />
                  <span className="italic">sees.</span>
                </h2>

                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#68635D]">
                  The Boardroom Agent synthesizes the five independent
                  perspectives. It does not replace them with a single AI
                  verdict.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="border-2 border-[#242323] bg-[#C8F560] p-6 shadow-[5px_5px_0_#242323]">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Strongest area
                    </div>

                    <InfoButton
                      text="The business dimension that appears strongest when the five independent perspectives are considered together."
                      open={openInfo === "strongest-area"}
                      onClick={() => toggleInfo("strongest-area")}
                    />
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.strongest_area}
                  </p>
                </div>

                <div className="border-2 border-[#242323] bg-[#F8D8CE] p-6 shadow-[5px_5px_0_#242323]">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Weakest area
                    </div>

                    <InfoButton
                      text="The business dimension that appears most concerning or least supported across the independent perspectives."
                      open={openInfo === "weakest-area"}
                      onClick={() => toggleInfo("weakest-area")}
                    />
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.weakest_area}
                  </p>
                </div>

                <div className="border-2 border-[#242323] bg-[#DDF0F2] p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Biggest disagreement
                    </div>

                    <InfoButton
                      text="An important area where the analysts reach different conclusions or emphasize different concerns. Disagreement can reveal where deeper investigation is valuable."
                      open={openInfo === "disagreement"}
                      onClick={() => toggleInfo("disagreement")}
                    />
                  </div>

                  <p className="mt-4 text-[15px] leading-7 text-[#4F4A45]">
                    {result.boardroom_summary.biggest_disagreement}
                  </p>
                </div>

                <div className="border-2 border-[#242323] bg-[#E1D3ED] p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Key question
                    </div>

                    <InfoButton
                      text="The question the founder should pay particular attention to after considering the different analyst perspectives."
                      open={openInfo === "key-question"}
                      onClick={() => toggleInfo("key-question")}
                    />
                  </div>

                  <p className="mt-4 text-xl font-black leading-7">
                    {result.boardroom_summary.key_question}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-2 border-[#242323] bg-[#FFFDF7] p-6">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                    Boardroom synthesis
                  </div>

                  <InfoButton
                    text="A concise synthesis of what the five independent analysts collectively reveal. It helps you interpret the discussion without turning it into an automatic yes-or-no verdict."
                    open={openInfo === "synthesis"}
                    onClick={() => toggleInfo("synthesis")}
                  />
                </div>

                <p className="mt-4 max-w-4xl text-[16px] leading-7 text-[#4F4A45]">
                  {result.boardroom_summary.summary}
                </p>
              </div>
            </section>

            {/* VALIDATION AGENT */}

            <section className="mt-16">
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-3 w-3 bg-[#A88BC3] shadow-[0_0_0_2px_#242323]" />

                  <span className="text-xs font-black uppercase tracking-[0.25em]">
                    Validation agent
                  </span>

                  <InfoButton
                    about={
                      supportAgentConfig.find(
                        (agent) => agent.label === "VALIDATION"
                      )?.about
                    }
                    open={openInfo === "validation-agent"}
                    onClick={() => toggleInfo("validation-agent")}
                  />
                </div>

                <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
                  Don't guess.
                  <br />
                  <span className="italic">Test.</span>
                </h2>

                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#68635D]">
                  The Validation Agent turns the analysts' assumptions into
                  practical experiments you can run before committing
                  significant time or money.
                </p>
              </div>

              <div className="border-2 border-[#242323] bg-[#E1D3ED] p-6 shadow-[6px_6px_0_#242323] sm:p-8">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Critical assumptions
                  </div>

                  <InfoButton
                    text="These are assumptions that are important enough to test before making a major decision. If one fails, the startup's strategy or business model may need to change."
                    open={openInfo === "critical-assumptions"}
                    onClick={() =>
                      toggleInfo("critical-assumptions")
                    }
                  />
                </div>

                <p className="mt-2 text-[13px] leading-5 text-[#5F5A54]">
                  These are the conditions most important to validate in the
                  real world.
                </p>

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

              <div className="mt-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-2 w-2 bg-[#242323]" />

                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                    Validation experiments
                  </h3>

                  <InfoButton
                    text="Concrete ways to test whether an important assumption is actually true. Each experiment includes a metric and clear success and failure criteria."
                    open={openInfo === "validation-experiments"}
                    onClick={() =>
                      toggleInfo("validation-experiments")
                    }
                  />
                </div>

                <div className="space-y-6">
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
                                Experiment{" "}
                                {String(index + 1).padStart(2, "0")}
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
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                                Experiment
                              </div>

                              <InfoButton
                                text="The practical activity you can perform to gather evidence about the assumption."
                                open={
                                  openInfo === `experiment-${index}`
                                }
                                onClick={() =>
                                  toggleInfo(`experiment-${index}`)
                                }
                              />
                            </div>

                            <p className="mt-3 text-[15px] leading-7 text-[#4F4A45]">
                              {experiment.experiment}
                            </p>
                          </div>

                          <div className="border-b border-[#242323]/15 p-5 md:p-6">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                                Metric
                              </div>

                              <InfoButton
                                text="The measurable signal you should observe during the experiment to determine whether the assumption is supported."
                                open={openInfo === `metric-${index}`}
                                onClick={() =>
                                  toggleInfo(`metric-${index}`)
                                }
                              />
                            </div>

                            <p className="mt-3 text-[15px] font-bold leading-7 text-[#4F4A45]">
                              {experiment.metric}
                            </p>
                          </div>

                          <div className="border-b border-[#242323]/15 bg-[#D9EDC8] p-5 md:border-r md:p-6">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Success criteria
                              </div>

                              <InfoButton
                                text="The result that would give you enough evidence to consider the assumption supported by the experiment."
                                open={
                                  openInfo === `success-${index}`
                                }
                                onClick={() =>
                                  toggleInfo(`success-${index}`)
                                }
                              />
                            </div>

                            <p className="mt-3 text-[15px] leading-7 text-[#4F4A45]">
                              {experiment.success_criteria}
                            </p>
                          </div>

                          <div className="bg-[#F8D8CE] p-5 md:p-6">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Failure criteria
                              </div>

                              <InfoButton
                                text="The result that would suggest the assumption is not sufficiently supported and should be reconsidered."
                                open={
                                  openInfo === `failure-${index}`
                                }
                                onClick={() =>
                                  toggleInfo(`failure-${index}`)
                                }
                              />
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
              </div>

              <div className="mt-6 border-l-4 border-[#A88BC3] bg-[#F3EDF7] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817B72]">
                    Validation agent summary
                  </div>

                  <InfoButton
                    text="A short explanation of what the Validation Agent thinks matters most when turning the boardroom's uncertainty into real-world tests."
                    open={openInfo === "validation-summary"}
                    onClick={() =>
                      toggleInfo("validation-summary")
                    }
                  />
                </div>

                <p className="mt-2 text-[15px] leading-7 text-[#4F4A45]">
                  {result.validation.summary}
                </p>
              </div>
            </section>

            {/* FOUNDER DECISION */}

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

                    <InfoButton
                      text="This is deliberately the human decision layer. The AI gives you analysis and validation ideas, but it does not decide whether you should build, pivot, pause, or reject the idea."
                      open={openInfo === "founder-decision"}
                      onClick={() =>
                        toggleInfo("founder-decision")
                      }
                    />
                  </div>

                  <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
                    The board has
                    <br />

                    <span className="text-[#C8F560]">opinions.</span>

                    <br />

                    You have the call.
                  </h2>

                  <p className="mt-6 max-w-xl text-sm leading-7 text-[#BDB8B0]">
                    Don't blindly follow the highest score. Look for
                    disagreements, identify the assumptions that matter most,
                    and figure out what you can actually test in the real
                    world.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={resetToLanding}
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

        {/* FOOTER */}

        <footer className="mt-24 flex flex-col justify-between gap-3 border-t border-[#D8D1C7] pt-6 text-xs font-semibold text-[#817B72] sm:flex-row">
          <span>STARTUP BOARDROOM © 2026</span>

          <span>AI informs. Founder decides.</span>
        </footer>
      </main>
    </div>
  )
}

export default App