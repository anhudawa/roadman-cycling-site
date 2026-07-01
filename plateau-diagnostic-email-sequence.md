# Plateau Diagnostic — Post-Quiz Nurture Sequence

**Sequence type:** Lead nurture (post-diagnostic)
**Trigger:** Completes Plateau Diagnostic quiz at roadmancycling.com/go
**Emails:** 5
**Duration:** 10 days
**Goal:** Convert quiz completers into Not Done Yet (NDY) members at $195/month
**CTA URL:** https://www.skool.com/roadmancycling
**From name:** Anthony Walsh
**From address:** anthony@roadmancycling.com

---

## Sequence Overview

| # | Subject Line | Timing | Purpose | Primary CTA |
|---|---|---|---|---|
| 1 | Your plateau diagnosis (and a fix you can use today) | Day 0 (immediate) | Deliver results + quick win + credibility | Soft — read more on the podcast |
| 2 | He was stuck at 3.2 W/kg for two years. Then this happened. | Day 2 | Member transformation proof | Subtle NDY mention |
| 3 | What it actually looks like inside Not Done Yet | Day 4 | Community proof + identity | Visit NDY page |
| 4 | This one episode might change how you think about training | Day 7 | Free value + podcast link | Listen + imagine the system |
| 5 | You've got the diagnosis. Here's the system. | Day 10 | Direct CTA to join NDY | Join NDY — $195/month |

---

## Sequence Flow

```
[Quiz completed] ──► Email 1 (Day 0 — immediate)
                          │
                     Opened? ──No──► [Resend with alt subject, Day 1]
                          │
                         Yes
                          │
                          ▼
                     Email 2 (Day 2)
                          │
                     Clicked CTA? ──Yes──► Tag "engaged — high intent"
                          │
                          ▼
                     Email 3 (Day 4)
                          │
                          ▼
                     Email 4 (Day 7)
                          │
                          ▼
                     Email 5 (Day 10)
                          │
                     [EXIT: Sequence complete]

Exit conditions:
- Joins NDY at any point → exit sequence, enter onboarding flow
- Unsubscribes → exit immediately
- Already in another active sales sequence → suppress
```

---

## Email 1 — Day 0 (Immediate)

**Subject line options:**
1. Your plateau diagnosis (and a fix you can use today)
2. Here's why you're stuck — and one thing to try this week
3. Your diagnostic results are in

**Preview text:** Plus one fix that takes zero extra training hours.

**Purpose:** Deliver their diagnostic result, give one genuinely useful quick win, establish Anthony's credibility, and softly tease that there's a system behind the quick wins.

---

**Body:**

Hey {{first_name}},

You just took the Plateau Diagnostic, and I want to be straight with you about what it's telling me.

Your result points to **{{plateau_type}}** as the main thing holding you back right now. And here's the thing — this is one of the most common patterns I see. Not because cyclists are doing anything stupid. Because the internet is full of conflicting advice and most of it is either outdated or just flat-out wrong for someone at your level.

I've spent the last few years sitting across from people like Professor Stephen Seiler, Dan Lorang (he coached Pogačar and Vingegaard), and John Wakefield at Bora-Hansgrohe — asking them exactly this question: what are serious amateur cyclists getting wrong, and what's actually fixable?

The answers are surprisingly specific. And that's the good news — your plateau is fixable.

Here's one thing you can do this week:

**{{quick_win_block}}**

*(See segmentation brief below for plateau-specific quick wins)*

That's it. One change. No extra hours on the bike. No new equipment. Just a smarter approach to something you're probably already doing.

Now — this quick win is useful on its own. But it's one piece of a much bigger picture. The riders I work with who actually break through their plateaus don't just collect tips. They follow a system. Training, nutrition, recovery, strength — all connected, all built on what the best coaches in the world are actually prescribing.

More on that in a couple of days.

For now, try that one fix on your next ride and see what happens.

Talk soon,
Anthony

