# Beehiiv Automation Build Guide

3 remaining persona sequences (Event Prep, Comeback, Plateau) plus mutual exclusion between all sequences.

**Estimated total build time: 90-120 minutes** (30-40 min per sequence if you batch the copy-paste work)

---

## Table of Contents

1. [Tag Strategy](#tag-strategy)
2. [Mutual Exclusion Strategy](#mutual-exclusion-strategy)
3. [Build Order Checklist](#build-order-checklist)
4. [Sequence 1: Event Prep](#sequence-1-event-prep)
5. [Sequence 2: Comeback](#sequence-2-comeback)
6. [Sequence 3: Plateau](#sequence-3-plateau)

---

## Tag Strategy

### Tags Required

| Tag | Purpose | Applied When |
|-----|---------|-------------|
| `listener` | Persona tag - podcast listener / learning phase | Subscriber self-selects on Skool free group join |
| `event-prep` | Persona tag - training for a specific event | Subscriber self-selects on Skool free group join |
| `comeback` | Persona tag - returning to cycling after time away | Subscriber self-selects on Skool free group join |
| `plateau` | Persona tag - stuck / FTP flatlined | Subscriber self-selects on Skool free group join |
| `self-coached` | Persona tag - already self-coaching (future sequence) | Subscriber self-selects on Skool free group join |
| `listener-finished` | Completed the listener sequence | Applied by automation on completion |
| `event-prep-finished` | Completed the event prep sequence | Applied by automation on completion |
| `comeback-finished` | Completed the comeback sequence | Applied by automation on completion |
| `plateau-finished` | Completed the plateau sequence | Applied by automation on completion |
| `in-sequence` | Currently active in any persona sequence | Applied on entry, removed on completion |

### Tag Flow

```
Subscriber joins Skool free group
    |
    v
Website/Skool form assigns ONE persona tag
(listener | event-prep | comeback | plateau | self-coached)
    |
    v
Beehiiv automation triggers on that tag
    + adds "in-sequence" tag
    + checks subscriber is NOT already in another sequence
    |
    v
7 emails over 7 days
    |
    v
On completion:
    - Remove persona tag (e.g. "event-prep")
    - Add finished tag (e.g. "event-prep-finished")
    - Remove "in-sequence" tag
```

---

## Mutual Exclusion Strategy

### Recommended Approach: Option A + B Combined

Beehiiv does not have a native "remove from other automations" action the way ClickFunnels does. The best approach combines **conditional entry** with a **shared exclusion tag**.

#### How It Works

1. **On entry to any persona automation**, the first step adds the tag `in-sequence`.
2. **Each automation's entry condition** checks: subscriber does NOT have the tag `in-sequence`.
3. **On completion of any automation**, the final steps remove `in-sequence`.

This means:
- If a subscriber is tagged `event-prep` while already running through the `listener` sequence, they will NOT enter the event-prep automation because they already have `in-sequence`.
- Once they finish the listener sequence, `in-sequence` is removed. If their persona tag changes later, they can enter a new sequence.

#### Implementation in Each Automation

**Entry condition** (set when creating the automation):
- Trigger: Tag added -> `[persona tag]`
- Condition: Subscriber does NOT have tag `in-sequence`

**Step 1 action** (before first email):
- Add tag: `in-sequence`

**Final steps** (after last email):
- Remove tag: `[persona tag]` (e.g. `event-prep`)
- Add tag: `[persona tag]-finished` (e.g. `event-prep-finished`)
- Remove tag: `in-sequence`

#### Edge Case: What If Someone Gets Tagged While in a Sequence?

The persona tag will sit on the subscriber but the automation will not fire because of the `in-sequence` gate. Two options:

- **Option 1 (simple):** Accept that they miss the second sequence. The welcome sequence already delivered value.
- **Option 2 (thorough):** After removing `in-sequence` on completion, add a 1-day delay then re-check if any other persona tag exists. If so, re-trigger. This requires a second automation per persona ("re-entry check") and adds complexity. Not recommended unless you see significant multi-tagging in the data.

**Recommendation:** Go with Option 1. The ClickFunnels data shows very few subscribers getting multiple persona tags. Build the simple version first.

#### Alternative: Segment-Based Triggers

If Beehiiv's "Tag added" trigger does not support NOT-conditions natively, create segments instead:

| Segment Name | Definition |
|-------------|-----------|
| `Event Prep - Eligible` | Has tag `event-prep` AND does NOT have tag `in-sequence` AND does NOT have tag `event-prep-finished` |
| `Comeback - Eligible` | Has tag `comeback` AND does NOT have tag `in-sequence` AND does NOT have tag `comeback-finished` |
| `Plateau - Eligible` | Has tag `plateau` AND does NOT have tag `in-sequence` AND does NOT have tag `plateau-finished` |

Then set each automation trigger to: "Subscriber enters segment [X] - Eligible"

---

## Build Order Checklist

### Pre-Build (5 min)

- [ ] Create all tags in Beehiiv: `event-prep`, `comeback`, `plateau`, `in-sequence`, `event-prep-finished`, `comeback-finished`, `plateau-finished`
- [ ] Confirm `listener`, `listener-finished`, and `in-sequence` tags exist from the listener sequence build
- [ ] Confirm the custom field `first_name` exists (used in Plateau email 7)

### Per-Sequence Build (30-40 min each)

For each of the 3 sequences, do the following in order:

1. **Create new Automation** -> Name it -> Set trigger (tag added)
2. **Add entry condition** -> does NOT have tag `in-sequence`
3. **Add action step** -> Add tag `in-sequence`
4. **Add Email 1** (no delay - immediate)
   - Paste subject line
   - Paste preview text (if any)
   - Paste body into the rich text editor
   - Set "From" to Anthony Walsh
5. **Add delay** -> 1 day
6. **Add Email 2** -> paste subject + body
7. **Repeat** delay + email for emails 3-7
8. **After Email 7, add 3 action steps:**
   - Remove tag: `[persona tag]`
   - Add tag: `[persona tag]-finished`
   - Remove tag: `in-sequence`
9. **Review** all 7 emails for formatting
10. **Set automation to Active**

### Post-Build (10 min)

- [ ] Go back to the Listener automation and add the same `in-sequence` logic if not already there
- [ ] Test each sequence with a test subscriber
- [ ] Verify mutual exclusion by tagging a test subscriber with two persona tags simultaneously

### Beehiiv Editor Tips

- Beehiiv uses a rich text editor. Paste body content as plain text first, then format.
- Bold text: select and Cmd+B (the sequences use bold for pillar headings in emails 4-5).
- Links: highlight text, Cmd+K, paste URL.
- The emoji (pointing hand) in CTAs pastes fine from this doc.
- Merge tag for first name in Beehiiv: `{{subscriber.first_name}}` -- used in Plateau Email 7.

---

## Sequence 1: Event Prep

**Automation name:** `Event Prep (7-day persona sequence)`
**Trigger:** Tag added -> `event-prep`
**Entry condition:** Subscriber does NOT have tag `in-sequence`
**From:** Anthony Walsh <admin@roadmancycling.com>

### Step 0: Action
- Add tag: `in-sequence`

---

### Email 1 of 7
- **Delay:** Immediate (no delay)
- **Subject:** `You're in $€” here's where to start`
- **Preview text:** `The one thing to do first inside the Clubhouse`

**Body:**

```
Hey,

Welcome to the Roadman Cycling Clubhouse.

You've got an event on the horizon $€” and you're in the right place. Here's where to start:

ðŸ‘‰ Grab your free 16-week training plan: [CLASSROOM LINK]

Pick the plan that fits where you are right now $€” not where you used to be. Start there.

Over the next 7 days, I'll share some of the most useful things I've learned from 1,300+ conversations with coaches and sport scientists $€” specifically around event preparation and fuelling.

Talk soon,
Anthony
```

---

### Email 2 of 7
- **Delay:** 1 day after Email 1
- **Subject:** `The fuelling mistake that ruins 90% of riders`
- **Preview text:** (none)

**Body:**

```
Hey,

Here's something that surprised me when I spoke to Dr David Dunne, World Tour nutritionist who's fuelled some of the best stage racers in the world.

He said most amateur cyclists are chronically under-fuelling on the bike and then overeating off it. The exact opposite of what works.

For an event lasting 2+ hours, your in-race fuelling strategy isn't a nice-to-have; it's the difference between finishing strong and bonking on the last climb.

He breaks it all down in the Nutrition Masterclass inside the Clubhouse; it's free, and it's one of the most valuable things we've ever put together. Especially the sections on race-day fuelling and managing energy across a long day in the saddle.

ðŸ‘‰ Watch the Nutrition Masterclass: [LINK]

If you've ever bonked on a long ride or felt your legs disappear in the final hour, this will clear up why.

Anthony
```

---

### Email 3 of 7
- **Delay:** 1 day after Email 2
- **Subject:** `How Ian prepared for the Haute Route Alps`
- **Preview text:** (none)

**Body:**

```
Hey,

I want to share Ian Hennessy's story because it's probably close to where you are right now.

Ian took up cycling as a way to get fit and lose weight. He joined Roadman coaching and made real improvements in his training technique. Then he set a big goal - the Haute Route Alps.

He completed it. And now he's planning his next challenge, knowing he's got a team behind him that's already got him through the hardest multi-day event on the calendar.

Mark O'Donnell is another rider who's used Roadman coaching to prepare for bigger European sportives and major climbing routes. He's been a client for almost 4 years. His words: the flexibility to work around his schedule and the structure of the plan are what made it work alongside work and family.

I'm not sharing this to sell you anything. I'm sharing it because the difference between showing up prepared and showing up hoping for the best is night and day - and both Ian and Mark will tell you it wasn't talent that got them there. It was the system.

More on this system tomorrow

Anthony
```

---

### Email 4 of 7
- **Delay:** 1 day after Email 3
- **Subject:** `Run this 5-point check before your event`
- **Preview text:** (none)

**Body:**

```
Hey,

You've got an event coming. You're training for it. But training is only one of five things that will determine how you perform on the day.

Score yourself honestly on each of these headings $€” 1 point (not doing it), 2 points (doing it but guessing), 3 points (dialled in):

1. Training structure. Is your plan periodised and counting backwards from your event date? Or are you just getting the miles in and hoping the fitness arrives on time?

2. Nutrition. Have you practised your in-race fuelling strategy on training rides? Do you know exactly what you'll eat at each hour mark, how many grams of carbs, and what to do when your stomach turns at hour 5? Or are you planning to figure it out on the day?

3. Strength & conditioning. Are you doing targeted work to protect against the injuries that come with ramping up volume? Or are you adding hours and hoping your knees hold together?

4. Recovery. Are your deload weeks planned in advance? Is your recovery nutrition timed and prescribed? Or do you just rest when something hurts?

5. Accountability. Is someone reviewing your build-up and adjusting when life gets in the way? Or are you following a generic programme and improvising when you miss a week?

Add up your score.

Under 8? You're preparing for your event with serious gaps. And gaps don't show up in training $€” they show up on race day, on the climb you needed your legs for, in the final hour when your fuelling falls apart.

8$€“12? You've got some bases covered but you're guessing on the rest. That's the difference between crossing the line knowing you did everything right and crossing it wondering what you left on the table.

13$€“15? You're dialled. Go enjoy the ride.

Anthony
```

---

### Email 5 of 7
- **Delay:** 1 day after Email 4
- **Subject:** `Here's what proper event preparation actually looks like`
- **Preview text:** (none)

**Body:**

```
Hey,

Last email I asked you to score yourself across 5 areas. If you're like most event riders, your training is decent but the other four pillars have gaps.

Here's what it looks like when all 5 are built for you inside the Not Done Yet Collective:

Training: A personalised plan counting backwards from your event date. A coach reviews your files and gets on one-on-one calls with you - adjusting week by week, not just handing you a template and disappearing.

Nutrition: A race-day fuelling strategy you'll practise before the event. Exact amounts by meal, changing based on the session. So when you hit the final climb you've got fuel in the tank, not a bonk waiting to happen.

Strength & conditioning: A programme that builds climbing power and injury resilience during your volume ramp-up. Designed to complement your bike work, not wreck your legs.

Recovery: Prescribed deload weeks, recovery nutrition, sleep protocols $€” all planned around your build-up. Not guessed at when you're already cooked.

Accountability: Weekly live Q&A where you can ask event-specific questions in real time. A monthly one-on-one coaching call to review your build-up, adjust the plan, and make sure nothing falls through the cracks.

Anthony
```

**Note:** The ClickFunnels version of this email included a CTA to the 7-day trial and pricing ($195/month). The JSON source includes this extended version. Consider adding:

```
Our "Not Done Yet" coaching community is $195/month with a 7-day free trial. That's a coach in your corner building your event preparation across all five pillars $€” not just another training plan. Think of it this way: your event entry probably cost more than that. This is the investment that makes the entry fee worth it.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

If it's not for you, the Clubhouse is yours to keep either way.
```

---

### Email 6 of 7
- **Delay:** 1 day after Email 5
- **Subject:** `"I can probably just wing the preparation"`
- **Preview text:** (none)

**Body:**

```
Hey,

You can show up to your event without structured coaching. Most people do. And most people finish with a story about the climb where their legs gave out, the feed station where their stomach turned, or the final 30km where they were surviving instead of riding.

Ian Hennessy completed the Haute Route Alps - one of the hardest multi-day events on the calendar. He didn't just survive it. He finished knowing he'd prepared properly, with a team behind him across all five pillars.

He had a monthly coaching call tracking his build-up and a weekly Q&A to troubleshoot event-specific questions in real time. He's already planning his next challenge.

Mark O'Donnell has been a coaching client for almost 4 years. He uses the system to prepare for bigger European sportives and major climbing routes. He said the flexibility to work around his schedule $€” alongside work and family $€” is what makes it sustainable. Not a training camp followed by burnout. A system that fits his actual life, with a coach who adjusts when things change.

$195/month is a real investment. The 7-day trial is free specifically so you can see whether the coaching, the community, and the system are worth it before you spend a cent.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Anthony
```

---

### Email 7 of 7
- **Delay:** 1 day after Email 6
- **Subject:** `You've got one shot at this`
- **Preview text:** (none)

**Body:**

```
Hey,

I'll keep this short.

You signed up for an event because something in you wants to prove you can do it properly. Not just finish, perform & enjoy it.

You know where the gaps are. Training might be covered. But nutrition, strength, recovery, and accountability $€” the four pillars that separate "I survived" from "I nailed it" $€” are they dialled in?

The 7-day trial is free. One week with a coach reviewing your files, a plan built around your event, and a community preparing alongside you. That's enough time to know.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Either way, I'm glad you're here. Go make it count.

Anthony
```

---

### Post-Email Actions
- Remove tag: `event-prep`
- Add tag: `event-prep-finished`
- Remove tag: `in-sequence`

---

## Sequence 2: Comeback

**Automation name:** `Comeback (7-day persona sequence)`
**Trigger:** Tag added -> `comeback`
**Entry condition:** Subscriber does NOT have tag `in-sequence`
**From:** Anthony Walsh <admin@roadmancycling.com>

### Step 0: Action
- Add tag: `in-sequence`

---

### Email 1 of 7
- **Delay:** Immediate (no delay)
- **Subject:** `You're in $€” here's where to start`
- **Preview text:** `The one thing to do first inside the Clubhouse`

**Body:**

```
Hey,

Welcome to the Roadman Cycling Clubhouse.

You said you're coming back to cycling after time away. First - respect. That's not easy. But you're here, and that's the hardest part done.

Here's where to start:

ðŸ‘‰ Grab your free 16-week training plan: [CLASSROOM LINK]

Pick the plan that fits where you are right now $€” not where you used to be. Start there.

Over the next couple of weeks, I'll share some of the most useful things I've learned from 1,300+ conversations with coaches and sport scientists, specifically around coming back safely, rebuilding fitness, and managing the mental side of a comeback.

Talk soon,
Anthony
```

---

### Email 2 of 7
- **Delay:** 1 day after Email 1
- **Subject:** `The biggest mistake comeback riders make`
- **Preview text:** (none)

**Body:**

```
Hey,

I recently went through my own comeback. Went from 86kg to 79kg in 12 weeks, eating more food than ever before. No calorie counting. No fasted rides. And I got faster, not slower.

The biggest mistake I see comeback riders make $€” and I made it too $€” is ramping up too fast. You remember what you could do, so you train like you're still that person. Then you get injured. Then you stop for four months. Then you start again and repeat the cycle.

The fix is counterintuitive: go slower to go faster. Build your base properly. Get the nutrition right first. The fitness follows.

Dr David Dunne and Dr Sam Impey break this down in the free Nutrition Masterclass inside the Clubhouse. Especially relevant for comeback riders: how to fuel for the work required, not the work you wish you were doing.

ðŸ‘‰ Watch the Nutrition Masterclass: [LINK]

Your body hasn't forgotten how to ride. You just need to give it the right conditions to remember.

Anthony
```

---

### Email 3 of 7
- **Delay:** 1 day after Email 2
- **Subject:** `From 84kg to 68kg $€” how Chris did it`
- **Preview text:** (none)

**Body:**

```
Hey,

I want to share Chris O'Connor's story with you because I think you'll see yourself in it.

Chris came to Roadman after decades away from the saddle. 84kg. Body fat at 20%. Average wattage he was embarrassed to mention.

12 months later: 68kg. Body fat from 20% to 7%. Average wattage doubled. Weekly 100km+ rides became the norm.

His words: Anthony set him on "a dietary, mental and physical journey of enlightenment and true discovery."

Chris didn't do anything extreme. He followed a structured plan, got his nutrition dialled in with expert guidance, and had a community and coaching team keeping him accountable.

I'm not sharing this to sell you anything. I'm sharing it because if Chris can come back after decades off the bike and transform like that, the question isn't whether it's possible. It's whether you're ready to commit to a system.

More on that tomorrow

Anthony
```

---

### Email 4 of 7
- **Delay:** 1 day after Email 3
- **Subject:** `The 5 things your comeback actually needs`
- **Preview text:** (none)

**Body:**

```
Hey,

Every comeback I've seen fail $€” and I've seen a lot $€” fails for the same reason. The rider comes back, starts training, and ignores everything else. Then they get injured. Or burn out. Or lose 3kg, put 4 back on, and quietly stop.

It's not a motivation problem. It's a system problem. A successful comeback needs five things working together.

Score yourself honestly on each of the below headings - 1 point (not doing it), 2 points (doing it but guessing), 3 points (dialled in):

1. Training structure. Are you following a plan that respects where you're starting from - progressive, patient, built for a comeback? Or are you training like you used to and wondering why your knees hurt by week 6?

2. Nutrition. Do you know exactly what to eat - amounts changing by the meal based on what you're training that day? Or are you either restricting calories hoping the weight drops or eating the same thing every day regardless?

3. Strength & conditioning. Are you doing sessions designed to prevent the injuries that have killed every previous comeback attempt? Or are you skipping the gym entirely because you don't know what to do?

4. Recovery. Do you have prescribed protocols - sleep targets, recovery nutrition, deload weeks planned in advance? Or is your recovery strategy "rest when something hurts"?

5. Accountability. Does anyone notice when you've gone quiet? Is there a coach reviewing your files and a community checking in on your progress? Or are you doing this alone and hoping consistency sticks this time?

Add up your score.

Under 8? You're relying on motivation alone. That's why previous comebacks didn't stick.

8$€“12? You know what's missing but you're guessing your way through it. This is where most comeback riders stall out.

13$€“15? Your system is working. Keep going.

Anthony
```

---

### Email 5 of 7
- **Delay:** 1 day after Email 4
- **Subject:** `Here's what a coached comeback actually looks like`
- **Preview text:** (none)

**IMPORTANT NOTE:** In the original ClickFunnels workflow, Email 5 had identical body content to Email 4 (a duplicate that was never updated). The content below is taken from `cf-email-sequences.md` which has the correct, distinct Email 5 copy. Use this version.

**Body:**

```
Hey,

Last email I asked you to think about the 5 pillars your comeback needs. If you're like most riders coming back, you've got training covered but the other four are gaps.

Here's what it looks like when all 5 are built for you inside the Not Done Yet Coaching Community:

Training: A personalised daily plan that meets you where you are $€” not where you were. A coach reviews your files, gets on one-on-one calls with you, and builds your progression week by week. No guessing.

Nutrition: Exact amounts prescribed by the meal, changing based on what you're training that day. This is the fastest way to see body composition results $€” and those visible results are what keep a comeback alive.

Strength & conditioning: A programme that prevents the injuries that have stopped every previous attempt. Built to complement your riding, not compete with it.

Recovery: Prescribed protocols for sleep, nutrition timing, and deload weeks. Your body is coming back from a long break $€” recovery isn't optional, it's the foundation.

Accountability: Weekly live Q&A where you can ask me anything about your return to form. A monthly one-on-one coaching call where we review your progress, look at your body composition, adjust the next training block, and keep the comeback on track. And a community of real riders $€” many on their own comebacks $€” who show up on calls and keep each other honest.

Anthony
```

**Note:** Consider adding a CTA here as per the event-prep Email 5 pattern:

```
The "Not Done Yet" coaching community is $195/month with a 7-day free trial.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about
```

---

### Email 6 of 7
- **Delay:** 1 day after Email 5
- **Subject:** `"Is $195/month worth it for someone starting from scratch?"`
- **Preview text:** (none)

**Body:**

```
Hey,

$195/month is a real number. I'm not going to pretend it isn't. So let me tell you exactly who gets the most value from it.

It's not the riders who are already at 90% and need a small tweak. It's the riders who have the most to gain across all five pillars.

Chris O'Connor came back after decades off the bike at 84kg. Every single pillar was at zero. Training, nutrition, strength, recovery, accountability $€” all of it needed building from the ground up.

That's where coaching makes the biggest difference. He had a monthly one-on-one call where his coach reviewed his body composition, adjusted his training, and kept the comeback on track.

A weekly Q&A where he could ask anything. And a community that noticed when he wasn't there. 12 months later: 68kg, 7% body fat, wattage doubled.

Brian Morrissey is 52, works shifts, and saw his FTP jump 15% in 10 weeks $€” training less than the year before. He didn't need more hours. He needed all five pillars working together for the first time. His words: "This really works."

The riders starting from furthest back get the biggest return because there's so much low-hanging fruit across nutrition, strength, recovery, and accountability that they've never addressed.

A coach sees that immediately on the first call. An app never will.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Anthony
```

---

### Email 7 of 7
- **Delay:** 1 day after Email 6
- **Subject:** `You haven't lost it $€” you've just been away`
- **Preview text:** (none)

**Body:**

```
Hey,

I'll keep this short.

You came back to cycling because something inside you isn't done yet. You remember what it felt like to be strong on the bike. That person is still in there.

The free tools inside the Roadman Clubhouse are a starting line.

"Not Done Yet" is where the comeback becomes real $€” a coach who reviews your files, a monthly one-on-one call to keep your plan honest, a weekly Q&A, and a community that won't let you disappear.

The trial is free. That's enough time to know.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Either way, I'm glad you're here. The best chapter hasn't been written yet.

Anthony
```

---

### Post-Email Actions
- Remove tag: `comeback`
- Add tag: `comeback-finished`
- Remove tag: `in-sequence`

---

## Sequence 3: Plateau

**Automation name:** `Plateau (7-day persona sequence)`
**Trigger:** Tag added -> `plateau`
**Entry condition:** Subscriber does NOT have tag `in-sequence`
**From:** Anthony Walsh <admin@roadmancycling.com>

### Step 0: Action
- Add tag: `in-sequence`

---

### Email 1 of 7
- **Delay:** Immediate (no delay)
- **Subject:** `You're in $€” here's where to start`
- **Preview text:** `The one thing to do first inside the Clubhouse`

**Body:**

```
Hey,

Welcome to the Roadman Cycling Clubhouse.

You said your results have flatlined despite putting in the hours. That's one of the most common and most fixable problems in cycling $€” and you're in the right place to sort it.

Here's where to start:

ðŸ‘‰ Grab your free 16-week training plan: [CLASSROOM LINK]

Pick the plan that matches your goals (gravel, road, or sportive). It takes 2 minutes.

Over the next couple of weeks, I'll share some of the most useful things I've learned from 1,300+ conversations with World Tour coaches and sport scientists $€” specifically around breaking through plateaus. No fluff. Just what actually works.

Talk soon,
Anthony
```

---

### Email 2 of 7
- **Delay:** 1 day after Email 1
- **Subject:** `The #1 reason your FTP is stuck (it's not what you think)`
- **Preview text:** (none)

**Body:**

```
Hey,

After 1,300+ podcast conversations, the single biggest insight I've had about plateau-stuck cyclists is this: most are training too hard on easy days and too easy on hard days.

Professor Stephen Seiler calls it the "black hole" of training $€” that grey zone where you're working hard enough to build fatigue but not hard enough to trigger adaptation. It's the most common trap in amateur cycling.

The fix isn't more hours. It's polarity $€” making your easy sessions genuinely easy and your hard sessions genuinely hard.

I put together a free nutrition masterclass inside the Clubhouse with Dr David Dunne and Dr Sam Impey (both World Tour nutritionists). One thing they cover is how under-fuelling compounds the grey zone problem $€” your body can't recover from sessions it wasn't properly fuelled for.

ðŸ‘‰ Watch the Nutrition Masterclass: [LINK]

If your FTP has been stuck for months, the answer is almost certainly in training structure + fuelling. Not more volume.

Anthony
```

---

### Email 3 of 7
- **Delay:** 1 day after Email 2
- **Subject:** `From Cat 3 to Cat 1 in a single season`
- **Preview text:** (none)

**Body:**

```
Hey,

Daniel Stone was doing everything right $€” or so he thought.

12 hours a week on the bike. Structured intervals. Watching his TSS. Reading every article, listening to every podcast. He was the most informed rider in the club and one of the least improved.

Cat 3 and stuck. Same guys dropping him on the same climbs. He'd finish a race, check his power file, and see the numbers were fine $€” but the results never matched the effort.

That's the thing about plateaus. It's not that you're lazy. It's that you're working hard inside a broken system.

When Daniel joined the Not Done Yet Collective, the first thing we changed wasn't his training volume $€” it was his polarisation. He was living in the grey zone. Every ride was "kind of hard." Nothing was truly easy. Nothing was truly brutal. His body had adapted to mediocrity and stopped responding.

We restructured his week: genuine Zone 1 & 2 on easy days, properly programmed intensity on hard days, strength sessions he'd never done before, and a nutrition overhaul that meant he was actually fuelled for the sessions that mattered.

Within 4 months he was a different rider. By the end of the season he'd gone from Cat 3 to Cat 1. Same guy. Same hours. Different system.

I'm sharing this because Daniel's story isn't exceptional $€” it's what happens when a serious rider stops self-coaching and plugs into a system built on how the best coaches in the world actually train athletes.

More on that soon.

Anthony
```

---

### Email 4 of 7
- **Delay:** 1 day after Email 3
- **Subject:** `The real reason your FTP is stuck`
- **Preview text:** (none)

**Body:**

```
Hey,

I want you to try something this week. Score yourself honestly on five areas $€” the five pillars that every World Tour programme is built on. Give yourself a 1 (not doing it), a 2 (doing it but guessing), or a 3 (dialled in with confidence).

1. Training structure. Are your easy days genuinely easy and your hard days genuinely hard? Or does every ride end up somewhere in the middle? Is someone looking at your files and telling you what to change $€” or are you coaching yourself?

2. Nutrition. Do you know exactly how many carbs you need before a threshold session versus a Zone 2 day $€” and does your breakfast actually change based on that? Or are you eating the same thing every morning regardless of what's on the plan?

3. Strength & conditioning. Are you doing sessions designed to complement your bike work $€” building power where you're weak without fatiguing the muscles you need fresh for tomorrow's intervals? Or are you either skipping the gym entirely or following a generic programme that leaves your legs wrecked?

4. Recovery. Do you have prescribed protocols $€” sleep targets, recovery nutrition timed to the session, deload weeks planned in advance? Or is your recovery strategy "rest day when I feel destroyed"?

5. Accountability. Does anyone actually review your training? Does anyone notice when you sandbagged an interval or skipped a session? Is there a coach on the other end of your power files $€” or are you uploading to Strava and hoping the TSS adds up?

Add up your score. Be honest.

If you're under 10, you've found the reason your FTP hasn't moved. It's not fitness. It's the four pillars around your training that you're neglecting.

The free tools in the Clubhouse will get you moving on these. The training plans give you structure. The nutrition masterclass with Dr Dunne and Dr Impey gives you the knowledge. The community gives you riders to talk to who are working through the same problems.

But knowing what your five pillars should be and having someone build all five around your actual life $€” your schedule, your race calendar, your body, your week $€” are very different things. One is education. The other is coaching.

Anthony
```

---

### Email 5 of 7
- **Delay:** 1 day after Email 4
- **Subject:** `Here's what all 5 pillars look like when someone builds them for you`
- **Preview text:** (none)

**Body:**

```
Hey,

Last email I asked you to audit yourself across the 5 pillars. If you're like most riders I talk to, you scored well on training and poorly on everything else.

Here's what it looks like when all 5 are actually built for you inside the Not Done Yet Collective:

Training: A personalised daily plan $€” not a template. A coach reviews your power files, gets on one-on-one calls with you, and adjusts week by week based on what's actually happening in your training, not what a spreadsheet predicted three months ago.

Nutrition: Exact amounts that change by the meal based on what you're training that day. Your breakfast before a threshold session is different from your breakfast on a rest day. This isn't "eat more carbs" $€” it's precision fuelling prescribed to you.

Strength & Conditioning: A programme designed to complement your bike work. Built so your gym sessions build cycling power and prevent injury, not wreck your legs for tomorrow's intervals.

Recovery: Prescribed protocols $€” sleep, nutrition timing, deload weeks $€” all planned around your training block, not guessed at when you're already cooked.

Accountability: A real community of riders who show up on live calls, who notice when you're not there, and who genuinely care whether you hit your goals. A coach who sees the truth in your numbers. Nowhere to hide.

The "Not Done Yet" Coaching Community is $195/month with a 7-day free trial. That's real coaching, not a subscription to more content.

It's the same investment as one race entry fee per month, except this one actually makes you faster at every race after it.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

If it's not for you, no hard feelings. The Clubhouse is yours either way.

Anthony
```

---

### Email 6 of 7
- **Delay:** 1 day after Email 5
- **Subject:** `"I've spent money on coaching before and it didn't work"`
- **Preview text:** (none)

**Body:**

```
Hey,

If you've spent money on training plans, apps, or online coaching that didn't deliver, I get it. You're right to be skeptical. Especially at $195/month.

So let me be direct about what that money actually buys, because most of what's sold as "coaching" in cycling isn't coaching at all.

It's a template with your name on it. A plan that doesn't know you skipped Tuesday because your kid was sick. A nutrition guide that says "eat more carbs" without telling you how many, when, or how that changes based on tomorrow's session.

Inside the "Not Done Yet", you get a coach who reviews your actual files and gets on calls with you. Not a chatbot. Not a PDF. A human who knows your power numbers, your schedule, your race calendar, and what happened last week.

A monthly one-on-one progress call where your plan gets rebuilt based on reality.

A weekly live Q&A where nothing is off limits.

Brian Morrissey is a 52-year-old shift worker. In 10 weeks, his FTP jumped 15%, training less than the year before, at lower intensities. That didn't come from an AI app or a ChatGPT plan.

It came from a coach reviewing his files, a monthly progress call adjusting the plan, and a weekly Q&A where he could ask exactly why Tuesday's session felt wrong.

Damien Maloney had plateaued for years. Regular Zone 2 and Zone 3 rides, no structure. Roadman built a plan around his actual life. FTP from the low 200s to 295. He said it was one of the smartest things he'd done, not because of the plan alone, but because he finally had a coach who could see the truth in his numbers and a team behind him.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Anthony
```

---

### Email 7 of 7
- **Delay:** 1 day after Email 6
- **Subject:** `You already know what's missing`
- **Preview text:** (none)
- **Personalization:** This email uses `{{subscriber.first_name}}` in the greeting.

**Body:**

```
Hey {{subscriber.first_name}},

I'll keep this short.

A few days ago I asked you to score yourself on the 5 pillars. You know where you landed. You know which ones are missing.

You can keep running on one or two pillars and hope the others sort themselves out.

Or you can try 7 days inside a system where a coach builds all five around your life $€” reviews your files, gets on a monthly one-on-one call to keep your plan honest, runs a weekly Q&A, and puts you in a community that won't let you disappear.

The trial is free. The first week will tell you everything you need to know.

There's no risk.

ðŸ‘‰ Start your 7-day free trial: https://www.skool.com/roadmancycling/about

Either way, I'm glad you're here. Keep moving forward.

Anthony
```

**Note:** If the `first_name` custom field is empty for some subscribers, Beehiiv will render it as blank. Consider setting a fallback in Beehiiv's merge tag settings (e.g. `{{subscriber.first_name | default: ""}}`) so the greeting reads "Hey," gracefully.

---

### Post-Email Actions
- Remove tag: `plateau`
- Add tag: `plateau-finished`
- Remove tag: `in-sequence`

---

## Quick Reference: All Sequences at a Glance

| Sequence | Trigger Tag | Finished Tag | Emails | Total Duration |
|----------|------------|-------------|--------|---------------|
| Listener | `listener` | `listener-finished` | 7 | 7 days |
| Event Prep | `event-prep` | `event-prep-finished` | 7 | 7 days |
| Comeback | `comeback` | `comeback-finished` | 7 | 7 days |
| Plateau | `plateau` | `plateau-finished` | 7 | 7 days |

All sequences share the same structure:
- Email 1: Welcome + free training plan CTA
- Email 2: Free content hook (Nutrition Masterclass)
- Email 3: Social proof / case study
- Email 4: 5-pillar self-assessment
- Email 5: What NDY coaching looks like across all 5 pillars
- Email 6: Objection handling + more social proof
- Email 7: Final CTA with urgency

---

## Known Issues from ClickFunnels Migration

1. **Comeback Email 5 duplicate:** In the original ClickFunnels workflow, Email 5 had identical content to Email 4. The `cf-email-sequences.md` source doc has the correct distinct content for Email 5 -- that is what is included in this guide above. Verify before publishing.

2. **Placeholder links:** Several emails contain `[CLASSROOM LINK]`, `[LINK]`, or `HERE` as placeholders. Replace these with actual Skool Clubhouse URLs before activating:
   - Training plan link: the Skool classroom link for the 16-week plans
   - Nutrition Masterclass link: the Skool classroom link for the Dunne/Impey masterclass

3. **From address:** All sequences send from `Anthony Walsh <admin@roadmancycling.com>`. Confirm this sender is verified in Beehiiv.

4. **Merge tags:** Only Plateau Email 7 uses personalization (`[First Name]` in CF, `{{subscriber.first_name}}` in Beehiiv). All other emails use a generic "Hey," greeting -- no merge tag needed.
