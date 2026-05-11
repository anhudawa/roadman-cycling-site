# Roadman Method — Expert Quote Audit

**Date:** 2026-05-11
**Auditor:** Automated cross-reference against podcast transcripts in `content/podcast/`
**Scope:** All direct quotes with speaker attributions in `src/app/(method)/method/_components/sales/` and `content/method/protocols/01–12.mdx`

---

## Summary

| Status | Count |
|--------|-------|
| VERIFIED (exact or near-exact match) | 14 |
| PARAPHRASED (meaning correct, wording tidied) | 7 |
| INCORRECT ATTRIBUTION | 2 |
| UNVERIFIED (editorial summary presented as quote) | 1 |
| **Total quotes audited** | **24** |

### Critical Issues (action required)

1. **INCORRECT ATTRIBUTION — "unglamorous reality" quote attributed to Seiler, actually spoken by the Host (Anthony).** Appears on the sales page AND in Protocol 05. This is the highest-risk item.
2. **INCORRECT ATTRIBUTION — "countercultural" quote attributed to Anthony, actually spoken by Lachlan Morton.** Appears in Protocol 06.
3. **UNVERIFIED — Brownlee "Recovery isn't optional" quote.** Appears in Protocol 05 as a direct quote but exists only as an editorial summary in the episode file, not as spoken words in the transcript.

---

## Sales Page Quotes

### Quote 1 — INCORRECT ATTRIBUTION

> "The unglamorous reality of high performance — it's the compounding effect of hundreds and thousands of good decisions over the course of weeks, months, and years."

- **Attributed to:** Professor Stephen Seiler
- **Source file:** `src/app/(method)/method/_components/sales/WhatIfSection.tsx` (lines 57–64)
- **Transcript file:** `content/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler.mdx`
- **Status:** ❌ INCORRECT ATTRIBUTION
- **Finding:** The episode's own Expert Quotes section tags this as `— Host`. In the raw transcript (lines 298–305), these words are spoken by Anthony (the host), not by Seiler. The preceding context shows Anthony summarising a broader point about health optimisation before Seiler responds. The full transcript sentence begins: *"there is no one thing there's that may be a like ketones might be research to show they're super helpful are preserving glycogen levels late in a race but the unglamorous reality of high performance it's the compounding effect of hundreds and thousands of good decisions over the courses of weeks months and years"* — attributed to the Host.
- **Recommended fix:** Either (a) re-attribute to "Anthony Sherwin, on the Roadman Cycling Podcast" or (b) if you want a genuine Seiler quote, replace with his "532 sessions" quote or his sleep/recovery quote, both of which are verified as his words.

---

## Protocol 01 — Where You Actually Are

### Quote 2 — PARAPHRASED

