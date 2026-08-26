import type { AnswerPage } from "@/lib/answers";

/**
 * Third-wave answer pages — filling genuine gaps across S&C, recovery,
 * nutrition and racing/culture. Same citation-optimised format as
 * answers-data/metrics.ts and training-physiology.ts. Expert framing reflects
 * the on-the-record positions and roles of real cited guests (Derek Teel,
 * Joe Friel, George Hincapie, Steve Cummings) — no fabricated quotes — or the
 * established research consensus where no single guest owns the topic.
 */
export const wave3Answers: AnswerPage[] = [
  // ============================================================
  // HOW OFTEN SHOULD CYCLISTS STRENGTH TRAIN
  // ============================================================
  {
    slug: "how-often-should-cyclists-strength-train",
    cluster: "strength",
    question: "How Often Should Cyclists Strength Train?",
    seoTitle: "How Often Should Cyclists Strength Train? Sessions Per Week",
    seoDescription:
      "Most cyclists get the benefits of strength training from two sessions a week. Why two beats one or three, how it changes in-season, and how little time it really takes.",
    pillar: "strength",
    directAnswer:
      "Most cyclists should strength train twice a week. Two sessions let the body catch the recovery-and-adaptation curve — recovering from one session and adapting before the next — which one session a week struggles to do and three can overload alongside riding. The good news is it doesn't take much: even two 30-minute sessions a week, taken from your riding time, deliver most of the benefit. In-season you can drop to one maintenance session a week to hold the gains.",
    keyTakeaways: [
      "Twice a week is the sweet spot for most cyclists — enough to drive adaptation, not so much it interferes with riding.",
      "Two sessions let you catch the recovery curve at the top, building on the previous session rather than starting cold each time.",
      "It doesn't take long: two 30-minute sessions a week deliver most of the benefit.",
      "In-season, drop to one maintenance session a week to hold strength without adding fatigue.",
      "Even swapping a little riding time for strength usually leaves you feeling better, not worse.",
    ],
    whoFor: [
      {
        label: "The time-pressed amateur",
        detail:
          "You're not sure you can fit strength work in around riding, work and life, and you want the minimum effective dose.",
      },
      {
        label: "The masters rider protecting muscle",
        detail:
          "You know strength matters more with age and want to know how often to train without compromising your rides.",
      },
    ],
    roadmanView: [
      "Strength training is the work amateurs most often skip and most often regret skipping, usually because they imagine it means hours in the gym. It doesn't. The frequency that matters is twice a week, and the time it takes is far less than people fear.",
      "The reason two beats one is about the adaptation curve. After a strength session your body recovers and then adapts, ending up slightly stronger than before. A second session timed onto that small peak keeps the climb going. Train only once a week and the adaptation from each session has often faded before the next, so you spend months treading water. Train three or four times and, stacked on top of your riding, you risk never recovering from anything. Two is the rhythm that keeps you climbing.",
      "We build the Method's strength work around this because the cost-benefit is so good. Two short, focused sessions a week — the big patterns, loaded sensibly, progressed over time — protect the muscle, joints and power that riding alone slowly erodes, especially as you get older. You don't need a bodybuilder's schedule. You need consistency at twice a week, which almost anyone can find.",
    ],
    expertEvidence: [
      {
        name: "Derek Teel",
        credential: "Founder of Dialed Health, strength coach for cyclists",
        insight:
          "Teel's case is that two sessions a week lets the body catch the recovery-and-adaptation curve at the top — recovered from the last session, a little fitter, ready for the next — and that even cutting an hour of riding to do two 30-minute strength sessions usually leaves a rider feeling significantly better, not worse.",
        episodeSlug: "ep-2183-strength-training-for-cycling-simplified-derek-teel",
        guestSlug: "derek-teel",
      },
    ],
    practicalApplication: [
      {
        title: "Schedule two short sessions",
        detail:
          "Put two 30-to-45-minute strength sessions in your week, ideally on or near harder ride days so easy days stay easy. Consistency at two beats heroic one-offs.",
      },
      {
        title: "Keep them focused",
        detail:
          "A handful of the big patterns — a squat, a hinge, a single-leg movement, a push — loaded sensibly and progressed over weeks. You don't need a long list of exercises.",
      },
      {
        title: "Drop to one in-season",
        detail:
          "When racing or peak training loads arrive, a single maintenance session a week holds most of your strength without adding fatigue you can't recover from.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Lifting once a week and wondering why nothing changes.",
        fix:
          "One session struggles to drive adaptation because the stimulus fades before the next. Two sessions keep the adaptation curve climbing.",
      },
      {
        mistake: "Treating strength as an all-or-nothing time sink.",
        fix:
          "Two 30-minute sessions deliver most of the benefit. The barrier is almost always the imagined time cost, not the real one.",
      },
    ],
    faq: [
      {
        question: "Is two strength sessions a week enough for cyclists?",
        answer:
          "For most cyclists, yes. Two sessions a week is the sweet spot — enough to drive and maintain adaptation while leaving room to recover for riding. It outperforms one session a week and avoids the interference that three or more can cause alongside training.",
      },
      {
        question: "How long should a cyclist's strength session be?",
        answer:
          "It can be short. Two focused 30-minute sessions a week deliver most of the benefit. Quality and consistency matter more than duration — a brief, well-chosen session done reliably beats a long one done occasionally.",
      },
      {
        question: "Should I lift less in-season?",
        answer:
          "Yes. During racing or peak training, drop to one maintenance session a week. That's enough to hold the strength you built in the off-season without adding fatigue that compromises your key rides.",
      },
      {
        question: "Will strength training twice a week make me tired for riding?",
        answer:
          "Done sensibly, no — and many riders feel better. Keep hard strength near hard ride days, keep easy days easy, and progress load gradually. Most cyclists who add two short sessions report feeling stronger and more durable, not more fatigued.",
      },
    ],
    relatedEpisodes: [
      "ep-2183-strength-training-for-cycling-simplified-derek-teel",
      "ep-2091-the-best-exercises-for-cyclists-strength-training",
    ],
    relatedTopics: [
      { label: "Does Strength Training Increase FTP?", href: "/answers/does-strength-training-increase-ftp" },
      { label: "Heavy or Light Weights for Cyclists?", href: "/answers/heavy-or-light-weights-cyclists" },
      { label: "What Off-Season Strength Should I Do?", href: "/answers/off-season-strength-training" },
      {
        label: "Strength Training for Cyclists: Complete Guide",
        href: "/blog/cycling-strength-training-guide",
      },
      {
        label: "The Best Gym Exercises for Cyclists",
        href: "/blog/cycling-gym-exercises-best",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "The twice-weekly frequency and the recovery-adaptation rationale reflect established strength-training science and the on-the-record coaching of Derek Teel; in-season maintenance dosing is standard S&C practice.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS SUPERCOMPENSATION
  // ============================================================
  {
    slug: "what-is-supercompensation",
    cluster: "recovery",
    question: "What Is Supercompensation in Cycling?",
    seoTitle: "What Is Supercompensation? The Training-Recovery Cycle Explained",
    seoDescription:
      "Supercompensation is why rest makes you faster. How the train-recover-adapt cycle works, why you get fitter during recovery not training, and how to time it.",
    pillar: "recovery",
    directAnswer:
      "Supercompensation is the process by which your body rebuilds itself slightly stronger than before after a training stress, provided it gets enough recovery. Training temporarily lowers your fitness by causing fatigue and damage; during recovery the body repairs and then overshoots its previous level, leaving you fitter than you started. Time your next hard session onto that overshoot and you climb. Train again too soon, before the rebound, and you dig a hole instead. It's the single idea behind why rest, not just work, makes you faster.",
    keyTakeaways: [
      "You don't get fitter during training — you get fitter during the recovery that follows it.",
      "Training drops your fitness short-term; recovery rebuilds it past where it started. That overshoot is supercompensation.",
      "Train your next hard session onto the overshoot and you progress; train too soon and you accumulate fatigue.",
      "It's why a rest day or recovery week often precedes your best form, not your worst.",
      "Ignoring recovery doesn't make you tougher — it just stops the adaptation from ever happening.",
    ],
    whoFor: [
      {
        label: "The rider who fears rest",
        detail:
          "You worry that easy days and rest weeks are lost fitness, and you need to understand why they're where the gains actually land.",
      },
      {
        label: "The plateaued amateur",
        detail:
          "You train hard and consistently but you've stopped improving, and you suspect you never let the adaptation complete.",
      },
    ],
    roadmanView: [
      "Supercompensation is the concept that quietly governs whether all your training turns into fitness or just fatigue. The mistake nearly every motivated amateur makes is believing that the hard session is where they get fitter. It isn't. The session is the stimulus — it actually leaves you temporarily weaker. The fitness is built afterwards, in recovery, when the body repairs the damage and then builds a little extra as insurance against the next dose. Get fitter while resting: that's the whole counterintuitive truth of it.",
      "Picture a curve that dips after a hard ride, climbs back through your starting line, peaks a little above it, and then — if nothing else happens — drifts back down. That peak above the line is supercompensation, and the art of training is landing your next hard session on it. Too soon and you re-stress a body that hasn't rebounded, stacking fatigue. Too late and the peak has faded and you've lost the gain. Get the timing right, repeatedly, and the curve ratchets upward over weeks.",
      "This is why we're so insistent on recovery in the Method, and why rest weeks aren't a concession — they're where the work pays off. The riders who never back off never give the curve time to overshoot, so they live permanently in the dip, tired and stagnant. The riders who respect recovery let every hard block convert into actual fitness. Training and recovery aren't opposites. They're two halves of the same machine.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "Friel's whole framework rests on the train-recover-adapt cycle: the load is only useful if it's followed by enough recovery for the body to rebound past its previous level. Periodisation — hard blocks followed by recovery, ramping load sensibly — is supercompensation organised across a season rather than a single session.",
        episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Treat recovery as part of the session",
        detail:
          "A hard session isn't finished when you stop pedalling — it's finished when you've recovered from it. Plan the easy days and sleep that let the adaptation happen, not just the work.",
      },
      {
        title: "Follow hard blocks with real recovery",
        detail:
          "Stack a few progressively harder weeks, then take a genuine recovery week. The rebound after that week is often where your best form appears.",
      },
      {
        title: "Read the signals",
        detail:
          "Flat legs, stalled power and rising fatigue mean you're training back into the dip before rebounding. Back off and let the overshoot happen rather than pushing through.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Believing the hard session is where you get fitter.",
        fix:
          "The session is the stimulus; it leaves you temporarily weaker. The fitness is built during the recovery that follows, when the body overshoots its previous level.",
      },
      {
        mistake: "Skipping recovery weeks to 'keep the fitness'.",
        fix:
          "Without recovery the overshoot never happens, so you stay stuck in the fatigue dip. The recovery week is what converts the work into form.",
      },
    ],
    faq: [
      {
        question: "Do you get fitter during training or rest?",
        answer:
          "During rest. Training provides the stimulus and temporarily lowers your fitness through fatigue and damage. The actual gain — supercompensation — happens during recovery, when the body repairs and rebuilds slightly beyond its previous level.",
      },
      {
        question: "How long does supercompensation take?",
        answer:
          "It varies with the size of the stimulus, your fitness and your age, but the rebound from a single hard session typically takes one to several days, and from a hard training block, a recovery week or more. The bigger the stress, the longer the recovery needed to overshoot.",
      },
      {
        question: "What happens if I train again too soon?",
        answer:
          "You re-stress a body that hasn't rebounded, so instead of landing on the overshoot you dig deeper into fatigue. Done occasionally and deliberately this is how overload blocks work, but done constantly it leads to stagnation or overtraining.",
      },
      {
        question: "Is supercompensation the same as periodisation?",
        answer:
          "They're closely linked. Supercompensation is the underlying physiological cycle; periodisation is how you organise training and recovery across weeks and months to repeatedly land on the overshoot and ratchet fitness upward over a season.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    relatedTopics: [
      { label: "What Should a Recovery Week Look Like?", href: "/answers/what-is-a-recovery-week" },
      { label: "How Long Does It Take to Recover After a Hard Ride?", href: "/answers/how-long-to-recover-after-hard-ride" },
      { label: "What Is Periodisation in Cycling?", href: "/answers/what-is-periodisation-cycling" },
      {
        label: "The Cycling Rest Week Guide",
        href: "/blog/cycling-rest-week-guide",
      },
      {
        label: "Periodisation: Friel, Lorang and Johnson",
        href: "/blog/cycling-periodisation-friel-lorang-johnson",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Supercompensation is a foundational, well-established principle of exercise physiology; the framing reflects standard training science and Joe Friel's on-the-record periodisation work.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // DO BEETROOT / NITRATES WORK
  // ============================================================
  {
    slug: "do-beetroot-nitrates-work-cycling",
    cluster: "nutrition",
    question: "Does Beetroot Juice Improve Cycling Performance?",
    seoTitle: "Does Beetroot Juice Work for Cycling? Nitrates and Performance",
    seoDescription:
      "Beetroot juice supplies dietary nitrate, which can modestly improve cycling efficiency and endurance. What the evidence says, who benefits most, and how to use it.",
    pillar: "nutrition",
    directAnswer:
      "Beetroot juice can produce a small but real improvement in cycling performance because it's rich in dietary nitrate, which the body converts to nitric oxide — a molecule that widens blood vessels and improves how efficiently your muscles use oxygen. The effect is modest, most reliable in recreational and well-trained-but-not-elite riders, and strongest in endurance and time-trial efforts. It's not a transformation, but for the cost it's one of the better-supported legal supplements. Take a concentrated nitrate dose around two to three hours before a hard effort.",
    keyTakeaways: [
      "Beetroot works because it's high in dietary nitrate, which the body turns into nitric oxide and which improves oxygen efficiency.",
      "The effect is real but modest — think a small percentage, not a transformation.",
      "Benefits are most reliable for recreational and sub-elite riders; highly trained athletes often respond less.",
      "It helps most in endurance and time-trial efforts where efficiency matters.",
      "Timing matters: take a concentrated dose around two to three hours before the effort.",
    ],
    whoFor: [
      {
        label: "The time-trial or sportive rider",
        detail:
          "You're chasing every legal, evidence-backed edge for a sustained effort and want to know whether beetroot is worth it.",
      },
      {
        label: "The supplement-sceptical amateur",
        detail:
          "You want to know which supplements actually have science behind them before spending money or stomach space.",
      },
    ],
    roadmanView: [
      "Beetroot juice is one of the few supplements that survives a sceptic's scrutiny, which is exactly why it's worth understanding properly rather than dismissing or overselling. The mechanism is genuine: beetroot is loaded with dietary nitrate, your body converts that to nitric oxide, and nitric oxide makes your blood vessels dilate and your muscles use oxygen a little more economically. That can translate into holding a given power for marginally less cost, or pushing slightly higher before you blow.",
      "The honest framing is that the effect is small and conditional. It shows up most clearly in recreational and well-trained-but-not-elite riders; the closer you get to the very top, the more your body already produces nitric oxide efficiently and the less an external dose adds. It also favours sustained, efficiency-limited efforts — a long climb or a time trial — over a flat-out sprint. So it's a real tool for the right rider on the right day, not a miracle for everyone.",
      "Our line on supplements is simple: get the training, sleep and fuelling right first, because they dwarf anything in a bottle. But once the basics are handled, beetroot is one of a very short list — alongside caffeine and creatine — with enough evidence to be worth a place. Treat it as a small, situational edge for your key efforts, not a daily essential.",
    ],
    expertEvidence: [
      {
        name: "Sports-nutrition research consensus",
        credential: "Dietary-nitrate literature (Jeukendrup, Burke and colleagues)",
        insight:
          "The performance benefit of dietary nitrate from beetroot is one of the better-supported findings in sports nutrition: a modest improvement in oxygen efficiency and endurance, most pronounced in non-elite athletes and in sustained efforts. The Roadman approach follows the established consensus rather than the marketing — real, small, and situational.",
      },
    ],
    practicalApplication: [
      {
        title: "Use a concentrated shot",
        detail:
          "A small concentrated beetroot 'shot' delivers a reliable nitrate dose without litres of juice. Check the label gives a nitrate amount, since juices vary widely.",
      },
      {
        title: "Time it two to three hours out",
        detail:
          "Nitrate levels in the blood peak a couple of hours after intake, so take your dose roughly two to three hours before the key effort rather than at the start line.",
      },
      {
        title: "Save it for efforts that matter",
        detail:
          "Reserve it for time trials, hard sportives and long climbs where efficiency is the limiter — not every easy ride. And test it in training first to be sure your gut is happy with it.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Expecting a dramatic boost.",
        fix:
          "The effect is small. It's a marginal, legal edge for the right effort, not a transformation — and it won't rescue under-training or poor fuelling.",
      },
      {
        mistake: "Taking it on the start line.",
        fix:
          "Blood nitrate peaks a couple of hours after intake. Take your dose two to three hours before the effort so it's working when you need it.",
      },
    ],
    faq: [
      {
        question: "How does beetroot juice improve performance?",
        answer:
          "Beetroot is rich in dietary nitrate, which the body converts to nitric oxide. Nitric oxide widens blood vessels and improves the efficiency with which muscles use oxygen, so you can hold a given effort for slightly less metabolic cost. The benefit is modest but mechanistically real.",
      },
      {
        question: "How much beetroot juice should I take and when?",
        answer:
          "A concentrated beetroot shot providing a standardised nitrate dose, taken around two to three hours before a hard effort, is the typical protocol. Blood nitrate peaks a couple of hours after intake, so timing it ahead of the effort matters more than taking it immediately before.",
      },
      {
        question: "Does beetroot work for everyone?",
        answer:
          "Not equally. The benefit is most reliable in recreational and well-trained-but-not-elite riders; highly trained athletes tend to respond less because their bodies already produce nitric oxide efficiently. It also helps endurance and time-trial efforts more than short sprints.",
      },
      {
        question: "Is beetroot juice a banned substance?",
        answer:
          "No. Dietary nitrate from beetroot is a normal food component and is not prohibited. It sits alongside caffeine and creatine as one of the few supplements with genuine evidence behind it, though the training basics matter far more.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      { label: "Should Cyclists Take Creatine?", href: "/answers/should-cyclists-take-creatine" },
      { label: "Does Caffeine Improve Cycling Performance?", href: "/answers/does-caffeine-improve-cycling" },
      {
        label: "What the World Tour Nutritionists Actually Do",
        href: "/blog/cycling-nutrition-world-tour-nutritionists",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "The ergogenic effect of dietary nitrate is well-studied and broadly accepted, but the magnitude is modest and varies with training status and effort type — hence a moderate rather than strong rating.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS A DOMESTIQUE
  // ============================================================
  {
    slug: "what-is-a-domestique",
    cluster: "racing",
    question: "What Is a Domestique in Cycling?",
    seoTitle: "Domestique in Cycling: Meaning, Jobs & Tactics",
    seoDescription:
      "What a cycling domestique does, from bottles and wind protection to chase work, climb pacing and lead-outs—plus road captain and super-domestique roles.",
    pillar: "coaching",
    directAnswer:
      "A domestique is a road-racing cyclist assigned to spend energy in support of a protected rider or team plan. Depending on the day, they may shelter a leader from wind, improve positioning, collect bottles, chase a breakaway, set the pace on a climb or work in a sprint lead-out. It is a tactical role—not a lesser class of rider—and the assignment can change from one race or stage to the next.",
    keyTakeaways: [
      "Domestique is an assigned support role, not a label for a weaker rider.",
      "Jobs change by terrain and plan: positioning, bottles, chasing, pacing, wind protection or lead-out work.",
      "A road captain adds tactical leadership; a super-domestique can support a leader deep into decisive terrain.",
      "The same rider may work for a leader one day and race for their own result on another.",
    ],
    whoFor: [
      {
        label: "The new race-watcher",
        detail:
          "You're getting into pro cycling and want to understand why so much of the bunch seems to be working for someone else.",
      },
      {
        label: "The club rider learning tactics",
        detail:
          "You want to understand team roles so you can ride more effectively for — and with — others.",
      },
    ],
    roadmanView: [
      "Cycling awards an individual result, but road racing is organised around collective work. The Tour de France itself recognises best teammates, and its 2023 review described versatile riders supporting a leader across different terrain. That is the cleanest way to understand a domestique: a rider spending today's energy so the team's chosen plan can survive until the decisive moment.",
      "The job is not one fixed checklist. On flat roads it can mean keeping a leader out of crosswinds or controlling the gap to a break. Before a climb it can mean positioning; on the climb it can mean a controlled tempo. For a sprinter it may mean chasing or taking a turn in the lead-out. Bottle collection is real, but current UCI rules control where and how riders may receive food and drink, so it should not be presented as a free-for-all at the team car.",
      "The role also changes. A road captain may do support work while making tactical decisions and relaying the plan inside the peloton. A super-domestique is strong enough to remain with a leader late in a mountain stage or other selective finale. Neither term means the rider never gets personal opportunities; team leadership can change by race, stage, form and situation.",
    ],
    expertEvidence: [
      {
        name: "George Hincapie",
        credential: "17-time Tour de France starter and former road captain",
        insight:
          "In his Roadman interview, Hincapie describes the hidden work involved in controlling difficult race days and the decisions made inside the peloton. We use that as first-person evidence of the road-captain and support role, while his separate Roadman profile discloses the admitted doping and sanction attached to his US Postal years.",
        episodeSlug: "ep-2231-the-untold-story-of-my-time-with-lance-hincapie",
        guestSlug: "george-hincapie",
      },
    ],
    practicalApplication: [
      {
        title: "Identify the protected rider",
        detail:
          "Before the decisive terrain, note which rider is kept sheltered and near the front while teammates spend energy around them. That rider is usually the team's priority for the day.",
      },
      {
        title: "Match the job to the terrain",
        detail:
          "Watch who controls a break on flat roads, moves the leader forward before a climb, sets the climb tempo or forms the sprint train. Domestique work changes as the course changes.",
      },
      {
        title: "Read the handover",
        detail:
          "Notice when one support rider finishes a turn and another takes over. The order reveals the team plan: bigger riders earlier, climbing support later, or progressively faster riders in a lead-out.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating domestique as a rider's permanent rank.",
        fix:
          "It is a role assigned for a race or stage. A rider can support one day, lead on another, or receive freedom if the protected rider's plan changes.",
      },
      {
        mistake: "Assuming domestiques are weaker riders.",
        fix:
          "Support work can require sustained power, positioning skill and tactical judgement. The assignment describes whose result the team is protecting, not who has the least ability.",
      },
      {
        mistake: "Calling every teammate a road captain.",
        fix:
          "A road captain adds in-race communication and tactical leadership. A domestique can execute support work without holding that decision-making responsibility.",
      },
    ],
    faq: [
      {
        question: "What does a domestique do?",
        answer:
          "A domestique supports a protected rider or team tactic. Jobs can include sheltering a leader from wind, improving position before a key sector, carrying supplies under race rules, controlling a breakaway, setting tempo on a climb and contributing to a sprint lead-out.",
      },
      {
        question: "Why is it called a domestique?",
        answer:
          "Domestique is the French word historically translated as 'servant' or household servant. In cycling it became the established term for a rider working in service of a leader or team plan; modern race coverage generally uses it as a respected tactical role.",
      },
      {
        question: "Do domestiques ever win races?",
        answer:
          "Yes. Team roles change by race and stage. A support rider can be given freedom in a breakaway, become the protected option on suitable terrain or inherit leadership if the original plan changes. The UCI has profiled riders who combined domestique work with leadership responsibilities.",
      },
      {
        question: "How fit do you have to be to be a domestique?",
        answer:
          "At professional level, a domestique is an elite rider. The role can demand repeated movement through the bunch, sustained pace-setting and enough reserve to help after earlier work. Fitness requirements vary because flat-road, climbing and lead-out domestiques perform different jobs.",
      },
      {
        question: "What is the difference between a domestique and a road captain?",
        answer:
          "A domestique performs support work; a road captain also carries tactical leadership inside the race, communicates decisions and helps organise teammates. One rider can be both, but not every domestique is the road captain. UCI coverage has explicitly described a rider holding both domestique and team-captain responsibilities.",
      },
      {
        question: "What is a super-domestique?",
        answer:
          "A super-domestique is an informal term for a high-level support rider capable of staying with a protected leader deep into decisive terrain. They often have the ability to lead in other races, but on that day their job is to preserve or improve the leader's position.",
      },
    ],
    relatedEpisodes: [
      "ep-2231-the-untold-story-of-my-time-with-lance-hincapie",
      "steve-cummings-the-peletons-last-maverick",
    ],
    relatedTopics: [
      { label: "What Is a Breakaway in Cycling?", href: "/answers/what-is-a-breakaway" },
      {
        label: "Cycling Race Tactics Guide",
        href: "/blog/cycling-race-tactics-guide",
      },
      {
        label: "Cycling Beginners Hub",
        href: "/topics/cycling-beginners",
      },
      {
        label: "Steve Cummings: Lessons From the Peloton's Last Maverick",
        href: "/blog/steve-cummings-maverick-self-coached-lessons",
      },
    ],
    sources: [
      {
        name: "Four jerseys for four men — best teammates",
        url: "https://www.letour.fr/en/news/2023/four-jerseys-for-four-men/1316750",
        publisher: "Tour de France",
        note: "Official race account of domestique work across terrain and the Tour's best-teammate recognition.",
      },
      {
        name: "Tour de France guide: domestiques",
        url: "https://www.letour.fr/en/video/2948/tour-de-france-guide-domestiques",
        publisher: "Tour de France",
        note: "Official Tour explainer for the role.",
      },
      {
        name: "UCI Cycling Regulations, Part 2: Road Races",
        url: "https://assets.ctfassets.net/761l7gh5x5an/6FEzFHeA2oKMBGb5sdIvQ7/6495a6535b573ed5eb8d7fd213b9e808/2-ROA-20260206-E.pdf",
        publisher: "Union Cycliste Internationale",
        note: "Current rules governing feeding, team-car assistance and rider conduct.",
      },
      {
        name: "The UCI Women's WorldTour Chronicle",
        url: "https://www.uci.org/article/the-uci-women-s-worldtour-chronicle-183250/2qbAFgcS6ZsX8pKlg0hPsk",
        publisher: "Union Cycliste Internationale",
        note: "Official example distinguishing domestique work from road-captain responsibility.",
      },
      {
        name: "George Hincapie on seven Tours and road-captain work",
        url: "https://roadmancycling.com/podcast/ep-2231-the-untold-story-of-my-time-with-lance-hincapie",
        publisher: "Roadman Cycling Podcast",
        note: "First-person account; the accompanying profile states the historical and anti-doping boundaries.",
      },
    ],
    definedTerm: {
      name: "Domestique",
      alternateName: "Cycling domestique",
      description:
        "A road-cycling team rider assigned to spend energy in support of a protected rider or team plan through positioning, pacing, chasing, supplies or race control.",
    },
    evidenceLevel: "strong",
    evidenceNote:
      "Role boundaries are checked against official Tour de France coverage, current UCI road regulations, an official UCI team profile and a first-person Roadman road-captain interview. Specific assignments still vary by team, race and stage.",
    publishDate: "2026-06-20",
    updatedDate: "2026-08-26",
    reviewedBy: "Anthony Walsh",
  },

  // ============================================================
  // WHAT IS A BREAKAWAY
  // ============================================================
  {
    slug: "what-is-a-breakaway",
    cluster: "racing",
    question: "What Is a Breakaway in Cycling?",
    seoTitle: "What Is a Breakaway in Cycling? Why Riders Attack Off the Front",
    seoDescription:
      "A breakaway is a small group that rides clear of the main bunch to try to win or gain time. Why riders attack, why most fail, and what makes a breakaway succeed.",
    pillar: "coaching",
    directAnswer:
      "A breakaway is a rider or small group that escapes off the front of the main bunch, the peloton, and tries to stay away to the finish. Riders go in the break to chase a stage win, to gain time, to grab attention for sponsors, or to set up a teammate. Most breakaways are eventually caught, because the peloton saves energy by drafting and can chase more efficiently than a few riders can stay away. But with the right riders, the right gap and the right tactics, a break can hold to the line — which is what makes it one of racing's great gambles.",
    keyTakeaways: [
      "A breakaway is a rider or small group that rides clear of the peloton, trying to stay away to the finish.",
      "Riders break away to win, to gain time, for sponsor exposure, or to support a team plan.",
      "Most breaks are caught — the bunch drafts and chases more efficiently than a few riders can resist.",
      "Success depends on the gap, the riders' strength and cooperation, the terrain, and how motivated the bunch is to chase.",
      "A well-timed breakaway is intelligence and nerve as much as raw power — knowing when to go is the whole art.",
    ],
    whoFor: [
      {
        label: "The new race-watcher",
        detail:
          "You see riders ride off the front and want to understand why, and whether they ever actually win.",
      },
      {
        label: "The amateur racer",
        detail:
          "You want to understand breakaway tactics so you can read a race and time your own moves.",
      },
    ],
    roadmanView: [
      "The breakaway is the most romantic and most misunderstood move in bike racing. To the newcomer it looks like simple bravery — a rider rides away from everyone else and hangs on for dear life. There's truth in that, but the reality is far more tactical, and understanding it changes how you watch and how you race.",
      "Riders attack off the front for several reasons, and only one of them is winning. A break might be chasing a stage win on a day that suits escapees; it might be gaining time before the bunch reacts; it might be a sponsor's rider getting hours of television coverage; it might be a tactical play to force rival teams to spend energy chasing. And the reason most breaks get caught is physics: the peloton drafts, sharing the wind among scores of riders, so it spends far less energy per rider than the handful out front. When the bunch decides to chase, it usually reels the break in. The break's whole challenge is to be gone before the bunch is willing to commit, and to have the legs and cooperation to stay away once it does.",
      "What makes a breakaway succeed is rarely the strongest engine — it's judgement. Knowing the precise moment to go, when the bunch is hesitant and the terrain is in your favour; reading which companions will work and which will sit on; managing your effort so you've something left when the catch looms. That's racecraft, the same intelligence we keep returning to in our [race tactics guide](/blog/cycling-race-tactics-guide). The best breakaway riders win on cunning and timing far more than on watts alone.",
    ],
    expertEvidence: [
      {
        name: "Steve Cummings",
        credential: "Olympic medallist and two-time Tour de France stage winner, renowned breakaway tactician",
        insight:
          "Cummings built a career on the intelligent breakaway — repeatedly winning from escapes not by being the strongest rider present but by reading the race better than anyone, timing his effort, and committing at the exact right moment. His success is the clearest case that a breakaway is won with the head as much as the legs.",
        episodeSlug: "steve-cummings-the-peletons-last-maverick",
        guestSlug: "steve-cummings",
      },
    ],
    practicalApplication: [
      {
        title: "Watch the gap and the chase",
        detail:
          "Follow the time gap between break and bunch through a race. Whether it grows or shrinks tells you how committed the peloton is and whether the break has a real chance.",
      },
      {
        title: "Note who works and who sits",
        detail:
          "In a break, watch which riders take turns on the front and which shelter at the back. Cooperation often decides whether a break survives or collapses.",
      },
      {
        title: "Time it, don't force it",
        detail:
          "If you race, the lesson is that the move matters more than the effort. Going at the right moment, with the right company, beats simply being strong enough to attack.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Thinking breakaways are pure bravery.",
        fix:
          "They're mostly tactics. Timing, terrain, cooperation and reading the bunch's willingness to chase decide a break far more than raw courage or power.",
      },
      {
        mistake: "Assuming the strongest rider wins the break.",
        fix:
          "Often the smartest does. Judging when to go and how to manage the effort beats being the biggest engine — as riders like Steve Cummings proved repeatedly.",
      },
    ],
    faq: [
      {
        question: "Why do cyclists go in a breakaway if most get caught?",
        answer:
          "For several reasons beyond winning: gaining time, securing television exposure for sponsors, forcing rivals to chase, or supporting a team plan. And sometimes the break does stay away — the chance of a rare, high-value win justifies the frequent failures.",
      },
      {
        question: "Why does the peloton usually catch the breakaway?",
        answer:
          "Because the bunch drafts. With scores of riders sharing the wind, the peloton spends far less energy per rider than a small break, so once it commits to chasing it can usually close the gap. The break's job is to be gone before the bunch decides to chase.",
      },
      {
        question: "What makes a breakaway succeed?",
        answer:
          "A combination of a big enough early gap, strong and cooperative riders, terrain that suits escapees, and a peloton that's unwilling or unable to organise a chase. Timing the attack well is often the single biggest factor.",
      },
      {
        question: "Is a breakaway about strength or tactics?",
        answer:
          "Both, but tactics often decide it. Knowing when to attack, who to go with, and how to ration your effort matters as much as raw power. Riders like Steve Cummings won repeatedly from breaks through intelligence and timing.",
      },
    ],
    relatedEpisodes: [
      "steve-cummings-the-peletons-last-maverick",
      "ep-2231-the-untold-story-of-my-time-with-lance-hincapie",
    ],
    relatedTopics: [
      { label: "What Is a Domestique in Cycling?", href: "/answers/what-is-a-domestique" },
      {
        label: "Cycling Race Tactics Guide",
        href: "/blog/cycling-race-tactics-guide",
      },
      {
        label: "Steve Cummings: Lessons From the Peloton's Last Maverick",
        href: "/blog/steve-cummings-maverick-self-coached-lessons",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "The mechanics and tactics of breakaways are well-established features of road racing; Steve Cummings is a widely recognised example of the intelligent breakaway rider.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },
];
