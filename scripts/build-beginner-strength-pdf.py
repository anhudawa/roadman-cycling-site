from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "12-week-strength-training-plan-for-cyclists.pdf"
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
        fontSize=33,
        leading=34,
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
        name="CalloutTitle",
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
        name="DarkTitle",
        parent=styles["CalloutTitle"],
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="DarkBody",
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
    )
)


def p(text, style="BodyRoadman"):
    return Paragraph(text, styles[style])


def bullet(text):
    return p(f"<font color='#FF6B5A'><b>+</b></font>&nbsp;&nbsp;{text}")


def callout(title, body, color=PALE):
    box = Table(
        [[p(title, "CalloutTitle")], [p(body)]],
        colWidths=[PAGE_W - 2 * MARGIN_X],
        hAlign="LEFT",
    )
    box.setStyle(
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
    return box


def styled_table(rows, widths, repeat_rows=1):
    data = []
    for row_index, row in enumerate(rows):
        data.append(
            [p(str(value), "TableHead" if row_index == 0 else "TableCell") for value in row]
        )
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
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 9 * mm, f"12-Week Strength Plan for Cyclists  |  {doc.page - 1}")
    canvas.drawRightString(
        PAGE_W - MARGIN_X,
        9 * mm,
        "roadmancycling.com/blog/cycling-strength-training-12-week-beginner-plan",
    )
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=MARGIN_X,
    leftMargin=MARGIN_X,
    topMargin=TOP,
    bottomMargin=BOTTOM,
    title="12-Week Strength Training Plan for Cyclists",
    author="Roadman Cycling",
    subject="A printable, evidence-bounded beginner strength plan for cyclists",
)

cover_frame = Frame(MARGIN_X, BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - TOP - BOTTOM, id="cover")
content_frame = Frame(MARGIN_X, BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - TOP - BOTTOM, id="content")
doc.addPageTemplates(
    [
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_page),
        PageTemplate(id="Content", frames=[content_frame], onPage=content_page, autoNextPageTemplate="Content"),
    ]
)