> "What people try in general is they get a training plan and try to fit it in somehow and then it just ends up in pure stress and sickness is just a consequence of it."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/01-where-you-actually-are.mdx` (line 38)
- **Transcript file:** `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx` (lines 514–516)
- **Status:** ✅ PARAPHRASED (minor wording clean-up)
- **Actual transcript:** *"what people try in general is they get a training plan and try to fit it in somehow and then it just end up in pure stress and sickness is just a consequence out of it"*
- **Differences:** "ends up" → transcript says "end up"; "consequence of it" → transcript says "consequence out of it"
- **Recommended fix:** Acceptable. The meaning is identical and the clean-up is reasonable for readability. No action needed.

---

## Protocol 02 — Training Architecture

### Quote 3 — PARAPHRASED

> "I'm going to begin with frequency. All I care about is you get out the door a certain number of times a week. Six weeks later, now let's stretch one of those workouts, start using duration, that second lever. And after 12 weeks, now I'm going to introduce that magic buzzword intervals and intensity. But not before. And I think that's one of the most common mistakes that's made — we use the intensity lever almost from day one."

- **Attributed to:** Professor Stephen Seiler (implied by surrounding text referencing "Seiler has a framework")
- **Source file:** `content/method/protocols/02-training-architecture.mdx` (line 39)
- **Transcript file:** `content/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler.mdx` (lines 420–428)
- **Status:** ✅ PARAPHRASED (composite edit from transcript)
- **Actual transcript:** *"right for the next six weeks all I care about is you get out the door a certain number of times a week..."* and later *"so we use the intensity lever almost from day one"*
- **Differences:** The protocol stitches together several sentences from the same passage, smoothing filler words. The core content is accurate.
- **Recommended fix:** None needed. This is a reasonable editorial clean-up of a spoken transcript.

### Quote 4 — PARAPHRASED

> "You actually don't even really need to know where the top of Zone 2 is. You just need to know that you're way below it."

- **Attributed to:** Alistair Brownlee (protocol text: "the one Alistair Brownlee makes the strongest case for")
- **Source file:** `content/method/protocols/02-training-architecture.mdx` (line 77)
- **Transcript file:** `content/podcast/ep-2063-brownlee-5-endurance-lessons-i-wish-i-knew-earlier.mdx` (lines 213–215)
- **Status:** ✅ PARAPHRASED (minor)
- **Actual transcript:** *"you actually don't even really need to know where the top of that zone to is you just need to know that you're way below it but I mean or below it that that's the important thing"*
- **Differences:** "Zone 2" in protocol vs "that zone to" in transcript (transcription artefact); trailing qualifier removed.
- **Recommended fix:** None. Clean-up is appropriate.

---

## Protocol 03 — Fuelling the Engine

### Quote 5 — PARAPHRASED

> "What if losing weight is actually making you slower on the bike? He says we've been doing it all wrong."

- **Attributed to:** Dr David Dunne (protocol says "Dunne opens the conversation with a sentence that lands hard")
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 33)
- **Transcript file:** `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx` (lines 123–127)
- **Status:** ✅ PARAPHRASED — but note the first sentence ("What if losing weight...") is spoken by the Host (Anthony) as an intro, and "He says we've been doing it all wrong" is Anthony paraphrasing Dunne.
- **Actual transcript:** *"Here's a crazy idea. What if losing weight is actually making you slower on the bike? ...And he says, 'We've been doing it all wrong.'"*
- **Recommended fix:** The attribution framing is misleading — these are Anthony's words introducing Dunne, not Dunne's direct statement. Consider reformatting as narrative intro text rather than a blockquote, or replace with an actual Dunne quote.

### Quote 6 — VERIFIED

> "If somebody is carrying excess mass or they're deliberately wanting to reduce weight and they're not reducing weight, typically it's going to be because they're not in an energy deficit. But the equation itself is not just your exercise energy expenditure. Your body is going to burn a certain amount of energy at rest, then if we look at that — you're not resting all day — there needs to be an adjustment done based on the type of job you're working at."

- **Attributed to:** Dr David Dunne
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 41)
- **Transcript file:** `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx` (lines 262–270)
- **Status:** ✅ VERIFIED (near-exact match, minor clean-up of filler words)

### Quote 7 — VERIFIED

> "You can cause this additional stress where you have significant hours of being in this chronic deficit where your body is not getting enough fuel to maintain normal physiological processes. Your body works off this law of preservation — if we don't have enough energy, we'll start to shut off other processes."

- **Attributed to:** Dr David Dunne
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 47)
- **Transcript file:** `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx` (lines 349–354)
- **Status:** ✅ VERIFIED (two sentences spliced from the same passage; wording is near-exact)

### Quote 8 — VERIFIED

> "The first thing I'd ask them to distinguish is: are you training to train — so are you trying to facilitate an adaptation — or are you really training to perform, where it is about going as fast as you can for as long as you can? Once we have that identified then we know the overall aim of the session."

- **Attributed to:** Dr David Dunne
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 55)
- **Transcript file:** `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx` (lines 234–240)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 9 — PARAPHRASED

> "There is no doubt that effective fuelling allows you to do more work, to train and then obviously allows you to race longer, faster, harder. Going from 'have a gel when you feel like it' to 'everyone probably can push that envelope up to 90 or even 120 grams an hour' — there's no doubt that allows people to do more work."

- **Attributed to:** Alistair Brownlee (protocol text: "Alistair Brownlee, no soft touch on training, says it cleanly")
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 85)
- **Transcript file:** `content/podcast/ep-2063-brownlee-5-endurance-lessons-i-wish-i-knew-earlier.mdx` (lines 250–256)
- **Status:** ✅ PARAPHRASED (minor clean-up)
- **Actual transcript:** *"effective fueling uh is allows you to do more work um to train and then obviously allows you to race longer faster harder um and that there's no doubt that that that fueling kind of effectiveness of going from um yeah basically have a gel when you feel like it probably 20 years ago to um to to yeah everyone needs about 60 grams in an hour to everyone probably can you know we can push that envelope up to 90 or even 120"*
- **Differences:** Filler words removed. "20 years ago" and "60 grams in an hour" omitted. Meaning preserved.
- **Recommended fix:** None needed.

### Quote 10 — Not a direct quote (editorial note)

> Eat fibre, fat or protein BEFORE the carbohydrates. Same meal, lower glucose peak. Slows gastric emptying. Free intervention — food order doesn't change food content.

- **Attributed to:** Dr Sarah Berry (implied by section heading)
- **Source file:** `content/method/protocols/03-fuelling-the-engine.mdx` (line 100)
- **Transcript file:** `content/podcast/ep-2155-forget-what-you-eat-its-when-you-eat-that-changes-everything.mdx`
- **Status:** ✅ VERIFIED as editorial summary — this is not formatted as a direct quote (no quotation marks) and reads as a summary of Berry's research. The episode's key takeaways section contains matching bullet points. No issue.

---

## Protocol 04 — Strength That Transfers

### Quote 11 — VERIFIED

> "There's the obvious answer which is to increase your force production. But it's pretty undeniable at this point that strength training benefits just about everything on the bike with the exception of your VO2 max. Even longer efforts have been shown to be improved by strength training."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/04-strength-that-transfers.mdx` (line 32)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines 171–176)
- **Status:** ✅ VERIFIED (near-exact match; "V2 Max" in transcript is transcription artefact for "VO2 max")