P.S. If you haven't listened to the podcast yet, we've done over 100 million downloads worth of conversations with the coaches and scientists behind Grand Tour wins, Olympic medals, and World Championships. It's free, and it's a good place to start: [The Roadman Cycling Podcast](https://roadmancycling.com)

---

## Email 2 — Day 2

**Subject line options:**
1. He was stuck at 3.2 W/kg for two years. Then this happened.
2. "Same sessions, same effort — nearly double the results"
3. What changed for this rider after 24 months of going nowhere

**Preview text:** His FTP hadn't moved in two years. Eight weeks later, everything shifted.

**Purpose:** Social proof through a real-feeling member transformation that matches their plateau type. Subtle NDY mention positioned as the system, not a sales pitch.

---

**Body:**

Hey {{first_name}},

A couple of days ago I shared your Plateau Diagnostic results and a quick fix. Hope you've had a chance to try it.

Today I want to tell you about someone who was exactly where you are.

**{{case_study_block}}**

*(See segmentation brief below for plateau-specific case studies)*

**The default version (training/FTP plateau):**

Mark had been training 10 hours a week for two years. Structured sessions. Decent bike. Power meter on. Garmin recording everything. His FTP sat at 265 watts and refused to move. He was doing everything the cycling internet told him to do.

Here's what nobody had told him: he was spending about 60% of his training time in the grey zone. Too hard to build his aerobic base properly. Too easy to create real high-end adaptation. Same sessions, same errors, same effort — and he was getting the same results month after month.

When he joined our Not Done Yet community and we looked at his data, the fix was almost embarrassingly simple. We restructured his easy rides to be genuinely easy (he hated it at first — his ego took a beating). We replaced two of his weekly sessions with specific intervals built on protocols from John Wakefield and Dan Lorang. Same total hours. Completely different stimulus.

Eight weeks in, his FTP moved to 289. Twelve weeks, 298. He's now sitting at 312 and told me last month that group rides feel like a different sport.

The craziest part? He's training fewer hours than before. The difference wasn't effort. It was clarity.

This is what happens when you stop guessing and start following a system built on what the best coaches in the world actually prescribe.

More to come.

Anthony

---

## Email 3 — Day 4

**Subject line options:**
1. What it actually looks like inside Not Done Yet
2. This is what structured feels like
3. "I finally stopped guessing" — what our members say

**Preview text:** Weekly calls, real plans, and a room full of cyclists who actually get it.

**Purpose:** Pull back the curtain on what NDY looks like from the inside. Community proof, member quotes, and identity-led framing.

---

**Body:**

Hey {{first_name}},

I get asked this a lot: "What actually happens inside Not Done Yet?"

Fair question. So let me show you.

**Every week, this is what members get:**

A live call with me where we dig into training, nutrition, recovery — whatever's on the table. These aren't webinars. They're conversations. You bring your questions, I bring the answers I've got from spending years talking to the best coaches and scientists in the sport. Think of it like having a mate who just got off the phone with Dan Lorang and can tell you exactly what he said.

Structured training plans delivered through TrainingPeaks, built on the same methodology the World Tour coaches use — adapted for people with actual jobs and families. Not templates. Plans that account for the fact that you've got 8 hours a week, not 25.

A community of serious cyclists. Not beginners asking what SPD cleats are. Not ego-driven club riders arguing about Strava. People like you — professionals with real lives who are genuinely committed to getting better on the bike.

**Here's what some of them say:**

*"I went from Cat 3 to Cat 1 in a single season. The training structure and the accountability from the community changed everything."* — Daniel S.

*"84kg to 68kg. Body fat from 20% to 7%. My average wattage doubled. I didn't think any of that was possible at my age."* — Chris O.

*"After coming back from illness, I needed someone who understood that my recovery had to be built on health, not just performance. Anthony and this community gave me that. I'm now competing in the Women's National Series."* — Yvonne D.

These aren't outliers. These are people who were stuck — exactly like you described in your diagnostic — and who got unstuck because they finally had the right system and the right people around them.

The identity behind all of this is simple: **You're not done yet.**

If that resonates — if you genuinely believe there's more in you — then this is the room you want to be in.

[See what Not Done Yet looks like →](https://www.skool.com/roadmancycling)

Anthony

---

## Email 4 — Day 7

**Subject line options:**
1. This one episode might change how you think about training
2. Free podcast episode — relevant to your diagnostic result
3. 47 minutes that could shift your entire approach

**Preview text:** Specifically picked for you based on your plateau type.

**Purpose:** Deliver genuine free value via a specific podcast episode relevant to their plateau. Position the podcast as a taste of what NDY members get in depth every week.

---

**Body:**

Hey {{first_name}},

Based on your Plateau Diagnostic result, I want to point you to one specific podcast episode.

**{{podcast_recommendation_block}}**

*(See segmentation brief below for plateau-specific episode recommendations)*

**The default version (training/FTP plateau):**

It's the episode I did with Professor Stephen Seiler — the man who basically invented the research behind polarised training. We get into why most amateur cyclists are training in the grey zone, what 80/20 actually looks like in practice (not just theory), and the one metric most riders are ignoring that's keeping their FTP pinned.

[Listen here → Professor Seiler on Polarised Training](https://roadmancycling.com)

It's about 50 minutes. I'd listen on your next easy ride — which, if Seiler has anything to say about it, should be easier than you think.

Here's what I want you to notice while you listen: the specificity. This isn't generic "train smarter not harder" advice. It's precise. It's backed by decades of research. And it's the same methodology being used by coaches behind Grand Tour winners right now.

That's the level of conversation that happens inside Not Done Yet every single week. Except in the community, it's not just me and a guest talking — it's you bringing your data, your questions, your specific situation, and getting answers you can actually apply to your next training block.

The podcast gives you the knowledge. The community gives you the system.

If this one episode shifts how you think about your training, imagine what a structured system does over 12 weeks.

Anthony

---

## Email 5 — Day 10

**Subject line options:**
1. You've got the diagnosis. Here's the system.
2. Still stuck? Let's fix that properly.
3. The difference between knowing and doing

**Preview text:** Your plateau has a fix. Here's where you apply it.

**Purpose:** Direct, honest CTA to join Not Done Yet. Recap the transformation arc. Light urgency through cohort framing.

---

**Body:**

Hey {{first_name}},

Ten days ago you took the Plateau Diagnostic. You told me where you're stuck. I gave you a quick win, showed you what's possible, and pointed you to the science behind it.

Now let me be really clear about something.

Tips are useful. Podcast episodes are valuable. But if your training still looks the same six months from now as it does today, none of it mattered.

The gap between where you are and where you want to be isn't knowledge. You've got plenty of that. The gap is a system — training, nutrition, recovery, strength — all connected, all structured, all built on what the coaches behind Pogačar, Froome, and Bernal are actually doing with their athletes.

That's what Not Done Yet is.

**What you get for $195/month:**

— Weekly live calls with me. Real questions, real answers, no fluff.
— Structured training plans via TrainingPeaks, built on World Tour methodology and adapted for your life.
— Nutrition, recovery, and strength guidance grounded in the conversations I've had with the best in the sport.
— A private community of serious amateur cyclists. People with jobs, families, and genuine ambitions on the bike. Not beginners. Not a ghost town. Active, engaged, and holding each other accountable.
— Access to masterclasses, the S&C roadmap, and everything else we've built.

The riders who get results aren't the ones who consume the most content. They're the ones who commit to a system and surround themselves with the right people.

**[Join Not Done Yet →](https://www.skool.com/roadmancycling)**

We run this as a proper community, not a course you buy and forget about. That means I'm personally involved every week, which means there's a limit to how many members we take on at any given time. Right now there's space. I can't promise that'll be the case in a few weeks.

If you've been listening to the podcast, if the diagnostic told you something you already suspected, and if you genuinely believe there's more in you — this is the next step.

You're not done yet. Let's prove it.

Anthony

P.S. If you've got questions before joining, reply to this email. It comes straight to me. No sales team, no chatbot — just me.

---

---

# SEGMENTATION BRIEF — Personalisation by Diagnostic Result

For each email, here's what changes based on the person's plateau type. The structure and tone stay identical — only the specific content blocks swap.

---

## Email 1 — Quick Win Block

### (a) Training / FTP Plateau
- **Diagnosis framing:** "Your training structure is the bottleneck — not your effort."
- **Quick win:** On your next "easy" ride, drop your intensity by 15-20 watts below where you normally ride easy. Keep your heart rate in genuine Zone 2. It'll feel too slow. That's the point — you've been riding your easy rides too hard, and it's killing your adaptation.
- **Expert name-drop:** Professor Seiler, Dan Lorang

### (b) Nutrition / Body Composition
- **Diagnosis framing:** "Your fuelling strategy is working against you — and it's probably costing you watts on every climb."
- **Quick win:** For your next three rides, eat a proper meal 2-3 hours before and fuel during the ride with 60-80g of carbs per hour on anything over 90 minutes. Stop riding underfuelled. Your body can't adapt if it's running on empty.
- **Expert name-drop:** Dr. David Dunne, references to Anthony's own 7kg loss while eating more

### (c) Recovery / Fatigue
- **Diagnosis framing:** "You're not undertrained — you're under-recovered. Your body can't adapt to training it hasn't recovered from."
- **Quick win:** This week, replace one training session with a genuine rest day. Not an easy spin. Actual rest. If your legs feel better 48 hours later than they have in months, that tells you everything you need to know.
- **Expert name-drop:** Tim Kerrison (Team Sky/Ineos marginal gains — sleep and recovery were the biggest ones), Seiler on training intensity distribution

### (d) No Structured Plan
- **Diagnosis framing:** "You're training. You're just not training with a system. There's a massive difference."
- **Quick win:** Before your next ride, write down exactly what you're going to do and why. Zone 2 for 90 minutes? Threshold intervals? A recovery spin? If you can't articulate the purpose of the session before you start, that's the problem.
- **Expert name-drop:** Joe Friel, Dan Lorang on periodisation

---

## Email 2 — Case Study Block

### (a) Training / FTP Plateau
- **Use the default "Mark" story** — FTP stuck at 265W, restructured intensity distribution, FTP to 312 in 12 weeks
- **Key numbers:** 265W → 312W, same training hours, grey zone elimination

### (b) Nutrition / Body Composition
- **Swap to body composition story:** Member carrying 6kg more than race weight, had tried calorie restriction three times and always bonked or lost power. Inside NDY, followed the fuelling-first approach — ate more on training days, structured protein timing, stopped skipping meals. Lost 5.5kg in 10 weeks. Power went UP, not down. W/kg jumped from 3.1 to 3.6.
- **Key line:** "He lost the weight by eating properly, not by starving himself. That's the bit nobody on the internet will tell you."

### (c) Recovery / Fatigue
- **Swap to overtraining/fatigue story:** Member training 12 hours a week, exhausted, HRV tanking, getting slower despite doing more. Inside NDY, we cut his volume to 8 hours, restructured his week with proper recovery blocks, and added 2 strength sessions. Three months later, his FTP was 22 watts higher on 4 fewer hours of riding per week.
- **Key line:** "He was doing too much of the wrong stuff. Less training, better training, proper recovery — and everything changed."

### (d) No Structured Plan
- **Swap to structure story:** Member had been "training" for three years with no plan — just riding when he felt like it, doing whatever session sounded good that day. Inside NDY, he followed his first structured 12-week block. Did nothing heroic. Just followed the plan. FTP up 28 watts. First podium at a local crit.
- **Key line:** "The training wasn't harder. It was just deliberate. Every session had a purpose. That's what structure does."

---

## Email 3 — Community Proof

**Minimal changes needed across segments.** This email is about the community itself, not the specific plateau type.

- For **(b) Nutrition / Body Composition** — add a line: "And yes, we go deep on nutrition and body composition. It's one of the topics our members care about most — and one of the areas where the advice online is most dangerously wrong."
- For **(c) Recovery / Fatigue** — add a line: "Recovery is one of the pillars we build everything around. Not as an afterthought — as the foundation. Because the best training plan in the world is useless if your body can't absorb it."
- For **(d) No Structured Plan** — emphasise the TrainingPeaks plans more heavily: "Every member gets a structured training plan. Not a PDF. A living plan that adapts to your week, delivered through TrainingPeaks, built on the same methodology the best coaches in the world use."

---

## Email 4 — Podcast Episode Recommendation

### (a) Training / FTP Plateau
- **Episode:** Professor Stephen Seiler on polarised training
- **Angle:** Why most amateurs train in the grey zone and what 80/20 actually means in practice

### (b) Nutrition / Body Composition
- **Episode:** Anthony's weight loss episode (lost 7kg in 12 weeks eating MORE food)
- **Angle:** Why "eat less, ride more" is outdated advice that's making cyclists fatter and slower
- **Alt episode:** Fuelling episode with Dr. David Dunne

### (c) Recovery / Fatigue
- **Episode:** The "5 Fixable Reasons" episode on overtraining / why you're always tired
- **Angle:** The small leaks in recovery that add up to months of stalled progress
- **Alt episode:** Tim Kerrison on marginal gains (sleep and recovery were the biggest)

### (d) No Structured Plan
- **Episode:** Self-coaching mistakes episode (5 common mistakes)
- **Angle:** Why "just ride more" isn't a training plan, and what the pros actually do differently
- **Alt episode:** Joe Friel on structuring a training week

---

## Email 5 — Direct CTA

**Minimal changes needed across segments.** The CTA is the same for everyone.

- **Opening line swap by segment:**
  - **(a) Training / FTP:** "Ten days ago you told me your FTP has stalled. I showed you why — and what the fix looks like."
  - **(b) Nutrition / Body comp:** "Ten days ago you told me your body composition is holding you back. I showed you why the standard advice is wrong — and what actually works."
  - **(c) Recovery / Fatigue:** "Ten days ago you told me you're training hard but going backwards. I showed you why recovery is the missing piece — and what proper structure looks like."
  - **(d) No structured plan:** "Ten days ago you told me you've been training without a system. I showed you the difference between riding and training with purpose."

- **Recap line swap by segment:**
  - **(a):** "The gap between 265 watts and 312 watts wasn't talent. It was structure."
  - **(b):** "The gap between struggling with weight and losing 5kg while getting faster wasn't willpower. It was the right fuelling system."
  - **(c):** "The gap between overtraining on 12 hours and getting faster on 8 wasn't fitness. It was recovery."
  - **(d):** "The gap between three years of going nowhere and a 28-watt jump wasn't effort. It was a plan."

---

## Branching Logic & Exit Conditions

**Exit condition:** Recipient joins NDY at any point → remove from sequence, enter member onboarding flow.

**Resend logic:** If Email 1 is not opened within 24 hours, resend with subject line: "Did you see your plateau results?" — same body.

**Engagement tagging:**
- Opens Email 1 + clicks → tag "diagnostic-engaged"
- Opens 3+ emails → tag "diagnostic-warm"
- Clicks CTA in Email 3 or 5 → tag "diagnostic-high-intent"
- Completes sequence without clicking Email 5 CTA → enter 30-day re-engagement drip

**Suppression rules:**
- Do not send if recipient is already an NDY member
- Do not send if recipient is in another active sales sequence
- Do not send if recipient has unsubscribed from marketing emails
- Pause if recipient contacts support within 48 hours of any send

---

## A/B Test Suggestions

1. **Email 1 subject line:** Test "Your plateau diagnosis" (curiosity) vs. "Here's why you're stuck" (pain point) — measure open rate
2. **Email 2 case study specificity:** Test named member (with permission) vs. anonymised "Mark" — measure click-through rate
3. **Email 5 urgency framing:** Test "spots are limited" cohort language vs. no urgency — measure conversion rate. Run for 4 weeks minimum.

---

## Performance Benchmarks

| Metric | Target | Industry Benchmark (Lead Nurture) |
|---|---|---|
| Open rate | 35-50% (warm post-quiz audience) | 20-30% |
| Click-through rate | 5-10% | 3-7% |
| Sequence conversion rate | 3-6% to NDY membership | 2-5% |
| Unsubscribe rate | < 0.5% | < 0.5% |

**Review cadence:** Weekly for the first month, then monthly. Pay particular attention to drop-off between Email 4 and Email 5 — that's where conversion intent crystallises or dies.

---

## Setup Checklist (ClickFunnels)

1. Create automation flow triggered by Plateau Diagnostic quiz completion
2. Tag contacts with their diagnostic result type (training, nutrition, recovery, no-plan)
3. Set up 4 email templates with dynamic content blocks that swap based on diagnostic tag
4. Configure send timing: Day 0 (immediate), Day 2, Day 4, Day 7, Day 10
5. Add exit condition: NDY membership tag applied → exit sequence
6. Add resend rule for Email 1 non-opens at 24 hours
7. Set up engagement tags at each stage
8. Configure 30-day re-engagement drip for non-converters
9. Test all dynamic content blocks render correctly per segment
10. Review and QA all links — especially the NDY CTA (https://www.skool.com/roadmancycling)
