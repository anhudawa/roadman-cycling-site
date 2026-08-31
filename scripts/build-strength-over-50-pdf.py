from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "strength-training-for-cyclists-over-50-plan.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
TOP = 20 * mm
BOTTOM = 17 * mm

INK = colors.HexColor("#17131F")
PURPLE = colors.HexColor("#2A1F3D")
PURPLE_2 = colors.HexColor("#3D2D59")
CORAL = colors.HexColor("#FF6B5A")
CREAM = colors.HexColor("#F7F1E9")
MUTED = colors.HexColor("#6F6879")
LINE = colors.HexColor("#DDD5E4")
PALE = colors.HexColor("#F1ECF5")
GREEN = colors.HexColor("#2D7A62")


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverEyebrow",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=CORAL,
        tracking=2.2,
        alignment=TA_LEFT,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=34,
        leading=35,
        textColor=colors.white,
        alignment=TA_LEFT,
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=14,
        leading=20,
        textColor=CREAM,
        alignment=TA_LEFT,
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverNote",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#D7CDDF"),
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        name="H1Roadman",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=PURPLE,
        spaceAfter=10,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="H2Roadman",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=PURPLE_2,
        spaceBefore=8,
        spaceAfter=6,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyRoadman",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.4,
        leading=14,
        textColor=INK,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="SmallRoadman",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.7,
        leading=11,
        textColor=MUTED,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="CalloutRoadman",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=10.4,
        leading=15,
        textColor=PURPLE,
        spaceAfter=0,
    )
)
styles.add(
    ParagraphStyle(
        name="DarkPanelTitle",
        parent=styles["CalloutRoadman"],
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="DarkPanelBody",
        parent=styles["BodyRoadman"],
        textColor=CREAM,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHead",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.8,
        leading=10.5,
        textColor=INK,
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCellBold",
        parent=styles["TableCell"],
        fontName="Helvetica-Bold",
        textColor=PURPLE,
    )
)


def P(text, style="BodyRoadman"):
    return Paragraph(text, styles[style])


def bullet(text):
    return P(f"<font color='#FF6B5A'><b>+</b></font>&nbsp;&nbsp;{text}")


def callout(title, body, color=PALE):
    table = Table(
        [[P(title, "CalloutRoadman")], [P(body)]],
        colWidths=[PAGE_W - 2 * MARGIN_X],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("BOX", (0, 0), (-1, -1), 0.8, LINE),
                ("LINEBEFORE", (0, 0), (0, -1), 4, CORAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
            ]
        )
    )
    return table


def styled_table(rows, widths, repeat_rows=1):
    data = []
    for row_index, row in enumerate(rows):
        converted = []
        for value in row:
            converted.append(P(str(value), "TableHead" if row_index == 0 else "TableCell"))
        data.append(converted)
    table = Table(data, colWidths=widths, repeatRows=repeat_rows, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(PURPLE_2)
    canvas.circle(PAGE_W + 18 * mm, PAGE_H - 38 * mm, 68 * mm, fill=1, stroke=0)
    canvas.setFillColor(CORAL)
    canvas.circle(PAGE_W - 24 * mm, 30 * mm, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#73598E"))
    canvas.circle(21 * mm, 26 * mm, 3 * mm, fill=1, stroke=0)
    canvas.restoreState()


def content_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN_X, PAGE_H - 13 * mm, PAGE_W - MARGIN_X, PAGE_H - 13 * mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(PURPLE)
    canvas.drawString(MARGIN_X, PAGE_H - 10 * mm, "ROADMAN CYCLING")
    footer = f"Strength Training for Cyclists Over 50  |  {doc.page - 1}"
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 9 * mm, footer)
    url = "roadmancycling.com/blog/strength-training-cyclists-over-50"
    canvas.drawRightString(PAGE_W - MARGIN_X, 9 * mm, url)
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=MARGIN_X,
    leftMargin=MARGIN_X,
    topMargin=TOP,
    bottomMargin=BOTTOM,
    title="Strength Training for Cyclists Over 50: Evidence-Bounded Starter Plan",
    author="Roadman Cycling",
    subject="A printable, evidence-bounded strength plan for masters cyclists",
)

cover_frame = Frame(MARGIN_X, BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - TOP - BOTTOM, id="cover")
content_frame = Frame(MARGIN_X, BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - TOP - BOTTOM, id="content")
doc.addPageTemplates(
    [
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_page),
        PageTemplate(id="Content", frames=[content_frame], onPage=content_page, autoNextPageTemplate="Content"),
    ]
)

