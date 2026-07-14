import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Careers at Roadman Cycling — We're Hiring",
  description:
    "Roadman Cycling is hiring: Cycling Coach, YouTube Growth Specialist, Paid Traffic Specialist, and Podcast Co-Host. Remote and Dublin-based roles available.",
  alternates: {
    canonical: "https://roadmancycling.com/careers",
  },
  openGraph: {
    title: "Careers at Roadman Cycling — We're Hiring",
    description:
      "Four open roles at Roadman Cycling. Coach, YouTube, Paid Traffic, and Podcast Co-Host. Build something real in cycling.",
    type: "website",
    url: "https://roadmancycling.com/careers",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

/* ── Role definitions ────────────────────────────────────────────── */

interface Role {
  id: string;
  title: string;
  tagline: string;
  location: string;
  type: string;
  hook: string;
  description: string[];
  responsibilities: { title: string; body: string }[];
  mustHaves: string[];
  niceToHaves: string[];
  applySubject: string;
  applyInstructions: { title: string; body: string }[];
  schema: Record<string, unknown>;
}

const ROLES: Role[] = [
  {
    id: "cycling-coach",
    title: "Cycling Coach",
    tagline: "COACH THE CYCLISTS WHO AREN'T DONE YET.",
    location: "Remote — Ireland, UK, US time zones",
    type: "Part-time → Full-time",
    hook: "Own a roster. Build the plans. Answer for the results.",
    description: [
      "You will own a roster of athletes from day one. Build their plans, manage their data, run their check-ins, and answer for their results. Anthony stays close — methodology, athlete intake, hard cases — but the coaching seat is yours.",
      "The athletes are serious amateurs and masters cyclists. Cat 3 chasing Cat 1. The sportive rider who refuses to accept their best days are behind them. The comeback athlete rebuilding after a decade away. Smart, demanding, and coachable when you bring real structure.",
      "Start at 10 hours per week. Scale to 40 as the roster grows. The ceiling is set by how fast you can take on athletes well.",
    ],
    responsibilities: [
      {
        title: "Build the training",
        body: "Design and write structured workouts in TrainingPeaks. Periodise blocks around each athlete's target events, life context, and recovery state. Read the PMC, adjust the plan when the data says to.",
      },
      {
        title: "Coach the athlete",
        body: "Weekly check-ins, plan reviews, and message-based support. Translate complex training science into instructions the athlete can act on. Hold them accountable through the bad weeks as well as the good ones.",
      },
      {
        title: "Own the data",
        body: "Manage athlete accounts in TrainingPeaks end-to-end. Track CTL/ATL/TSB, fitness trends, FTP changes, and race readiness. Spot problems before the athlete does.",
      },
      {
        title: "Work with Anthony",
        body: "Sit inside a team that talks to World Tour coaches and sports scientists every week. Bring that thinking into how we coach. Help shape the methodology as the roster grows.",
      },
    ],
    mustHaves: [
      "An academic background in sports science, exercise physiology, or a related field",
      "Deep, hands-on proficiency in TrainingPeaks — building structured workouts, reading the PMC, managing athlete accounts at scale",
      "A working understanding of periodisation and training stress management — you can defend your decisions with the science",
      "Evidence-based methodology — you can name the studies behind your approach, not just the influencers",
      "Coaching certification (British Cycling, UCI Level 1/2, TrainingPeaks-accredited coach, or equivalent)",
      "Experience with power-based training and structured race preparation",
      "Experience coaching amateur or masters cyclists remotely",
      "Strong written communication — you can explain a complex concept to a busy professional in three sentences",
      "Working knowledge of nutrition periodisation and body composition management for endurance athletes",
      "References from athletes you have coached",
    ],
    niceToHaves: [
      "A presence on social media or YouTube — comfortable on camera and able to contribute to content",
      "Familiarity with the Roadman Cycling Podcast and the methodology we have built across 1,400+ expert conversations",
      "Experience with masters-specific training (40+ athletes, hormonal context, recovery management)",
      "Background as a competitive cyclist yourself — Cat 3 or better, or equivalent gran fondo / time trial pedigree",
      "Comfort working inside a small, fast-moving team that ships content as well as coaching",
    ],
    applySubject: "Cycling Coach Application",
    applyInstructions: [
      { title: "Your CV", body: "Qualifications, certifications, coaching experience, athletes you have worked with." },
      { title: "A short cover letter", body: "Why you want this role specifically — not just any coaching role. What you would bring that we don't already have." },
      { title: "Two athlete references", body: "Cyclists you have coached, who we can contact. Ideally amateurs or masters athletes." },
    ],
    schema: {
      "@type": "JobPosting",
      title: "Cycling Coach",
      description:
        "Roadman Cycling is hiring a cycling coach to work with serious amateur and masters athletes. Remote, 10 hours per week scaling to 40 as the roster grows. TrainingPeaks-based, evidence-led methodology, working alongside Anthony Walsh and the Roadman team.",
      datePosted: "2026-05-12",
      employmentType: ["PART_TIME", "CONTRACTOR"],
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: [
        { "@type": "Country", name: "Ireland" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
      ],
      qualifications:
        "Academic background in sports science, exercise physiology, or related field. Deep proficiency in TrainingPeaks. Coaching certification (British Cycling, UCI, TrainingPeaks-accredited, or equivalent). Working knowledge of periodisation, training stress management, evidence-based methodology, and nutrition periodisation. Experience coaching amateur or masters cyclists remotely. References required.",
      skills:
        "TrainingPeaks, PMC analysis, power-based training, periodisation, training stress management, nutrition periodisation, body composition management, remote athlete management, written communication.",
    },
  },
  {
    id: "youtube-growth",
    title: "YouTube Growth Specialist",
    tagline: "MAKE THE BEST CYCLING PODCAST ON YOUTUBE ACT LIKE IT.",
    location: "Remote",
    type: "Contract / Part-time",
    hook: "61K subscribers. 100M+ podcast downloads. The content exists — it needs someone who knows how to make YouTube reward it.",
    description: [
      "The Roadman Cycling Podcast is one of the largest cycling podcasts in the world. Over 1,400 episodes. Guests from Stephen Seiler to Lachlan Morton to Dan Lorang. The content is strong and the audience is loyal — but the YouTube channel is not growing at the rate the content deserves.",
      "We need someone who lives and breathes YouTube. Not someone who knows a bit about social media and has YouTube on their CV. Someone who can look at our analytics, find the friction, and fix it — thumbnails, titles, retention curves, shorts strategy, publishing cadence, all of it.",
      "This is not a content creation role. The content already exists. This is about making it perform — getting it in front of more of the right people and keeping them watching.",
    ],
    responsibilities: [
      {
        title: "Audit and strategy",
        body: "Analyse current channel performance end-to-end. Identify where we're losing viewers and why. Build a growth strategy with measurable targets and clear timelines.",
      },
      {
        title: "Thumbnail and packaging",
        body: "Direct or produce thumbnails that stop the scroll. Write titles that earn the click without resorting to clickbait. Own the packaging of every upload — the first impression is your job.",
      },
      {
        title: "Retention and format",
        body: "Study audience retention data and recommend format changes. Advise on episode structure, hooks, pacing, and cuts. Work with the editing team to improve watch time.",
      },
      {
        title: "Shorts and discovery",
        body: "Build and execute a Shorts strategy that feeds the main channel. Identify clip-worthy moments across the back catalogue. Drive new subscriber acquisition through short-form.",
      },
    ],
    mustHaves: [
      "Proven track record growing YouTube channels past 100K subscribers — show us the numbers, not just the job titles",
      "Deep understanding of the YouTube algorithm: browse features, suggested video, search, Shorts shelf",
      "Fluency in YouTube Studio analytics — you can read a retention graph and know what to fix",
      "Experience with thumbnail design or art direction — you know what stops a scroll in a competitive feed",
      "Title and metadata optimisation — SEO, CTR testing, A/B experimentation",
      "Understanding of the sports, fitness, or endurance content space on YouTube",
      "Self-starter who can work autonomously with weekly check-ins, not daily hand-holding",
    ],
    niceToHaves: [
      "Experience specifically in cycling, triathlon, or endurance sports content",
      "Familiarity with podcast-to-YouTube workflows and long-form interview formatting",
      "Video editing skills or experience directing editors",
      "Experience growing a channel in the 50K–500K subscriber range — the strategies are different from zero-to-10K",
      "A portfolio of before-and-after channel transformations you can walk us through",
    ],
    applySubject: "YouTube Growth Specialist Application",
    applyInstructions: [
      { title: "Your CV or portfolio", body: "Focus on YouTube-specific work. Channels you have grown, strategies you have implemented, results you can prove." },
      { title: "A short audit", body: "Spend 20 minutes looking at The Roadman Podcast YouTube channel. Tell us three things you would change in the first month and why." },
      { title: "One case study", body: "A channel you grew or transformed. What was the starting point, what did you do, and what happened to the numbers." },
    ],
    schema: {
      "@type": "JobPosting",
      title: "YouTube Growth Specialist",
      description:
        "Roadman Cycling is hiring a YouTube Growth Specialist to accelerate growth of The Roadman Podcast YouTube channel (61K+ subscribers). Audit, strategy, thumbnail direction, retention optimisation, and Shorts strategy. Remote, contract/part-time. Must have proven track record growing YouTube channels past 100K subscribers.",
      datePosted: "2026-07-14",
      employmentType: ["PART_TIME", "CONTRACTOR"],
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: [
        { "@type": "Country", name: "Ireland" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Australia" },
      ],
      qualifications:
        "Proven track record growing YouTube channels past 100K subscribers. Deep understanding of YouTube algorithm, analytics, thumbnail design, and metadata optimisation. Experience in sports, fitness, or endurance content preferred.",
      skills:
        "YouTube Studio analytics, thumbnail design/art direction, title optimisation, A/B testing, Shorts strategy, audience retention analysis, SEO, content packaging.",
    },
  },
  {
    id: "paid-traffic",
    title: "Paid Traffic & Community Growth Specialist",
    tagline: "FILL THE ROOM WITH RIDERS WHO BELONG IN IT.",
    location: "Remote",
    type: "Contract / Part-time",
    hook: "Not Done Yet has 113 paying members at $195/month. Your job is to make that number much bigger — profitably.",
    description: [
      "Roadman's paid coaching community, Not Done Yet, is where serious amateur cyclists get structured coaching, weekly live calls with Anthony, and a peer group that holds them accountable. The product works. The retention is strong. What we don't have is a reliable, scalable acquisition engine.",
      "We need someone who can build and run paid campaigns across Meta and Google that drive qualified leads into the community at a cost per acquisition that makes commercial sense. Not vanity traffic. Not tyre-kickers. Riders who are serious about getting faster and willing to pay $195 a month for the structure to do it.",
      "You will own the full paid funnel — ad creative, targeting, landing page optimisation, retargeting, and reporting. Anthony sets the strategy and approves the messaging. You execute, test, and optimise.",
    ],
    responsibilities: [
      {
        title: "Campaign management",
        body: "Build, launch, and manage paid campaigns on Meta (Facebook and Instagram) and Google Ads. Own the budget, the bids, and the CPA targets. Report weekly on what is working and what is not.",
      },
      {
        title: "Creative and copy",
        body: "Write or brief ad creative that speaks to our audience — serious amateurs over 35, not beginners. Test hooks, formats, and angles. Match the Roadman voice: direct, credible, no hype.",
      },
      {
        title: "Funnel optimisation",
        body: "Own the path from ad click to community signup. Test landing pages, CTAs, and onboarding flows. Reduce friction at every step. Work with the team on email sequences that convert leads who don't sign up immediately.",
      },
      {
        title: "Audience building",
        body: "Build and refine targeting — lookalike audiences, interest stacks, retargeting pools. Identify which segments convert at the best CPA and double down on them.",
      },
    ],
    mustHaves: [
      "At least 3 years managing paid campaigns on Meta Ads Manager and Google Ads — with budget responsibility and CPA accountability",
      "Experience driving signups for a subscription or membership product, not just e-commerce or lead gen",
      "Fluency in conversion tracking, pixel setup, attribution modelling, and reporting across platforms",
      "A/B testing discipline — you test one variable at a time and let the data decide",
      "Strong copywriting skills — you can write ad copy that converts without sounding like every other ad in the feed",
      "Experience with retargeting and nurture sequences that recover warm leads",
      "Comfort working to a target CPA — you understand unit economics, not just impressions",
    ],
    niceToHaves: [
      "Experience in the cycling, endurance sports, or fitness membership space",
      "Familiarity with Skool as a community platform",
      "Experience growing communities or membership products from sub-200 to 500+ members",
      "Landing page design or development skills (Webflow, Unbounce, or similar)",
      "Understanding of organic social as a complement to paid — not just running ads in isolation",
    ],
    applySubject: "Paid Traffic Specialist Application",
    applyInstructions: [
      { title: "Your CV or portfolio", body: "Focus on paid acquisition work. Platforms, budgets managed, CPAs achieved, and membership/subscription results." },
      { title: "A brief strategy outline", body: "How you would approach acquiring Not Done Yet members at $195/month via paid channels. What platforms, what targeting, what creative angles. Keep it to one page." },
      { title: "One case study", body: "A membership, subscription, or community product you grew through paid traffic. Starting point, spend, CPA, and result." },
    ],
    schema: {
      "@type": "JobPosting",
      title: "Paid Traffic & Community Growth Specialist",
      description:
        "Roadman Cycling is hiring a Paid Traffic & Community Growth Specialist to scale the Not Done Yet paid coaching community ($195/month). Full-funnel paid acquisition across Meta and Google Ads. Remote, contract/part-time. Must have 3+ years managing paid campaigns with CPA accountability.",
      datePosted: "2026-07-14",
      employmentType: ["PART_TIME", "CONTRACTOR"],
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: [
        { "@type": "Country", name: "Ireland" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Australia" },
      ],
      qualifications:
        "3+ years managing paid campaigns on Meta Ads Manager and Google Ads with budget responsibility and CPA accountability. Experience driving signups for subscription or membership products. Fluency in conversion tracking, A/B testing, and retargeting.",
      skills:
        "Meta Ads Manager, Google Ads, conversion tracking, pixel setup, attribution modelling, A/B testing, copywriting, retargeting, funnel optimisation, landing page optimisation.",
    },
  },
  {
    id: "podcast-cohost",
    title: "Podcast Co-Host",
    tagline: "SIT IN THE OTHER CHAIR.",
    location: "Dublin-based or willing to travel to Dublin",
    type: "Part-time",
    hook: "The Roadman Cycling Podcast needs a second voice. Someone who rides, who thinks, and who can hold a conversation for 90 minutes without running out of things to say.",
    description: [
      "Anthony has hosted over 1,400 episodes. The podcast has been a solo operation in terms of the hosting chair — and it's time for that to change. We want someone who can sit across the table, bring their own perspective, challenge guests, and create the kind of dynamic that makes listeners feel like they're eavesdropping on two mates who really know their stuff.",
      "This is not a reading-off-a-script role. You need to know cycling — training, racing, the culture, the history, the current pro scene. You need to be able to talk to a World Tour coach about periodisation and then pivot to a conversation about saddle sores without missing a beat.",
      "Episodes are recorded in our Dublin studio. You need to be based in Dublin or willing to travel to Dublin regularly for live recordings. This is an in-person role — the chemistry doesn't work over Zoom.",
    ],
    responsibilities: [
      {
        title: "Co-host episodes",
        body: "Sit alongside Anthony for podcast recordings. Bring your own questions, reactions, and angles. The best episodes come from genuine conversation between two people who care about the topic — that's what we're building.",
      },
      {
        title: "Prepare for guests",
        body: "Research guests before recording. Know their work, their positions, their controversies. Come to the studio with a perspective, not just a question list.",
      },
      {
        title: "Bring the audience perspective",
        body: "Anthony has deep access to the expert world. Your job is to bridge between the expert and the listener — ask the question the audience is thinking, push back when something needs explaining, and keep things grounded.",
      },
      {
        title: "Contribute to content direction",
        body: "Help shape the editorial calendar. Pitch topics, suggest guests, and flag conversations the audience is having that we should be having too.",
      },
    ],
    mustHaves: [
      "A genuine passion for cycling — road, gravel, or endurance. You ride regularly and you train with intent, not just for fun",
      "Strong on-mic or on-camera presence — you've done podcasting, radio, YouTube, public speaking, or similar. Send us a link.",
      "Knowledge of training methodology — you don't need a sports science degree, but you need to know the difference between sweet spot and threshold, and have an opinion about it",
      "Interviewing skills — you can listen, follow a thread, and ask the question that gets the real answer, not the rehearsed one",
      "Comfort with long-form conversation — episodes run 60 to 90 minutes. You need to sustain energy and quality across the full session",
      "Based in Dublin or willing to travel to Dublin regularly for live studio recordings — this is non-negotiable",
      "Chemistry with Anthony — we'll know this when we hear it. The audition is a test recording.",
    ],
    niceToHaves: [
      "A racing background — Cat 3 or better, sportive podiums, time trial pedigree, or competitive gravel racing",
      "An existing audience or social media presence in the cycling space",
      "Experience in broadcast, journalism, or sports media",
      "Knowledge of the professional peloton — current and historical. The kind of person who has opinions about race tactics, not just results",
      "Familiarity with the Roadman Cycling Podcast — if you've listened to 50+ episodes, you already know the tone we're after",
    ],
    applySubject: "Podcast Co-Host Application",
    applyInstructions: [
      { title: "A short cover note", body: "Who you are, why this role, and what you'd bring to the podcast that isn't already there. Keep it to half a page." },
      { title: "Audio or video sample", body: "A link to something we can listen to or watch — a podcast you've been on, a YouTube video, a speaking engagement. We need to hear your voice and how you hold a conversation." },
      { title: "Your cycling CV", body: "Not a formal CV. Just tell us: what do you ride, how do you train, what's your background in the sport. We need to know you're one of us." },
    ],
    schema: {
      "@type": "JobPosting",
      title: "Podcast Co-Host",
      description:
        "Roadman Cycling is hiring a Podcast Co-Host for The Roadman Cycling Podcast (100M+ downloads, 1,400+ episodes). Co-host alongside Anthony Walsh in the Dublin studio. Must be Dublin-based or willing to travel regularly. Requires genuine cycling knowledge, strong on-mic presence, and interviewing skills.",
      datePosted: "2026-07-14",
      employmentType: "PART_TIME",
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dublin",
          addressCountry: "IE",
        },
      },
      qualifications:
        "Genuine cycling passion with regular training. Strong on-mic or on-camera presence with demonstrable experience. Knowledge of training methodology. Interviewing skills. Comfort with long-form (60-90 minute) conversations. Based in Dublin or willing to travel to Dublin regularly.",
      skills:
        "Podcasting, interviewing, cycling knowledge, training methodology, on-camera presence, guest research, editorial planning.",
    },
  },
];

const aboutFacts = [
  {
    stat: "100M+",
    label: "Podcast downloads",
    detail: "The Roadman Cycling Podcast — one of the largest cycling podcasts in the world",
  },
  {
    stat: "1,400+",
    label: "Expert conversations",
    detail: "World Tour coaches, sports scientists, pro cyclists — methodology built on direct access, not theory",
  },
  {
    stat: "TrainingPeaks",
    label: "Partner network",
    detail: "Plus TrainingPeaks, expert reviewers, and a coaching platform scaling across Ireland, the UK, and the USA",
  },
];

/* ── Component ───────────────────────────────────────────────────── */

function RoleSection({ role, index }: { role: Role; index: number }) {
  const mailto = `mailto:anthony@roadmancycling.com?subject=${encodeURIComponent(role.applySubject)}`;
  const bg = index % 2 === 0 ? "deep-purple" : "charcoal";
  const grain = index % 2 === 0;

  return (
    <Section background={bg} grain={grain} id={role.id}>
      <Container width="narrow">
        {/* Role header */}
        <ScrollReveal direction="up" className="text-center mb-12">
          <p className="text-coral font-heading text-xs tracking-widest mb-3">
            {role.location.toUpperCase()} &middot; {role.type.toUpperCase()}
          </p>
          <h2
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            <GradientText as="span">{role.tagline}</GradientText>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            {role.hook}
          </p>
        </ScrollReveal>

        {/* Description + responsibilities */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          <ScrollReveal direction="left">
            <div className="space-y-4 text-foreground-muted leading-relaxed">
              {role.description.map((p, i) => (
                <p key={i} className={i === role.description.length - 1 ? "text-off-white font-medium" : ""}>
                  {p}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="space-y-4">
              {role.responsibilities.map((r) => (
                <Card key={r.title} className="p-5" glass hoverable={false}>
                  <h3 className="font-heading text-base text-off-white mb-2 tracking-wide">
                    {r.title.toUpperCase()}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {r.body}
                  </p>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Must-haves and nice-to-haves side by side */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <ScrollReveal direction="up">
            <h3 className="font-heading text-off-white text-lg tracking-wide mb-4">
              THE MUST-HAVES.
            </h3>
            <Card className="p-6" hoverable={false}>
              <ul className="space-y-3">
                {role.mustHaves.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted text-sm leading-relaxed"
                  >
                    <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.08}>
            <h3 className="font-heading text-off-white text-lg tracking-wide mb-4">
              NICE TO HAVE.
            </h3>
            <Card className="p-6" glass hoverable={false}>
              <ul className="space-y-3">
                {role.niceToHaves.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted text-sm leading-relaxed"
                  >
                    <span className="text-coral mt-0.5 shrink-0">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </ScrollReveal>
        </div>

        {/* How to apply */}
        <ScrollReveal direction="up">
          <Card className="p-6 md:p-8" hoverable={false}>
            <h3 className="font-heading text-off-white text-lg tracking-wide mb-4">
              HOW TO APPLY
            </h3>
            <p className="text-foreground-muted text-sm mb-4">
              Email{" "}
              <a
                href={mailto}
                className="text-coral hover:text-coral/80 underline underline-offset-4 font-medium"
              >
                anthony@roadmancycling.com
              </a>{" "}
              with the subject{" "}
              <span className="text-off-white font-medium">
                &ldquo;{role.applySubject}&rdquo;
              </span>{" "}
              and include:
            </p>

            <ol className="space-y-4 mb-6">
              {role.applyInstructions.map((step, i) => (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="font-heading text-2xl text-coral/70 shrink-0 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-heading text-off-white text-base mb-1 tracking-wide">
                      {step.title.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="text-center">
              <Button href={mailto} size="lg" dataTrack={`careers_${role.id}_apply`}>
                Apply for This Role
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </Container>
    </Section>
  );
}

export default function CareersPage() {
  return (
    <>
      {/* Schema for all roles */}
      {ROLES.map((role) => (
        <JsonLd
          key={role.id}
          data={{
            "@context": "https://schema.org",
            ...role.schema,
            hiringOrganization: { "@id": ENTITY_IDS.organization },
            directApply: false,
            applicationContact: {
              "@type": "ContactPoint",
              email: "anthony@roadmancycling.com",
            },
          }}
        />
      ))}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Careers", item: "https://roadmancycling.com/careers" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                WE&apos;RE HIRING — {ROLES.length} OPEN ROLES
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                BUILD SOMETHING REAL
                <br />
                <span className="text-coral">IN CYCLING.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Roadman Cycling is growing. We need people who care about the
                sport as much as we do — and who are good enough at what they do
                to help us become the definitive platform for serious amateur
                cyclists.
              </p>
            </ScrollReveal>

            {/* Role cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {ROLES.map((role, i) => (
                <ScrollReveal key={role.id} direction="up" delay={i * 0.06}>
                  <a
                    href={`#${role.id}`}
                    className="block group"
                  >
                    <Card className="p-5 h-full text-left transition-all duration-200 group-hover:border-coral/40" glass hoverable={false}>
                      <p className="font-heading text-off-white text-base tracking-wide mb-2 group-hover:text-coral transition-colors">
                        {role.title.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-subtle mb-3">
                        {role.location}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {role.type}
                      </p>
                    </Card>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Who we are */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                ABOUT ROADMAN
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                NOT A SIDE PROJECT.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Roadman Cycling is one of the largest cycling brands in the
                English-speaking world — and we&apos;re scaling across coaching,
                content, and community. These are roles inside a real, growing
                business.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {aboutFacts.map((f, i) => (
                <ScrollReveal key={f.label} direction="up" delay={i * 0.08}>
                  <Card className="p-7 h-full text-center" glass hoverable={false}>
                    <p className="font-heading text-5xl text-coral mb-2">
                      {f.stat}
                    </p>
                    <p className="text-off-white font-medium mb-2">{f.label}</p>
                    <p className="text-sm text-foreground-subtle leading-relaxed">
                      {f.detail}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Visual break */}
        <div className="relative h-[15vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[7rem] md:text-[10rem] select-none tracking-tighter leading-none">
              ROADMAN
            </p>
          </div>
        </div>

        {/* Individual role sections */}
        {ROLES.map((role, i) => (
          <RoleSection key={role.id} role={role} index={i} />
        ))}

        {/* Why work here */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHY ROADMAN
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU GET OUT OF IT.
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Direct line to the expert network",
                  body: "Working inside a team that talks to Professor Stephen Seiler, Dan Lorang, Dr. David Dunne and the rest of the Roadman guest bench. You're not reading about the cutting edge — you're in the room.",
                },
                {
                  title: "A platform if you want it",
                  body: "Roadman has one of the largest cycling audiences in the English-speaking world. If you want to build a public presence — on camera, in podcasts, on socials — the runway is here.",
                },
                {
                  title: "Work that matters to you",
                  body: "Every role here exists because cycling matters to the people doing it. The athletes we serve are serious. The work is real. If you care about the sport, you'll feel it.",
                },
                {
                  title: "A growing business, not a startup pitch",
                  body: "100M+ downloads, 2,100+ community members, revenue from multiple streams. Roadman is established and scaling — not asking you to bet on a pitch deck.",
                },
              ].map((b, i) => (
                <ScrollReveal key={b.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" glass hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3 tracking-wide">
                      {b.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {b.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Closing */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                NOT FOR YOU?
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-6 leading-relaxed">
                If you&apos;re a cyclist who wants to be coached rather than to
                join the team, that path is here too. If you know someone
                who&apos;d be a fit for any of these roles, forward it on — we
                owe you a beer if it works out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/coaching"
                  className="text-coral hover:text-coral/80 transition-colors text-sm tracking-wider font-heading"
                >
                  GET COACHED INSTEAD →
                </Link>
                <span className="hidden sm:inline text-foreground-subtle">&middot;</span>
                <Link
                  href="/about"
                  className="text-coral hover:text-coral/80 transition-colors text-sm tracking-wider font-heading"
                >
                  ABOUT ROADMAN →
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