story = [
    Spacer(1, 31 * mm),
    p("ROADMAN CYCLING  /  PRINTABLE PLAN", "CoverEyebrow"),
    p("12-WEEK STRENGTH<br/>TRAINING PLAN<br/>FOR CYCLISTS", "CoverTitle"),
    p("A conservative beginner plan that learns, repeats and progresses without sacrificing the bike.", "CoverSub"),
    Spacer(1, 5 * mm),
    Table(
        [[p("Two non-consecutive sessions is a practical starting point - not a universal law.", "CoverNote")]],
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
    Spacer(1, 20 * mm),
    p("LAST REVIEWED 31 AUGUST 2026", "CoverEyebrow"),
    p("Full guide: roadmancycling.com/blog/cycling-strength-training-12-week-beginner-plan", "CoverNote"),
    NextPageTemplate("Content"),
    PageBreak(),
]

story += [
    p("How to use the plan", "H1Roadman"),
    p("This is a conservative starting framework for healthy cyclists who are new to resistance training. No cyclist study has tested this exact 12-week package. Choose exercise versions that fit your competence, equipment and joint comfort."),
    callout(
        "The programme-level rule",
        "Gym progress counts only when the whole week improves. If lifts rise while every priority ride becomes flat, reduce gym volume or change its placement.",
    ),
    Spacer(1, 5 * mm),
    p("The three phases", "H2Roadman"),
    styled_table(
        [
            ["Phase", "Frequency and work", "Progression test"],
            ["Weeks 1-2: Learn", "1-2 sessions; 1-2 sets; leave 3-4 good reps available.", "Technique stays controlled; symptoms do not worsen over 24-48 hours."],
            ["Weeks 3-6: Repeat", "Move toward 2 sessions; 2 sets on main patterns; mostly 6-12 reps.", "Both sessions repeat cleanly and priority rides retain quality."],
            ["Weeks 7-12: Progress", "2 sessions if recovered; 2-3 sets on selected main movements.", "Add one variable only when the whole week remains productive."],
        ],
        [38 * mm, 66 * mm, 56 * mm],
    ),
    Spacer(1, 5 * mm),
    p("Before week one", "H2Roadman"),
    bullet("Seek qualified guidance for relevant cardiovascular, neurological or orthopaedic conditions, osteoporosis, recent surgery or unexplained pain."),
    bullet("A beginner does not need a one-repetition-maximum test. Technique and tolerance come first."),
    bullet("Stop and seek urgent help for chest pain, fainting, unusual breathlessness or rapidly worsening neurological symptoms."),
    NextPageTemplate("Content"),
    PageBreak(),
]

session_a = [
    ["Exercise pattern", "Accessible option", "Weeks 1-2", "Weeks 3-12"],
    ["Knee-dominant", "Goblet squat or leg press", "1-2 x 6-10", "2-3 x 6-12"],
    ["Hip-dominant", "Supported hinge or RDL", "1-2 x 6-10", "2-3 x 6-12"],
    ["Upper pull", "Seated row or pull-down", "1-2 x 8-12", "2 x 8-12"],
    ["Calf", "Standing or seated raise", "1-2 x 8-15", "2 x 8-15"],
    ["Trunk / carry", "Carry or Pallof press", "2 short efforts", "2 controlled efforts"],
]
session_b = [
    ["Exercise pattern", "Accessible option", "Weeks 1-2", "Weeks 3-12"],
    ["Knee / single-leg", "Supported split squat or step-up", "1-2 x 6-10 each", "2-3 x 6-12 each"],
    ["Hip-dominant", "Hip thrust or kettlebell deadlift", "1-2 x 6-10", "2-3 x 6-12"],
    ["Upper push", "Push-up or dumbbell press", "1-2 x 8-12", "2 x 8-12"],
    ["Upper pull", "Row or pull-down", "1-2 x 8-12", "2 x 8-12"],
    ["Trunk", "Side plank or dead bug", "2 short efforts", "2 controlled efforts"],
]

story += [
    p("The two-session template", "H1Roadman"),
    p("These are example movement options, not mandatory lifts. Use support or a machine when it improves control and progression."),
    p("Session A", "H2Roadman"),
    styled_table(session_a, [38 * mm, 55 * mm, 31 * mm, 36 * mm]),
    Spacer(1, 5 * mm),
    p("Session B", "H2Roadman"),
    styled_table(session_b, [38 * mm, 55 * mm, 31 * mm, 36 * mm]),
    Spacer(1, 5 * mm),
    callout(
        "How hard should a set feel?",
        "Weeks 1-2: finish with three or four good repetitions available. Later, selected work can move toward one to three when technique, joint comfort and recovery are stable. Stop before form changes or pain appears.",
    ),
    Spacer(1, 5 * mm),
    p("My substitutions", "H2Roadman"),
    styled_table(
        [
            ["Pattern", "Selected exercise", "Starting load", "Notes"],
            ["Knee-dominant", "", "", ""],
            ["Hip-dominant", "", "", ""],
            ["Upper pull", "", "", ""],
            ["Upper push", "", "", ""],
            ["Trunk / carry", "", "", ""],
        ],
        [40 * mm, 53 * mm, 28 * mm, 39 * mm],
    ),
    NextPageTemplate("Content"),
    PageBreak(),
]

story += [
    p("Progress across 12 weeks", "H1Roadman"),
    styled_table(
        [
            ["Week", "Primary job", "Progression boundary"],
            ["1", "Learn session A; minimum work", "Leave 3-4 good reps; note next-day response"],
            ["2", "Learn session B; repeat A if recovered", "No added load unless both technique and comfort are stable"],
            ["3", "Move toward two sessions", "Add a repetition before adding load"],
            ["4", "Repeat the same menu", "Keep the programme recognisable"],
            ["5", "Progress one main movement", "Add reps, load or a set - never all three"],
            ["6", "Consolidate", "Priority rides remain the programme test"],
            ["7-8", "Progress selected main patterns", "Keep 1-3 good reps available"],
            ["9-10", "Continue controlled strength", "Plyometrics are optional, not compulsory"],
            ["11", "Hold useful work", "Reduce accessories if riding load is high"],
            ["12", "Retest the same measures", "Compare gym, bike and recovery outcomes"],
        ],
        [22 * mm, 67 * mm, 71 * mm],
    ),
    Spacer(1, 6 * mm),
    p("Progress only one variable", "H2Roadman"),
    bullet("Add a repetition inside the planned range."),
    bullet("Or add a small amount of load."),
    bullet("Or add one set to a selected main movement."),
    bullet("Do not increase repetitions, load, sets and exercise difficulty together."),
    Spacer(1, 5 * mm),
    callout(
        "Plyometrics are optional",
        "Jumping requires landing skill, appropriate health and sufficient strength. A beginner can continue progressing controlled resistance training through week 12.",
    ),
    NextPageTemplate("Content"),
    PageBreak(),
]

story += [
    p("Fit strength around the bike", "H1Roadman"),
    styled_table(
        [
            ["Option", "How it works", "Use it when"],
            ["Separate demanding sessions", "Place strength and the priority ride on different days or provide a longer gap.", "Either session repeatedly loses quality when combined."],
            ["Consolidate stress", "Complete the priority bike work first, lift later, then keep the next day easy.", "Time is limited and both sessions remain productive."],
        ],
        [42 * mm, 70 * mm, 48 * mm],
    ),
    Spacer(1, 6 * mm),
    p("Weekly placement worksheet", "H2Roadman"),
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
    Spacer(1, 6 * mm),
    p("Review the whole programme", "H2Roadman"),
    bullet("Did the key ride complete its intended work?"),
    bullet("Did soreness change movement, cadence or normal daily activity?"),
    bullet("Did joint discomfort appear or worsen?"),
    bullet("Did the selected lifts progress across several exposures?"),
    NextPageTemplate("Content"),
    PageBreak(),
]

story += [
    p("Readiness and session log", "H1Roadman"),
    p("One low HRV reading or one poor night is not a diagnosis. Use symptoms, sleep, energy, soreness, joint comfort, recent load and the next important session together."),
    styled_table(
        [
            ["Signal", "Green direction", "Caution direction"],
            ["Symptoms", "No illness symptoms", "Fever, respiratory or gastrointestinal illness"],
            ["Sleep", "Near personal pattern", "Repeated short or fragmented nights"],
            ["Energy / mood", "Normal for this rider", "Material drop across several days"],
            ["Soreness", "Mild and improving", "Changes movement or worsens"],
            ["Joint comfort", "Stable", "New, sharp or progressively worse pain"],
            ["Next ride", "Low priority or well separated", "Race, test or key intervals are close"],
        ],
        [35 * mm, 59 * mm, 66 * mm],
    ),
    Spacer(1, 5 * mm),
    callout(
        "Adjustment order",
        "1. Remove optional accessories.  2. Reduce three sets to two.  3. Keep familiar exercises and controlled load.  4. Shorten the session.  5. Skip and reassess when symptoms or pain make training inappropriate.",
    ),
    Spacer(1, 5 * mm),
    p("Session log", "H2Roadman"),
    styled_table(
        [
            ["Date", "Exercise", "Load", "Reps x sets", "Reps left", "Next-day note"],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
        ],
        [22 * mm, 45 * mm, 22 * mm, 29 * mm, 22 * mm, 28 * mm],
    ),
    Spacer(1, 6 * mm),
    Table(
        [
            [p("STRENGTH THAT FITS YOUR CYCLING", "DarkTitle")],
            [p("Roadman's upcoming iPhone app will choose a 30, 45 or 60-minute cyclist-specific strength session, protect key rides and use readiness guardrails to hold or reduce volume with a plain-language reason.", "DarkBody")],
            [p("<link href='https://roadmancycling.com/app?source=beginner-strength-plan' color='#FF6B5A'><b>Join the single early-access list at roadmancycling.com/app</b></link>", "DarkBody")],
        ],
        colWidths=[PAGE_W - 2 * MARGIN_X],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), INK),
                ("BOX", (0, 0), (-1, -1), 0.8, PURPLE_2),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        ),
    ),
    NextPageTemplate("Content"),
    PageBreak(),
]