story = []
story.extend(
    [
        Spacer(1, 32 * mm),
        P("ROADMAN CYCLING  /  PRINTABLE PLAN", "CoverEyebrow"),
        P("STRENGTH TRAINING<br/>FOR CYCLISTS<br/>OVER 50", "CoverTitle"),
        P("An evidence-bounded 10-week starter plan that fits around the riding week.", "CoverSub"),
        Spacer(1, 6 * mm),
        Table(
            [[P("Two non-consecutive sessions is a practical starting point - not a universal law.", "CoverNote")]],
            colWidths=[PAGE_W - 2 * MARGIN_X],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), PURPLE_2),
                    ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#73598E")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ]
            ),
        ),
        Spacer(1, 21 * mm),
        P("LAST REVIEWED 31 AUGUST 2026", "CoverEyebrow"),
        P(
            "Full evidence guide: <link href='https://roadmancycling.com/blog/strength-training-cyclists-over-50' color='#F7F1E9'>roadmancycling.com/blog/strength-training-cyclists-over-50</link>",
            "CoverNote",
        ),
        NextPageTemplate("Content"),
        PageBreak(),
    ]
)

story.extend(
    [
        P("How to use this plan", "H1Roadman"),
        P(
            "This is a conservative starting framework for healthy cyclists over 50. It is not a medical clearance and it is not the single protocol proved by a cyclist study. Choose variants that fit your competence, equipment and joint comfort. Progress only while the riding week remains productive."
        ),
        Spacer(1, 2 * mm),
        callout(
            "The Roadman rule",
            "Gym progress counts only when the whole programme improves. If lifts rise while every priority ride becomes flat, reduce gym volume or change its placement.",
        ),
        Spacer(1, 5 * mm),
        P("What current evidence can support", "H2Roadman"),
        styled_table(
            [
                ["Question", "Practical answer", "Boundary"],
                ["Should I lift?", "Resistance training improves strength in older adults; cyclist-only evidence suggests performance benefits.", "The cyclist review was low certainty and did not report an over-50 subgroup."],
                ["How often?", "Two non-consecutive sessions is a workable starting structure.", "No review proves one universal cycling-performance optimum."],
                ["How much?", "Begin with two work sets per main pattern.", "Add work only when priority riding and recovery remain stable."],
                ["How heavy?", "Learn the movement first, then progressively load it.", "A heavy-study definition is not a novice day-one prescription."],
                ["Race season?", "Reduce sets and accessories as competition load rises.", "There is no universal one-session maintenance law."],
            ],
            [34 * mm, 76 * mm, 50 * mm],
        ),
        Spacer(1, 5 * mm),
        P("Before starting", "H2Roadman"),
        bullet("Seek qualified guidance for known cardiovascular, orthopaedic or neurological conditions, osteoporosis, recent surgery or unexplained pain."),
        bullet("Stop and seek urgent help for chest pain, fainting, unusual breathlessness or rapidly worsening neurological symptoms."),
        bullet("A new lifter does not need a one-repetition-maximum test. Technique and tolerance come first."),
        PageBreak(),
    ]
)

session_a = [
    ["Exercise pattern", "Starting work", "Boundary"],
    ["Goblet squat or leg press", "2 x 6-10", "Leave 2-3 good reps in reserve"],
    ["Romanian deadlift or supported hinge", "2 x 6-10", "Stop before spinal position changes"],
    ["Row or pull-down", "2 x 8-12", "Use controlled shoulder movement"],
    ["Standing or seated calf raise", "2 x 8-15", "Progress only with tendon comfort"],
    ["Carry or Pallof press", "2 controlled efforts", "Trunk control, not exhaustion"],
]
session_b = [
    ["Exercise pattern", "Starting work", "Boundary"],
    ["Split squat or step-up", "2 x 6-10 each", "Use support if balance limits loading"],
    ["Hip thrust or kettlebell deadlift", "2 x 6-10", "Controlled lockout; no pain"],
    ["Push-up or dumbbell press", "2 x 8-12", "Choose a shoulder-tolerant range"],
    ["Standing or seated calf raise", "2 x 8-15", "Adjust the knee position if needed"],
    ["Side plank or dead bug", "2 controlled efforts", "Finish before form breaks"],
]

