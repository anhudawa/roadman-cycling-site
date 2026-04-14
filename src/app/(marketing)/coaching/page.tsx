import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title: "Online Cycling Coach — Personalised Coaching | $195/month",
  description:
    "Personalised cycling coaching built on 1,400+ expert podcast conversations. Training plans, nutrition, strength, recovery, and accountability. Trusted by 60,000+ cyclists in Ireland, UK, and USA.",
  keywords: [
    "cycling coach",
    "cycling coaching",
    "online cycling coach",
    "cycling coaching program",
    "personalised cycling training plan",
    "cycling coach ireland",
    "cycling coach uk",
    "best online cycling coach",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/coaching",
  },
  openGraph: {
    title: "Online Cycling Coach — Personalised Coaching | $195/month",
    description:
      "Personalised cycling coaching built on 1,400+ expert podcast conversations. Training, nutrition, strength, recovery, and accountability.",
    type: "website",
    url: "https://roadmancycling.com/coaching",
  },
};

const results = [
  {
    stat: "+90w",
    label: "FTP gain",
    name: "Damien Maloney",
    detail: "205w → 295w",
  },
  {
    stat: "3 → 1",
    label: "Category jump",
    name: "Daniel Stone",
    detail: "Roadman Cycling Club",
  },
  {
    stat: "+15%",
    label: "FTP gain at age 52",
    name: "Brian Morrissey",
    detail: "230w → 265w",
  },
];

const pillars = [
  {
    number: "01",
    title: "Training",
    description:
      "Personalised TrainingPeaks plans built around your life, your goals, and your data. Adjusted weekly based on how you actually responded — not how an algorithm predicted you would.",
  },
  {
    number: "02",
    title: "Nutrition",
    description:
      "Race weight, fuelling strategy, and body composition guidance. Not calorie counting — practical nutrition that makes a measurable difference to your power-to-weight ratio.",
  },
  {
    number: "03",
    title: "Strength",
    description:
      "Cycling-specific S&C programming that transfers directly to the bike. Periodised with your riding so you get stronger without wrecking your legs.",
  },
  {
    number: "04",
    title: "Recovery",
    description:
      "Sleep optimisation, stress management, and adaptation protocols. The part most cyclists ignore — and the part that determines whether training actually sticks.",
  },
  {
    number: "05",
    title: "Accountability",
    description:
      "Weekly coaching calls, community support, and 1:1 plan reviews. The reason this works when apps and solo plans don't — someone who knows your situation is watching.",
  },
];

const faqItems = [
  {
    question: "Is a cycling coach worth it?",
    answer:
      "A cycling coach is worth it when you have been training consistently for 1-2 years and stopped improving, when you cannot figure out why your FTP has plateaued, or when you need structured accountability. Our members typically see measurable improvements within 8-12 weeks. At $195 per month, coaching costs less than a single bike upgrade and delivers better long-term results.",
  },
  {
    question: "How does online cycling coaching work?",
    answer:
      "You get a personalised training plan on TrainingPeaks that adapts weekly based on your data, life context, and how you responded to the previous week. This includes weekly coaching calls, 1:1 plan reviews, nutrition guidance, strength programming, and access to a private community of serious cyclists. Everything is remote — your coach sees more of your training data than an in-person coach ever could.",
  },
  {
    question: "How much does a cycling coach cost?",
    answer:
      "Coaching is $195 per month and includes 1:1 personalised coaching with Anthony Walsh across all five pillars — training, nutrition, strength, recovery, and accountability. You get a personalised TrainingPeaks plan, weekly coaching calls, and a private community of serious cyclists. Includes a 7-day free trial.",
  },
  {
    question:
      "What is the difference between a cycling app and a cycling coach?",
    answer:
      "A cycling app gives you workouts. A coach gives you a system. Apps cannot adjust for a bad night of sleep, a stressful week at work, or the fact that your knee has been sore since Tuesday. A coach builds your plan around your actual life and adjusts it in real time. That is why our members consistently outperform their app-trained years.",
  },
  {
    question: "Do I need a power meter for coaching?",
    answer:
      "A power meter makes coaching significantly more effective because it gives your coach objective data to work with. However, it is not required to start. Many of our members begin with heart rate and RPE and add a power meter later. We will help you get the most out of whatever setup you have.",
  },
  {
    question: "Can I get coaching if I only ride 6-8 hours per week?",
    answer:
      "Yes — in fact, time-limited cyclists benefit the most from coaching. When you only have 6-8 hours, every session needs to count. A coach ensures you are doing the right work at the right intensity instead of accumulating junk miles. Several of our strongest results come from riders training under 8 hours per week.",
  },
  {
    question: "Do you coach cyclists in Ireland, the UK, and the USA?",
    answer:
      "Yes. Roadman Cycling is based in Dublin, Ireland, and coaches cyclists across Ireland, the UK, the USA, and worldwide. All coaching is delivered online through TrainingPeaks, Zoom, and our private community platform. Time zones are never an issue — coaching calls are scheduled flexibly and all communication is asynchronous-first.",
  },
];