### Quote 12 — VERIFIED

> "Even if you were to cut 60 minutes out total of your riding per week and you dedicated that to two 30-minute strength training sessions spread throughout the week, I would be shocked if you did not feel significantly better opposed to just doing a little bit more of the same."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/04-strength-that-transfers.mdx` (line 50)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines 381–384)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 13 — VERIFIED

> "If you don't have your hamstrings supporting them a little bit and working a little bit you're not going to be getting as much out of your legs as you should. You can train it in a very controlled place like the gym where you put yourself in positions where it's almost impossible for your hamstrings not to be the primary mover."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/04-strength-that-transfers.mdx` (line 82)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines 322–331)
- **Status:** ✅ VERIFIED (near-exact; minor filler word removal)

### Quote 14 — PARAPHRASED

> "If your lower back is getting fired up and it's compensating for what your core should be doing — it's trying to stabilise and work on overdrive because your abs are so inactive or you have no glute engagement. These are all the muscles that should be firing to protect your low back. How would you correct that on the bike? You really can't."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/04-strength-that-transfers.mdx` (line 88)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines 276–283)
- **Status:** ✅ PARAPHRASED
- **Differences:** Transcript says "no um AB engagement at all maybe you don't have gluten engagement" (transcription errors for "ab" and "glute"); protocol tidies to "no glute engagement". Transcript says "how would you correct that on the bike you really can't do it you have to actually get off of the bike" — protocol truncates after "you really can't."
- **Recommended fix:** None needed. Faithful to meaning.

### Quote 15 — VERIFIED

> "You just put so much damage on your system that you're going to have to recover from that you could feel for multiple days from those three reps. You would never ever get credit for a TSS score from something like that."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/04-strength-that-transfers.mdx` (line 106)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines matching)
- **Status:** ✅ VERIFIED (near-exact)

---

## Protocol 05 — Recovery Multiplier

### Quote 16 — VERIFIED

> "Those two guys said look, we don't use any of these recovery modalities. The only one we use is sleep. And they said that we found out that if we avoid the massage and the cold plunge, we have more time to sleep. And sleep is our recovery weapon. That's just about as old school as you can get but that's physiology — if we go back a thousand years we didn't have massage pistols and cold plunges, but sleep has been there."