story.extend(
    [
        P("The two-session template", "H1Roadman"),
        P(
            "These are example movement options, not mandatory lifts. A machine can be the right choice. A single-leg exercise is not automatically more cycling-specific because it resembles pedalling."
        ),
        P("Session A", "H2Roadman"),
        styled_table(session_a, [70 * mm, 32 * mm, 58 * mm]),
        Spacer(1, 5 * mm),
        P("Session B", "H2Roadman"),
        styled_table(session_b, [70 * mm, 32 * mm, 58 * mm]),
        Spacer(1, 5 * mm),
        callout(
            "How hard should a set feel?",
            "For most work, finish with one to three controlled repetitions available. Stop when technique changes or pain appears. Muscle effort and joint pain are not the same signal.",
        ),
        Spacer(1, 5 * mm),
        P("Your substitutions", "H2Roadman"),
        styled_table(
            [
                ["Pattern", "My selected exercise", "Starting load", "Notes"],
                ["Knee-dominant", "", "", ""],
                ["Hip hinge", "", "", ""],
                ["Single-leg", "", "", ""],
                ["Upper body", "", "", ""],
                ["Trunk / carry", "", "", ""],
            ],
            [40 * mm, 53 * mm, 28 * mm, 39 * mm],
        ),
        PageBreak(),
    ]
)

story.extend(
    [
        P("The 10-week progression", "H1Roadman"),
        styled_table(
            [
                ["Weeks", "Frequency and work", "Progression test"],
                ["1-3  Learn and tolerate", "1-2 sessions; 1-2 work sets; leave 3-4 reps available.", "Technique stays controlled and joint comfort is stable for 24-48 hours."],
                ["4-6  Build", "Move toward 2 sessions; 2 work sets; mostly 6-12 reps.", "Add one rep or a small load only when all planned work is clean."],
                ["7-10  Progress", "2 sessions if recovered; 2-3 sets on selected main patterns.", "Priority rides stay productive and fatigue resolves before the next hard day."],
                ["Race / peak weeks", "Keep familiar lifts; remove accessories; reduce sets first.", "No novel soreness and no loss of race-specific work."],
            ],
            [35 * mm, 68 * mm, 57 * mm],
        ),
        Spacer(1, 6 * mm),
        P("Fit the gym around the bike", "H2Roadman"),
        styled_table(
            [
                ["Option", "How it works", "Use it when"],
                ["Separate demanding sessions", "Place strength and the priority ride on different days or provide a longer gap.", "Either session repeatedly loses quality when combined."],
                ["Consolidate stress", "Complete the priority bike work first, lift later, then keep the next day easy.", "Time is limited and both sessions remain productive."],
            ],
            [42 * mm, 70 * mm, 48 * mm],
        ),
        Spacer(1, 6 * mm),
        P("Weekly placement worksheet", "H2Roadman"),
        styled_table(
            [
                ["Day", "Bike priority / duration", "Strength", "Recovery note"],
                ["Monday", "", "", ""],
                ["Tuesday", "", "", ""],
                ["Wednesday", "", "", ""],
                ["Thursday", "", "", ""],
                ["Friday", "", "", ""],
                ["Saturday", "", "", ""],
                ["Sunday", "", "", ""],
            ],
            [27 * mm, 56 * mm, 40 * mm, 37 * mm],
        ),
        Spacer(1, 5 * mm),
        P("Review the programme, not one session", "H2Roadman"),
        bullet("Did the key ride complete its intended work?"),
        bullet("Did soreness change movement, cadence or normal daily activity?"),
        bullet("Did joint discomfort appear or worsen?"),
        bullet("Did the selected lifts progress across several exposures?"),
        PageBreak(),
    ]
)