story += [
    p("Evidence notes and sources", "H1Roadman"),
    p("This plan uses group-level evidence to set conservative boundaries. It does not claim one beginner cycling protocol has been proved."),
    p("Primary sources", "H2Roadman"),
    bullet("Cyclist-only heavy-strength meta-analysis: 17 controlled studies, 262 cyclists, low outcome certainty. PMID 40632222."),
    bullet("Non-failure versus failure resistance training: 20 studies, 556 healthy adults. PMID 42410632."),
    bullet("Concurrent-training sequence meta-analysis. PMID 28783467."),
    bullet("Cycling and bone-health systematic review. PMID 23256921."),
    bullet("WHO guidelines on physical activity and sedentary behaviour."),
    Spacer(1, 5 * mm),
    p("Links", "H2Roadman"),
    p("Full guide: roadmancycling.com/blog/cycling-strength-training-12-week-beginner-plan"),
    p("Exercise guide: roadmancycling.com/blog/cycling-gym-exercises-best"),
    p("Strength-session planner: roadmancycling.com/tools/strength-session-planner"),
    p("Recovery screen: roadmancycling.com/tools/recovery-screen"),
    p("App early access: roadmancycling.com/app"),
    Spacer(1, 5 * mm),
    callout(
        "Safety boundary",
        "This document is educational. It does not diagnose, treat or clear an individual for resistance training. Seek appropriately qualified help for relevant health conditions, pain, recent surgery or concerning symptoms.",
        color=colors.HexColor("#FCECE9"),
    ),
    Spacer(1, 6 * mm),
    p("ROADMAN CYCLING  /  BUILD THE HABIT, PROTECT THE BIKE", "CoverEyebrow"),
    p("Reviewed 31 August 2026. Version 1.0.", "SmallRoadman"),
]

doc.build(story)
print(OUTPUT)