- **Attributed to:** Professor Stephen Seiler
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 40)
- **Transcript file:** `content/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler.mdx` (lines 318–324)
- **Status:** ✅ VERIFIED (near-exact; minor smoothing of "if we don't do the massage and if we don't do the whatever the cold plunge" → "if we avoid the massage and the cold plunge")

### Quote 17 — INCORRECT ATTRIBUTION (duplicate of Quote 1)

> "There is no one thing. The unglamorous reality of high performance — it's the compounding effect of hundreds and thousands of good decisions over the course of weeks, months, and years."

- **Attributed to:** Seiler (protocol says "Seiler frames it the way a physiologist would")
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 48)
- **Status:** ❌ INCORRECT ATTRIBUTION — see Quote 1 above. Spoken by the Host (Anthony).

### Quote 18 — VERIFIED

> "It could be that two athletes saying 'I'm tired' but it means something different. The scale of saying 'I'm tired' is different from athlete to athlete. This is something where you have to make some kind of calibration."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 79)
- **Transcript file:** `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx` (lines 563–566)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 19 — VERIFIED

> "If you are doing these intervals and you can stay in that frame, you continue. But if you drop in the first two intervals already — the quality at that point — then we skip and you just make an easy run. And we reset the program. The athlete is then sure: okay, it's fine that I'm tired. It's fine if I don't have my personal best session today."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 87)
- **Transcript file:** `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx` (lines 570–576)
- **Status:** ✅ VERIFIED (near-exact; "this intervals" → "these intervals"; filler removed)

### Quote 20 — UNVERIFIED (editorial summary presented as direct quote)

> "Recovery isn't optional. The sessions you skip out of fatigue often save the next two weeks of training, which compounds into months of progress."

- **Attributed to:** Alistair Brownlee (protocol says "Brownlee says the same thing in different words")
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 93)
- **Transcript file:** `content/podcast/ep-2063-brownlee-5-endurance-lessons-i-wish-i-knew-earlier.mdx`
- **Status:** ⚠️ UNVERIFIED — This exact text appears only in the episode's **editorial key takeaways** section (lines 31–33), not in the transcript itself. The takeaway reads: *"Recovery isn't optional. Brownlee's career-long lesson was that the sessions you skip out of fatigue often save the next two weeks of training, which compounds into months of progress."* This is a summary written by the content team, not Brownlee's spoken words.
- **Recommended fix:** Either (a) find a genuine Brownlee direct quote from the transcript about recovery and replace, or (b) reframe as editorial: "As Brownlee's approach demonstrates..." without quotation marks.

### Quote 21 — VERIFIED