story.extend(
    [
        P("Readiness with guardrails", "H1Roadman"),
        P(
            "One low HRV reading, one poor sleep score or one sore morning is not a diagnosis. Use a cluster and consider the next important ride."
        ),
        styled_table(
            [
                ["Signal", "Green direction", "Caution direction"],
                ["Sleep", "Normal opportunity and continuity", "Repeated short or fragmented nights"],
                ["Energy / mood", "Normal for this rider", "Material drop across several days"],
                ["Muscle soreness", "Mild and improving", "Changes movement or worsens"],
                ["Joint comfort", "Stable", "New, sharp or progressively worse pain"],
                ["Resting HR / HRV", "Near personal trend", "Sustained change plus other warning signals"],
                ["Next bike session", "Low priority or well separated", "Race, test or key intervals are close"],
            ],
            [35 * mm, 59 * mm, 66 * mm],
        ),
        Spacer(1, 6 * mm),
        callout(
            "Adjustment order",
            "1. Remove optional accessories.  2. Reduce three sets to two.  3. Keep familiar exercises and useful load.  4. Reduce frequency only when the week still does not recover.",
        ),
        Spacer(1, 6 * mm),
        P("Session log", "H2Roadman"),
        styled_table(
            [
                ["Date", "Exercise", "Load", "Reps x sets", "Reps left", "Next-day note"],
                ["", "", "", "", "", ""],
                ["", "", "", "", "", ""],
                ["", "", "", "", "", ""],
                ["", "", "", "", "", ""],
                ["", "", "", "", "", ""],
                ["", "", "", "", "", ""],
            ],
            [22 * mm, 45 * mm, 22 * mm, 29 * mm, 22 * mm, 28 * mm],
        ),
        Spacer(1, 7 * mm),
        Table(
            [[P("STRENGTH THAT FITS YOUR CYCLING", "DarkPanelTitle")], [P("Roadman's upcoming iPhone app will place 30, 45 or 60-minute cyclist-specific strength around existing rides, then use readiness guardrails to hold or reduce working-set volume with a plain-language reason.", "DarkPanelBody")], [P("<link href='https://roadmancycling.com/app?source=strength-over-50-pdf' color='#FF6B5A'><b>Join the single early-access list at roadmancycling.com/app</b></link>", "DarkPanelBody")]],
            colWidths=[PAGE_W - 2 * MARGIN_X],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), INK),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
                    ("BOX", (0, 0), (-1, -1), 0.8, PURPLE_2),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            ),
        ),
        PageBreak(),
    ]
)

story.extend(
    [
        P("Evidence notes and sources", "H1Roadman"),
        P(
            "This plan uses group-level evidence to set conservative boundaries. It does not claim one over-50 cycling protocol has been proven. Read the full Roadman guide for the complete interpretation and correction policy."
        ),
        P("Primary sources", "H2Roadman"),
        bullet("Cyclist-only heavy strength meta-analysis: 17 controlled studies, 262 cyclists, low outcome certainty. PMID 40632222."),
        bullet("Concurrent training in healthy adults aged 50-73: 15 studies, 566 participants. PMID 36222981."),
        bullet("Concurrent versus single-mode training in adults over 50: 49 studies, 2,587 participants. PMID 35728627."),
        bullet("Resistance-training volume in older adults: network meta-analysis of 151 randomised trials. PMID 39405023."),
        bullet("Healthy older-adult dose-response review, with poor study quality and substantial heterogeneity. PMID 26420238."),
        bullet("Cycling and bone-health systematic review. PMID 23256921."),
        Spacer(1, 5 * mm),
        P("Links", "H2Roadman"),
        P("Full guide: <link href='https://roadmancycling.com/blog/strength-training-cyclists-over-50' color='#3D2D59'>roadmancycling.com/blog/strength-training-cyclists-over-50</link>"),
        P("Strength-session planner: <link href='https://roadmancycling.com/tools/strength-session-planner' color='#3D2D59'>roadmancycling.com/tools/strength-session-planner</link>"),
        P("Recovery screen: <link href='https://roadmancycling.com/tools/recovery-screen' color='#3D2D59'>roadmancycling.com/tools/recovery-screen</link>"),
        P("App early access: <link href='https://roadmancycling.com/app?source=strength-over-50-pdf' color='#3D2D59'>roadmancycling.com/app</link>"),
        Spacer(1, 5 * mm),
        callout(
            "Safety boundary",
            "This document is educational. It does not diagnose, treat or clear an individual for resistance training. Seek appropriately qualified help for relevant health conditions, pain, recent surgery or concerning symptoms.",
            color=colors.HexColor("#FCECE9"),
        ),
        Spacer(1, 6 * mm),
        P("ROADMAN CYCLING  /  RIDE STRONGER, LONGER", "CoverEyebrow"),
        P("Reviewed 31 August 2026. Version 1.0.", "SmallRoadman"),
    ]
)

doc.build(story)
print(OUTPUT)