const testimonials = [
  {
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
    name: "Damien Maloney",
    detail: "FTP: 205w → 295w",
  },
  {
    quote:
      "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
    name: "Daniel Stone",
    detail: "Roadman Cycling Club",
  },
  {
    quote:
      "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
    name: "Brian Morrissey",
    detail: "Age 52, shift worker",
  },
  {
    quote:
      "From 315lbs to sub-100kg, and I'm still going. The accountability and structure changed my life — not just my cycling.",
    name: "Gregory Gross",
    detail: "USA",
  },
];

export default function CoachingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Roadman Cycling Coaching",
          description:
            "Personalised online cycling coaching across five pillars: training, nutrition, strength, recovery, and accountability. Built on 1,400+ expert podcast conversations.",
          serviceType: "Online Cycling Coaching",
          provider: {
            "@type": "Person",
            name: "Anthony Walsh",
            jobTitle: "Head Coach & Founder",
            url: "https://roadmancycling.com",
            worksFor: {
              "@type": "Organization",
              name: "Roadman Cycling",
              url: "https://roadmancycling.com",
            },
          },
          areaServed: [
            { "@type": "Country", name: "Ireland" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "Country", name: "United States" },
          ],
          offers: {
            "@type": "Offer",
            name: "Not Done Yet — Personalised Coaching",
            price: "195",
            priceCurrency: "USD",
            description:
              "1:1 personalised coaching across training, nutrition, strength, recovery, and accountability",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Coaching",
              item: "https://roadmancycling.com/coaching",
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                ONLINE CYCLING COACHING
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                STOP GUESSING.
                <br />
                <span className="text-coral">START PROGRESSING.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Personalised cycling coaching built on 1,400+ conversations with
                the world&apos;s best coaches and scientists. Training,
                nutrition, strength, recovery, and accountability — structured
                into your week so every session counts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button href="/apply" size="lg">
                  Apply Now — 7-Day Free Trial
                </Button>
                <Button href="#how-it-works" variant="ghost" size="lg">
                  See How It Works
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Results */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                REAL RESULTS FROM REAL CYCLISTS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Not influencers. Not pros. Everyday cyclists with jobs, families,
                and limited training hours.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {results.map((r, i) => (
                <ScrollReveal key={r.name} direction="up" delay={i * 0.1}>
                  <Card
                    className="p-8 text-center h-full"
                    glass
                    hoverable={false}
                  >
                    <p className="font-heading text-5xl text-coral mb-2">
                      {r.stat}
                    </p>
                    <p className="text-off-white font-medium mb-1">
                      {r.label}
                    </p>
                    <p className="text-xs text-foreground-subtle">{r.name}</p>
                    <p className="text-xs text-foreground-subtle">{r.detail}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* The Problem */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">
                    MOST CYCLISTS PLATEAU AFTER 2-3 YEARS.
                  </GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    You bought the power meter. Downloaded the training app. Did
                    the intervals. And it worked — for a while. Then the gains
                    stopped, motivation dipped, and you started wondering whether
                    this is just your ceiling.
                  </p>
                  <p>
                    It&apos;s not. The problem isn&apos;t effort — it&apos;s
                    structure. Training apps give you workouts. They can&apos;t
                    adjust for a bad night of sleep, a stressful week at work, or
                    the fact that your nutrition is quietly undermining everything
                    else.
                  </p>
                  <p className="text-off-white font-medium">
                    A coach sees the whole picture. That&apos;s why coaching
                    works when apps stop working.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHY A CYCLING COACH?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Plans that adapt weekly based on your data and life context",
                      "Nutrition guidance that targets your power-to-weight ratio",
                      "Strength programming periodised with your riding",
                      "Recovery protocols that let training actually stick",
                      "Accountability that keeps you consistent through bad weeks",
                      "Expert knowledge from 1,400+ podcast conversations distilled into your plan",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Visual break */}
        <div className="relative h-[25vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[8rem] md:text-[12rem] select-none tracking-tighter leading-none">
              COACH
            </p>
          </div>
        </div>

        {/* Five Pillars */}
        <Section background="charcoal" id="how-it-works">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-16">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE FIVE-PILLAR SYSTEM
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Most coaching is just a training plan. Ours covers everything
                that determines whether you actually get faster.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {pillars.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card
                    className="p-6 card-shimmer group"
                    glass
                    tilt
                    tiltStrength={4}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/40 group-hover:text-coral transition-colors duration-300">
                          {item.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors duration-300">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Who This Is For */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS COACHING RIGHT FOR YOU?
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left">
                <Card
                  className="p-6 h-full border-l-2 border-l-coral"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-coral mb-4">
                    YES, IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Have been riding 1-2+ years and stopped improving",
                      "Train consistently but can't break through your FTP plateau",
                      "Want structure but don't know how to build a proper plan",
                      "Have limited hours and need every session to count",
                      "Are over 40 and feel the gains getting harder to find",
                      "Have tried apps and self-coaching and hit a wall",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card
                  className="p-6 h-full border-l-2 border-l-foreground-subtle"
                  hoverable={false}
                >
                  <h3 className="font-heading text-lg text-foreground-subtle mb-4">
                    NOT IF YOU...
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Are brand new to cycling (start with our free Clubhouse first)",
                      "Already have a coach you're happy with",
                      "Just want a generic plan to follow without feedback",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-foreground-subtle mt-0.5 shrink-0">
                          &times;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Testimonials */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FROM CYCLISTS WHO&apos;VE DONE IT
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <ScrollReveal
                  key={t.name}
                  direction={i % 2 === 0 ? "left" : "right"}
                >
                  <Card className="p-6" glass hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-coral font-heading tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        &middot; {t.detail}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Geographic trust */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COACHING CYCLISTS WORLDWIDE
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
                Based in Dublin, Ireland. Coaching cyclists across Ireland, the
                UK, the USA, and beyond. All coaching is delivered online — your
                location is never a barrier to getting faster.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/coaching/ireland"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  IRELAND
                </Link>
                <Link
                  href="/coaching/uk"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED KINGDOM
                </Link>
                <Link
                  href="/coaching/usa"
                  className="px-6 py-3 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white transition-colors font-heading text-sm tracking-wider"
                >
                  UNITED STATES
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>

            <FAQSchema faqs={faqItems} />

            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.06}>
                  <Card className="p-6" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3">
                      {item.question.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR COACHING STARTS HERE.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              7-day free trial. Five pillars. Personalised to your goals, your
              schedule, and your life. Cancel anytime.
            </p>
            <Button href="/apply" size="lg" className="bg-off-white text-coral hover:bg-off-white/90">
              Apply Now
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>$195/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>7-day free trial</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