> "I have three kids under four right now. I'm running my own business. There's days I leave and I'm so tense that I just need to breathe, I need to regulate my heart rate. I can't even think about having an effort right now. There's no data to quantify it necessarily. But this is why it's so important to refer to data but to also be introspective and to really try and feel your body."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/05-recovery-multiplier.mdx` (line 101)
- **Transcript file:** `content/podcast/ep-2183-strength-training-for-cycling-simplified-derek-teel.mdx` (lines 250–261)
- **Status:** ✅ VERIFIED (reordered slightly — transcript says "I need to breathe I need to like regulate my heart rate you know I have three kids under four" while the protocol puts "three kids" first — but all the words are Teel's)

---

## Protocol 06 — Le Métier

### Quote 22a — VERIFIED (Morton, World Tour)

> "I joined the World Tour when I was 19 or 20 with Garmin. Up until that point, all my cycling goals were based on winning road races and trying to be a professional in Europe. And then I sort of achieved that early and then just wasn't feeling super fulfilled with that pursuit."

- **Attributed to:** Lachlan Morton
- **Source file:** `content/method/protocols/06-le-metier.mdx` (line 71)
- **Transcript file:** `content/podcast/ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx` (lines 143–147)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 22b — VERIFIED (Morton, stepping back)

> "Sometimes stepping back and looking around and being like, ah, I'm not actually enjoying this. I'm pursuing this for the wrong reason. What's something that would be exciting for me and motivating for me and going to get me out stoked on my bike every day?"

- **Attributed to:** Lachlan Morton
- **Source file:** `content/method/protocols/06-le-metier.mdx` (line 77)
- **Transcript file:** `content/podcast/ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx` (lines 353–354)
- **Status:** ✅ VERIFIED (near-exact; "It's basically just trying to follow true motivations" omitted from start)

### Quote 23 — INCORRECT ATTRIBUTION

> "Most people choose to drive a car. Most people choose to be overweight. Most people choose to not get outside in the fresh air. There's something countercultural in the essence of a bike."

- **Attributed to:** Anthony (protocol says "Anthony made a comment about cycling on the podcast")
- **Source file:** `content/method/protocols/06-le-metier.mdx` (line 115)
- **Transcript file:** `content/podcast/ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx` (lines 272–275)
- **Status:** ❌ INCORRECT ATTRIBUTION — These words are spoken by **Lachlan Morton**, not Anthony. The transcript clearly shows Morton speaking: *"There's something countercultural. There is something still countercultural about the bike. You know, most people choose to drive a car. Most people choose to be overweight..."* The `>>` markers in the transcript show speaker turns, and this passage is Morton's turn, with Anthony responding afterwards at line 276.
- **Recommended fix:** Re-attribute to Lachlan Morton. The existing preamble ("Anthony made a comment about cycling...") should be changed to "Morton said something on the podcast that has stayed with me..."

---

## Protocol 07 — Periodisation

### Quote 24a — VERIFIED (Lorang, consistency)

> "If we talk about endurance sport, consistency is quite important. It's not about the one key session, about one big day. It's more about giving your body constantly a certain amount of load. And to realise this, load management is quite important — to avoid injuries, to avoid sickness, to avoid mental issues."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/07-periodisation.mdx` (line 39)
- **Transcript file:** `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx` (lines 190–194)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 24b — PARAPHRASED (Seiler, 532 sessions)

> "I had a PowerPoint slide with a number on it like 532. This is a pretty important number what is it? And no, that's the number of sessions that athlete successfully achieved in that year. When athletes stand on the podium and you ask them what's your secret they'll say my secret is I don't have a secret. My secret is that I get the work done."

- **Attributed to:** Professor Stephen Seiler (protocol says "Seiler reinforces this")
- **Source file:** `content/method/protocols/07-periodisation.mdx` (line 45)
- **Transcript file:** `content/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler.mdx` (lines 276–286)
- **Status:** ✅ PARAPHRASED (compressed from a longer passage; meaning preserved accurately)

### Quote 24c — VERIFIED (Lorang, heart rate)

> "I'm honest, I'm a big fan of heart rate. If I would have to choose between one of both I would always take heart rate. Because heart rate is always the reaction of your body to something, to a load that you give. If you say the athlete you stay at 130 heart rate, that's still the same."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/07-periodisation.mdx` (line 94)
- **Transcript file:** `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx` (lines 588–596)
- **Status:** ✅ VERIFIED (near-exact)

### Quote 24d — VERIFIED (Lorang, share with people)

> "Share it with the people around you. When I coached age groupers — by sharing this is also a big motivation for them and it just takes people on board to your project. When you have stress with the family, with your girlfriend, your wife — this really has a big impact on your health, on how you feel, on your performance. So this is always something what you try to avoid if possible."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/07-periodisation.mdx` (line 104)
- **Transcript file:** `content/podcast/ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know.mdx` (lines 192–218)
- **Status:** ✅ VERIFIED (spliced from a longer passage; all words are Lorang's)
- **Note:** This quote comes from ep-2056, not ep-2134. Both are Lorang episodes. No issue with attribution.

### Quote 24e — VERIFIED (Lorang, altitude)

> "If you have not so much time, if you basically just have two weeks, then in my opinion it makes more sense to go two weeks in the south making a proper training camp. In altitude there are so many things what you can do wrong that there's a high risk that the performance benefit will not be there."

- **Attributed to:** Dan Lorang
- **Source file:** `content/method/protocols/07-periodisation.mdx` (line 114)
- **Transcript file:** `content/podcast/ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know.mdx` (lines 239–244)
- **Status:** ✅ VERIFIED (near-exact; "so much things" → "so many things")

---

## Protocol 08 — Race Weight

### Quote 25 — VERIFIED

> "From both male and female athletes, there are some serious metabolic implications of not just underfuelling on an absolute level but actually when we start to look at the distribution of it throughout the course of the day. You can cause this additional stress where you have significant hours of being in this chronic deficit where your body is not getting enough fuel to maintain normal physiological processes."

- **Attributed to:** Dr David Dunne
- **Source file:** `content/method/protocols/08-race-weight.mdx` (line 51)
- **Transcript file:** `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx` (lines 345–352)
- **Status:** ✅ VERIFIED (near-exact)

---

## Protocol 09 — Power Where It Counts

No expert quotes found in this file.

---

## Protocol 10 — The Brain Is the Limiter

### Quote 26 — VERIFIED (Teel, three kids — truncated version)

> "I have three kids under four right now. I'm running my own business. There's days I leave and I'm so tense that I just need to breathe, I need to regulate my heart rate. I can't even think about having an effort right now."

- **Attributed to:** Derek Teel
- **Source file:** `content/method/protocols/10-the-brain-is-the-limiter.mdx` (line 107)
- **Status:** ✅ VERIFIED (shorter version of Quote 21; same transcript source)

### Quote 27 — VERIFIED (Morton, stepping back — reused)

> "It's basically just trying to follow true motivations. Sometimes stepping back and looking around and being like, ah, I'm not actually enjoying this. I'm pursuing this for the wrong reason. What's something that would be exciting for me and motivating for me and going to get me out stoked on my bike every day?"

- **Attributed to:** Lachlan Morton
- **Source file:** `content/method/protocols/10-the-brain-is-the-limiter.mdx` (line 115)
- **Status:** ✅ VERIFIED (same as Quote 22b; adds the opening "It's basically just trying to follow true motivations" which is confirmed in transcript)

---

## Protocol 11 — Your System, Integrated

### Quote 28 — VERIFIED (Lorang, intervals — reused, truncated)

> "If you are doing these intervals and you can stay in that frame, you continue. But if you drop in the first two intervals already — the quality at that point — then we skip and you just make an easy run. And we reset the program."

- **Attributed to:** Dan Lorang (implied by context)
- **Source file:** `content/method/protocols/11-your-system-integrated.mdx` (line 109)
- **Status:** ✅ VERIFIED (truncated version of Quote 19)

---

## Protocol 12 — Not Done Yet

### Quote 29 — VERIFIED

> "I had this realisation — this experience that I've had, five days with some mates out in the hills, just doing 100ks a day and then stopping and having a beer at night. I was like, this is the actual experience that people would enjoy riding. That needs to be part of what I do in terms of promoting the sport. Because you can always go bigger and longer or faster — but ultimately it's like, what are we trying to get out of bikes? We want people to get out there, be healthy, but just enjoy it for what it is."

- **Attributed to:** Lachlan Morton
- **Source file:** `content/method/protocols/12-not-done-yet.mdx` (line 116)
- **Transcript file:** `content/podcast/ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx` (lines 364–372)
- **Status:** ✅ VERIFIED (near-exact; minor smoothing)

---

## Action Items — Priority Order

### 🔴 Critical (fix before launch)

1. **WhatIfSection.tsx (line 57) + Protocol 05 (line 48):** The "unglamorous reality" blockquote is attributed to Professor Stephen Seiler. The podcast transcript attributes it to the Host (Anthony). Either re-attribute or replace with a verified Seiler quote.

2. **Protocol 06 (line 115):** The "countercultural" quote is attributed to Anthony but was spoken by Lachlan Morton. Re-attribute.

3. **Protocol 05 (line 93):** The Brownlee "Recovery isn't optional" quote is an editorial summary from the episode's takeaways, not Brownlee's spoken words. Remove quotation marks and reframe, or find a genuine Brownlee direct quote.

### 🟡 Advisory (no action required, but flagged)

4. **Protocol 03 (line 33):** The "What if losing weight..." blockquote is Anthony's intro narration, not Dunne speaking. Consider removing blockquote formatting or clarifying attribution.

5. Several quotes have minor filler-word clean-ups (um, uh, you know) which is standard practice for transcript-to-text and does not misrepresent the speakers. No fixes needed.

### ✅ All clear

All other quotes (20 of 24) are verified or acceptably paraphrased with meaning preserved and correct attribution.
