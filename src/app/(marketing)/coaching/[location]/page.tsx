import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

interface LocationData {
  title: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
  heroBody: string;
  areaServed: string;
  /** Short label used in H2 headings — e.g. "Belfast" instead of "Belfast, Northern Ireland" */
  headingLabel: string;
  countryCode: string;
  localContext: string;
  /** If set, renders LocalBusiness schema with these coordinates */
  localBusiness?: {
    locality: string;
    countryCode: "IE" | "GB";
    latitude: number;
    longitude: number;
  };
  testimonials: {
    quote: string;
    name: string;
    detail: string;
  }[];
  faqs: { question: string; answer: string }[];
  localContent: string[];
}

const LOCATIONS: Record<string, LocationData> = {
  ireland: {
    title: "Cycling Coach Ireland",
    seoTitle: "Cycling Coach Ireland — Online Coaching from Dublin",
    seoDescription:
      "Online cycling coaching from Dublin, Ireland. Personalised training plans, nutrition, strength, and accountability from Anthony Walsh and the Roadman Cycling team. Trusted by Irish cyclists from club racers to national-level competitors.",
    localBusiness: {
      locality: "Dublin",
      countryCode: "IE",
      latitude: 53.3498,
      longitude: -6.2603,
    },
    heroSubtitle: "IRELAND'S MOST LISTENED-TO CYCLING COACH",
    heroBody:
      "Roadman Cycling is based in Dublin and has been coaching Irish cyclists since the podcast launched. Whether you are building to the Wicklow 200, the Ring of Beara, the Ring of Kerry, or racing on the Mondello circuit, your plan is built around Irish roads, Irish weather, and your actual schedule.",
    areaServed: "Ireland",
    headingLabel: "Ireland",
    countryCode: "IE",
    localContext: "Dublin, Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Ireland — FTP: 205w → 295w",
      },
      {
        quote:
          "From 113kg to 97kg. The structured approach to training and nutrition changed everything. I'm faster, lighter, and actually enjoying the process.",
        name: "Chris O'Connor",
        detail: "Ireland — Lost 16kg",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Ireland — Club racer",
      },
    ],
    faqs: [
      {
        question: "Can I meet my cycling coach in person in Dublin?",
        answer:
          "Yes. Roadman Cycling is based in Dublin and runs the Roadman CC club rides. While all coaching is delivered online through TrainingPeaks and Zoom, Premium members in Dublin can join club rides and occasionally meet Anthony in person. The online delivery means you get the same quality of coaching whether you are in Dublin, Cork, Galway, or anywhere in Ireland.",
      },
      {
        question: "Does Roadman coach for the Wicklow 200, Ring of Beara and other Irish sportives?",
        answer:
          "Yes — these are two of the events we coach most often. The Wicklow 200 (200km with ~3,000m of climbing through Sally Gap, Wicklow Gap and the Glen of Imaal) and the Ring of Beara (140km around the Beara Peninsula in Cork/Kerry) are on a huge number of Irish cyclists' bucket lists. We periodise the full build — endurance base, climbing-specific work on Wicklow-grade gradients, a proper taper, and a race-day fuelling and pacing plan. Same approach for the Ring of Kerry, Tour de Burren, Ras Tailteann and local league racing.",
      },
      {
        question: "Is this suitable for Cycling Ireland licence holders?",
        answer:
          "Absolutely. We coach riders from A4 through to A1 and have helped multiple members move up categories. Your plan accounts for the Irish racing calendar, typical race profiles, and the specific demands of racing in Ireland.",
      },
    ],
    localContent: [
      "Based in Dublin with deep roots in Irish cycling",
      "Wicklow 200 & Ring of Beara specialists — full periodised builds, climbing-specific blocks, race-day pacing plans",
      "Also coaching for Ring of Kerry, Tour de Burren, Ras Tailteann and local league racing",
      "Home of Roadman CC — Dublin's fastest-growing cycling club",
      "Plans built for Irish weather, Irish roads, and Irish racing",
    ],
  },
  uk: {
    title: "Cycling Coach UK",
    seoTitle: "Cycling Coach UK — Online Cycling Coaching",
    seoDescription:
      "Online cycling coaching for UK riders. Personalised training plans, nutrition, strength, and accountability. From sportive riders to British Cycling licence holders. Trusted by cyclists across England, Scotland, Wales, and Northern Ireland.",
    heroSubtitle: "TRUSTED BY UK CYCLISTS FROM CLUBBERS TO CAT 1",
    heroBody:
      "Roadman Cycling coaches riders across England, Scotland, Wales, and Northern Ireland. Whether you are training for a sportive like Ride London, racing in your local league, or chasing a British Cycling category upgrade, your plan is built around your goals, your hours, and your life.",
    areaServed: "United Kingdom",
    headingLabel: "UK",
    countryCode: "GB",
    localContext: "United Kingdom",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
        name: "Brian Morrissey",
        detail: "UK — Age 52, shift worker",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
    ],
    faqs: [
      {
        question: "Do you coach for British Cycling events and races?",
        answer:
          "Yes. We coach riders competing in British Cycling road races, criteriums, time trials, and hill climbs. Your plan is periodised around the British racing calendar with targeted preparation for your priority events. We have helped multiple UK riders achieve category upgrades.",
      },
      {
        question: "Can you coach me for Ride London or other UK sportives?",
        answer:
          "Absolutely. Sportive preparation is one of our most popular coaching goals. Whether it is Ride London, the Etape du Tour, Dragon Ride, or a local charity event, we build a structured plan that gets you to the start line prepared and confident.",
      },
      {
        question: "What time zone are coaching calls for UK riders?",
        answer:
          "Coaching calls are scheduled flexibly to suit your availability. We are based in Dublin which is on GMT/BST — the same time zone as the UK. Group coaching calls, 1:1 sessions, and community events are all at UK-friendly times.",
      },
    ],
    localContent: [
      "Same time zone — Dublin operates on GMT/BST like the UK",
      "Coaching for British Cycling racing, sportives, and time trials",
      "Members across England, Scotland, Wales, and Northern Ireland",
      "Plans built for UK roads, weather, and the British racing calendar",
    ],
  },
  usa: {
    title: "Cycling Coach USA",
    seoTitle: "Cycling Coach USA — Online Cycling Coaching Program",
    seoDescription:
      "Online cycling coaching for American riders. Personalised training plans, nutrition, strength, and accountability. From gran fondos to USAC racing. Coaching cyclists across all 50 states with flexible scheduling across time zones.",
    heroSubtitle: "THE COACHING SYSTEM TRUSTED BY CYCLISTS ACROSS AMERICA",
    heroBody:
      "Roadman Cycling coaches riders across the United States — from New York to California, Texas to Colorado. Whether you are training for a USAC crit, a gran fondo, or your first century ride, your plan is built around your goals, your time zone, and your life.",
    areaServed: "United States",
    headingLabel: "USA",
    countryCode: "US",
    localContext: "United States",
    testimonials: [
      {
        quote:
          "From 315lbs to sub-100kg, and I'm still going. The accountability and structure changed my life — not just my cycling.",
        name: "Gregory Gross",
        detail: "USA — Weight loss transformation",
      },
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
        detail: "Cat 3 → Cat 1",
      },
    ],
    faqs: [
      {
        question: "What time zone are coaching calls for US riders?",
        answer:
          "All coaching communication is asynchronous-first — you update your training log and your coach reviews and adjusts your plan on their schedule. For live coaching calls, we offer flexible scheduling that works across US time zones. Many of our American members prefer evening calls EST which align with morning time in Dublin.",
      },
      {
        question: "Do you coach for USAC races and American events?",
        answer:
          "Yes. We coach riders competing in USAC criteriums, road races, time trials, and gran fondos across the United States. Your plan is built around the American racing calendar and your specific target events, with proper periodisation, tapering, and race-day strategy.",
      },
      {
        question: "Is online coaching as effective as having a local coach?",
        answer:
          "Online coaching is often more effective because your coach has access to all your training data — power files, heart rate trends, sleep metrics, and subjective feedback — which gives a more complete picture than a local coach who sees you once a week. The key is communication, and our system is built around regular asynchronous check-ins plus live calls when needed.",
      },
    ],
    localContent: [
      "Flexible scheduling across all US time zones",
      "Coaching for USAC racing, gran fondos, and century rides",
      "Asynchronous-first communication for cross-Atlantic coaching",
      "Members across all 50 states from New York to California",
    ],
  },
  dublin: {
    title: "Cycling Coach Dublin",
    seoTitle: "Cycling Coach Dublin — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach in Dublin. Personalised online coaching from Anthony Walsh and the Roadman Cycling team. Based in Dublin, home of Roadman CC. Training plans built for Wicklow climbs, Dublin Mountains, and Irish racing.",
    localBusiness: {
      locality: "Dublin",
      countryCode: "IE",
      latitude: 53.3498,
      longitude: -6.2603,
    },
    heroSubtitle: "DUBLIN'S MOST LISTENED-TO CYCLING COACH",
    heroBody:
      "Roadman Cycling is based in Dublin and coaches riders across the capital and Greater Dublin area. Whether you ride the Dublin Mountains on a Saturday, race with the Orwell or Sundrive, or commute through the city — your plan is built around Dublin roads, Irish weather, and your schedule.",
    areaServed: "Dublin, Ireland",
    headingLabel: "Dublin",
    countryCode: "IE",
    localContext: "Dublin, Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Dublin — FTP: 205w → 295w",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Dublin — Club racer",
      },
      {
        quote:
          "From 113kg to 97kg. The structured approach to training and nutrition changed everything. I'm faster, lighter, and actually enjoying the process.",
        name: "Chris O'Connor",
        detail: "Ireland — Lost 16kg",
      },
    ],
    faqs: [
      {
        question: "Is Roadman Cycling actually based in Dublin?",
        answer:
          "Yes. Anthony Walsh and Roadman Cycling are based in Dublin and have been since the podcast launched. Coaching is delivered online through TrainingPeaks and Zoom so your coach's location does not affect plan quality — but being local means we understand Dublin-specific context like Wicklow climbs, club racing, and Irish weather.",
      },
      {
        question: "Can I join Roadman CC club rides in Dublin?",
        answer:
          "Yes. Roadman CC runs weekly rides from Dublin and Premium coaching members are welcome to join. Club rides are one way we build community — coaching is the 1:1 plan, the club is the shared ride. Both operate out of Dublin.",
      },
      {
        question: "Do you coach Dublin-based riders for Wicklow 200 and local leagues?",
        answer:
          "Absolutely. We coach riders for the Wicklow 200, Ras na mBan, Ras Tailteann, and Cycling Ireland leagues. Your training plan is periodised around your target events with specific preparation blocks for the climbs, distance, and race format you are targeting.",
      },
    ],
    localContent: [
      "Based in Dublin — home of Anthony Walsh and Roadman CC",
      "Plans built for the Dublin Mountains and Wicklow climbs",
      "Coaching riders in Orwell, Sundrive, and Dublin clubs",
      "Local coach for Dublin-based racing, sportives, and gran fondos",
    ],
  },
  cork: {
    title: "Cycling Coach Cork",
    seoTitle: "Cycling Coach Cork — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Cork riders. Online coaching from Roadman Cycling with training plans built for West Cork climbs, Nire Valley, and Munster racing. Trusted by Cork cyclists from sportive riders to league racers.",
    localBusiness: {
      locality: "Cork",
      countryCode: "IE",
      latitude: 51.8985,
      longitude: -8.4756,
    },
    heroSubtitle: "COACHING CORK CYCLISTS ACROSS MUNSTER",
    heroBody:
      "Roadman Cycling coaches riders across Cork and Munster. Whether you ride the Healy Pass, race with Cork Ridgerunners or Blarney CC, or are training for the Sean Kelly Tour — your plan is built around Munster roads, West Cork climbs, and your schedule.",
    areaServed: "Cork, Ireland",
    headingLabel: "Cork",
    countryCode: "IE",
    localContext: "Cork, Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Ireland — FTP: 205w → 295w",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Ireland — Club racer",
      },
      {
        quote:
          "From 113kg to 97kg. The structured approach to training and nutrition changed everything.",
        name: "Chris O'Connor",
        detail: "Ireland — Lost 16kg",
      },
    ],
    faqs: [
      {
        question: "Can you coach me from Cork if Roadman is based in Dublin?",
        answer:
          "Yes. All coaching is delivered online through TrainingPeaks and Zoom — your coach's physical location has no effect on plan quality or communication. Many of our Irish members are based in Cork and Munster. The advantage over an international coach is we understand Irish context: West Cork climbs, Munster weather, the Sean Kelly Tour, and the Munster racing calendar.",
      },
      {
        question: "Do you coach Cork riders for the Sean Kelly Tour and Munster events?",
        answer:
          "Yes. The Sean Kelly Tour is one of the most popular Irish events we coach riders for. We also coach for Tour de Munster, the Ring of Beara, Ras Mumhan, and Munster league racing. Your plan is periodised around your target events.",
      },
      {
        question: "Is there a minimum FTP or racing level to be coached?",
        answer:
          "No. We coach complete beginners through to A1 racers. What matters is your commitment to the process — the plan is built around your current fitness, goals, and available hours. Many of our transformation stories start with riders who thought they were too slow or too new to be coached.",
      },
    ],
    localContent: [
      "Coaching Cork riders for West Cork climbs and Munster racing",
      "Plans built for the Sean Kelly Tour and Tour de Munster",
      "Irish coach who understands Munster roads and weather",
      "Members in Cork Ridgerunners, Blarney CC, and Munster clubs",
    ],
  },
  galway: {
    title: "Cycling Coach Galway",
    seoTitle: "Cycling Coach Galway — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Galway and Connacht riders. Online coaching from Roadman Cycling with training plans built for Connemara climbs, Burren roads, and Western racing. Trusted by Galway cyclists across all levels.",
    localBusiness: {
      locality: "Galway",
      countryCode: "IE",
      latitude: 53.2707,
      longitude: -9.0568,
    },
    heroSubtitle: "COACHING GALWAY AND CONNACHT CYCLISTS",
    heroBody:
      "Roadman Cycling coaches riders across Galway and the West of Ireland. Whether you ride the Sky Road, train in the Burren, race with Western Lakes CC, or are targeting the Connemara 100 — your plan is built around Western roads, Atlantic weather, and your schedule.",
    areaServed: "Galway, Ireland",
    headingLabel: "Galway",
    countryCode: "IE",
    localContext: "Galway, Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Ireland — FTP: 205w → 295w",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Ireland — Club racer",
      },
      {
        quote:
          "From 113kg to 97kg. The structured approach to training and nutrition changed everything.",
        name: "Chris O'Connor",
        detail: "Ireland — Lost 16kg",
      },
    ],
    faqs: [
      {
        question: "Can you coach riders in Galway and the West of Ireland?",
        answer:
          "Yes. All coaching is delivered online through TrainingPeaks and Zoom, so location does not affect plan quality. We coach riders across Galway, Mayo, Sligo, and Clare. The advantage of an Irish coach is we understand the Western context: Atlantic weather, Connemara climbs, and the specific demands of training in the West of Ireland.",
      },
      {
        question: "Do you coach for the Connemara 100 and Western events?",
        answer:
          "Yes. The Connemara 100 is one of Ireland's most iconic events and we coach multiple riders for it each year. We also coach for the Burren Gran Fondo, Tour of the West, and Connacht league racing. Your plan is periodised around your target events.",
      },
      {
        question: "How does online coaching work for rural Galway riders?",
        answer:
          "Most of our Galway members train on their own roads — the quiet lanes around Connemara, the Burren, or the Galway hinterland are ideal for structured sessions. Online coaching means you get a personalised plan without driving to a gym or coach's office. You train on your roads, sync your data to TrainingPeaks, and your coach adjusts the plan based on what you actually did.",
      },
    ],
    localContent: [
      "Coaching Galway riders for Connemara 100 and Western events",
      "Plans built for the Sky Road, Connemara, and Burren climbs",
      "Understands Atlantic weather and Western training context",
      "Members in Western Lakes, Galway Bay, and Connacht clubs",
    ],
  },
  london: {
    title: "Cycling Coach London",
    seoTitle: "Cycling Coach London — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for London riders. Online coaching from Roadman Cycling with training plans built for Surrey Hills, Ride London, and British Cycling racing. Trusted by London cyclists from commuters to Cat 1 racers.",
    localBusiness: {
      locality: "London",
      countryCode: "GB",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    heroSubtitle: "COACHING LONDON CYCLISTS FROM COMMUTERS TO CAT 1",
    heroBody:
      "Roadman Cycling coaches riders across Greater London. Whether you chain Surrey Hills loops on a Saturday, race with Rapha CC or Dulwich Paragon, or are training for Ride London — your plan is built around London traffic, Surrey climbs, and the hours you actually have.",
    areaServed: "London, United Kingdom",
    headingLabel: "London",
    countryCode: "GB",
    localContext: "London, United Kingdom",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180.",
        name: "Brian Morrissey",
        detail: "UK — Age 52",
      },
    ],
    faqs: [
      {
        question: "Can you coach me for Ride London or London club racing?",
        answer:
          "Yes. Ride London is one of our most popular target events for UK riders. We also coach for Tuesday/Thursday Regent's Park chaingangs, Surrey League racing, Hillingdon crits, and Herne Hill track events. Your plan is periodised around your priority events with London-specific training windows.",
      },
      {
        question: "How do you handle London commute miles in training plans?",
        answer:
          "We account for commute miles as part of your weekly load rather than ignoring them. For most London riders commuting 2-4 days a week, those miles form the base endurance while weekend and midweek sessions deliver the structured intensity. Your plan is built to work with your commute, not on top of it.",
      },
      {
        question: "What time zone are coaching calls for London riders?",
        answer:
          "We are based in Dublin which is GMT/BST — the same time zone as London. Live coaching calls, group sessions, and community events are all at times that work for UK riders. No awkward cross-timezone scheduling.",
      },
    ],
    localContent: [
      "Coaching for Ride London, Surrey League, and London crits",
      "Plans built around London commuting and Surrey Hills riding",
      "Same time zone — Dublin operates on GMT/BST like London",
      "Members in Rapha CC, Dulwich Paragon, and London clubs",
    ],
  },
  manchester: {
    title: "Cycling Coach Manchester",
    seoTitle: "Cycling Coach Manchester — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Manchester riders. Online coaching from Roadman Cycling with training plans built for the Peak District, North West racing, and National Cycling Centre track. Trusted by Manchester cyclists at every level.",
    localBusiness: {
      locality: "Manchester",
      countryCode: "GB",
      latitude: 53.4808,
      longitude: -2.2426,
    },
    heroSubtitle: "COACHING MANCHESTER AND NORTH WEST CYCLISTS",
    heroBody:
      "Roadman Cycling coaches riders across Manchester and the North West. Whether you train in the Peak District, race at the National Cycling Centre velodrome, or are targeting the Fred Whitton Challenge — your plan is built around Peak District roads, North West weather, and your schedule.",
    areaServed: "Manchester, United Kingdom",
    headingLabel: "Manchester",
    countryCode: "GB",
    localContext: "Manchester, United Kingdom",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick.",
        name: "Brian Morrissey",
        detail: "UK — Age 52",
      },
    ],
    faqs: [
      {
        question: "Do you coach Manchester riders for the Fred Whitton and Peak District events?",
        answer:
          "Yes. The Fred Whitton Challenge is one of the most demanding UK sportives and we coach multiple riders for it each year. We also coach for Tour of the Peak, Peak District Gran Fondo, North West Road Race League, and Manchester Wheelers events. Your plan is periodised around your target event.",
      },
      {
        question: "Can you coach track cyclists at the National Cycling Centre?",
        answer:
          "We coach road, time trial, and endurance cyclists. For pure track sprint specialists a track-specific coach is the better fit. For endurance track riders (Madison, Points, Scratch) our methodology adapts well — we have coached riders combining track and road racing across the UK calendar.",
      },
      {
        question: "How does online coaching handle Manchester weather?",
        answer:
          "Planning around North West weather is part of the craft. Your plan has indoor backup sessions for the genuine washout weeks and outdoor sessions scheduled when conditions typically allow. TrainerRoad, Zwift, and structured turbo sessions are fully integrated into the programme — not an afterthought.",
      },
    ],
    localContent: [
      "Coaching for Fred Whitton, Peak District sportives, and UK racing",
      "Plans built around Peak District roads and North West climbs",
      "Same time zone — Dublin operates on GMT/BST like Manchester",
      "Members in Manchester Wheelers, Rapha CC, and NW clubs",
    ],
  },
  belfast: {
    title: "Cycling Coach Belfast",
    seoTitle: "Cycling Coach Belfast — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Belfast and Northern Ireland riders. Online coaching from Roadman Cycling with training plans built for the Mournes, Antrim Coast, and NI racing calendar. Based in Dublin, coaching across the island of Ireland.",
    localBusiness: {
      locality: "Belfast",
      countryCode: "GB",
      latitude: 54.5973,
      longitude: -5.9301,
    },
    heroSubtitle: "COACHING BELFAST AND NORTHERN IRELAND CYCLISTS",
    heroBody:
      "Roadman Cycling coaches riders across Belfast and Northern Ireland. Whether you climb the Mournes, train the Antrim Coast Road, race with Phoenix CC or North Down, or are targeting the Giant's Causeway Coast Sportive — your plan is built around NI roads, Irish Sea weather, and your schedule.",
    areaServed: "Belfast, Northern Ireland",
    headingLabel: "Belfast",
    countryCode: "GB",
    localContext: "Belfast, Northern Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Ireland — FTP: 205w → 295w",
      },
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Ireland — Club racer",
      },
    ],
    faqs: [
      {
        question: "Can you coach Belfast riders for Cycling Ulster races?",
        answer:
          "Yes. We coach riders across Cycling Ulster road race leagues, time trial series, and crits at venues like Nutts Corner. Your plan is periodised around the Ulster calendar with specific blocks for your priority events. Multiple NI members have achieved category upgrades in the past two seasons.",
      },
      {
        question: "Do you coach for the Giant's Causeway Coast Sportive and Mournes events?",
        answer:
          "Absolutely. The Giant's Causeway Coast Sportive, the Mourne Gran Fondo, and the Tour of the North are all events we regularly coach riders for. Your plan accounts for the specific climbs, distance, and race profile you are targeting.",
      },
      {
        question: "Is the coaching suitable for riders training across the NI/Republic border?",
        answer:
          "Yes. Many NI riders race on both sides of the border — Cycling Ulster events plus Cycling Ireland leagues and sportives. Your plan handles the full calendar as one integrated season. Based in Dublin and deeply connected to Irish cycling, we understand the all-island racing landscape.",
      },
    ],
    localContent: [
      "Coaching for Cycling Ulster leagues and the Ulster calendar",
      "Plans built for the Mournes, Antrim Coast, and NI climbs",
      "Same time zone — Dublin operates on GMT/BST like Belfast",
      "Members racing across NI and the Republic of Ireland",
    ],
  },
  edinburgh: {
    title: "Cycling Coach Edinburgh",
    seoTitle: "Cycling Coach Edinburgh — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Edinburgh and Scottish riders. Online coaching from Roadman Cycling with training plans built for the Pentlands, Highland climbs, and Scottish racing. Trusted by cyclists across Edinburgh, Glasgow, and beyond.",
    localBusiness: {
      locality: "Edinburgh",
      countryCode: "GB",
      latitude: 55.9533,
      longitude: -3.1883,
    },
    heroSubtitle: "COACHING EDINBURGH AND SCOTTISH CYCLISTS",
    heroBody:
      "Roadman Cycling coaches riders across Edinburgh and Scotland. Whether you train in the Pentlands, chase chaingangs on the Meldons, race with Edinburgh RC or Dunedin CC, or target the Etape Caledonia — your plan is built around Scottish roads, Highland weather, and your schedule.",
    areaServed: "Edinburgh, Scotland",
    headingLabel: "Edinburgh",
    countryCode: "GB",
    localContext: "Edinburgh, Scotland",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick.",
        name: "Brian Morrissey",
        detail: "UK — Age 52",
      },
    ],
    faqs: [
      {
        question: "Do you coach Edinburgh riders for Scottish Cycling events?",
        answer:
          "Yes. We coach riders competing in Scottish Cycling road races, time trials, and the Scottish National Series. Your plan is periodised around the Scottish calendar with specific preparation blocks for events like the Etape Caledonia, Tour o' the Borders, and local league racing.",
      },
      {
        question: "How does your coaching handle Scottish weather and shorter winter daylight?",
        answer:
          "Scottish winters demand more indoor structure than most. Your plan integrates TrainerRoad, Zwift, and structured turbo sessions for the genuine washout weeks, with outdoor endurance rides scheduled for workable daylight windows. Winter training is not an afterthought — it is periodised intentionally.",
      },
      {
        question: "Can you coach riders across both Edinburgh and Glasgow?",
        answer:
          "Yes. All coaching is delivered online so location within Scotland has no effect. We coach members across the Central Belt and into the Highlands. Community group rides and Zoom coaching calls bring members together from across Scotland.",
      },
    ],
    localContent: [
      "Coaching for Scottish Cycling events and the SNS calendar",
      "Plans built for the Pentlands, Meldons, and Highland climbs",
      "Same time zone — Dublin operates on GMT/BST like Edinburgh",
      "Members in Edinburgh RC, Dunedin CC, and Scottish clubs",
    ],
  },
  leeds: {
    title: "Cycling Coach Leeds",
    seoTitle: "Cycling Coach Leeds — Online Coaching from Roadman",
    seoDescription:
      "Cycling coach for Leeds and Yorkshire riders. Online coaching from Roadman Cycling with training plans built for the Dales, Yorkshire climbs, and Tour de Yorkshire routes. Trusted by cyclists across Leeds, Harrogate, and Yorkshire.",
    localBusiness: {
      locality: "Leeds",
      countryCode: "GB",
      latitude: 53.8008,
      longitude: -1.5491,
    },
    heroSubtitle: "COACHING LEEDS AND YORKSHIRE CYCLISTS",
    heroBody:
      "Roadman Cycling coaches riders across Leeds and Yorkshire. Whether you chain Dales loops on the weekend, race with Otley CC or Albarosa, climb Buttertubs and Holme Moss, or target the Étape du Dales — your plan is built around Yorkshire roads, Pennine weather, and your schedule.",
    areaServed: "Leeds, United Kingdom",
    headingLabel: "Leeds",
    countryCode: "GB",
    localContext: "Leeds, United Kingdom",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick.",
        name: "Brian Morrissey",
        detail: "UK — Age 52",
      },
    ],
    faqs: [
      {
        question: "Do you coach Leeds riders for Yorkshire sportives and Dales events?",
        answer:
          "Yes. The Étape du Dales, Dave Rayner, Fred Whitton, and Yorkshire True Grit are all events we regularly coach riders for. Your plan accounts for Yorkshire's specific climbing profiles — sustained efforts on Buttertubs, Holme Moss, and the steeper walls in the Dales.",
      },
      {
        question: "Can you coach for Yorkshire road race leagues?",
        answer:
          "Absolutely. We coach riders competing in Yorkshire Cycling Federation events, the CDNW series, and TLI Cycling races. Your plan is periodised around the Yorkshire racing calendar with targeted preparation for your priority events.",
      },
      {
        question: "How does your plan handle commuting miles in Leeds?",
        answer:
          "We integrate commute miles as part of your weekly load rather than ignoring them. For most Leeds riders commuting 2-4 days a week, those miles form endurance base while weekend and midweek sessions deliver structured intensity. Your plan is built to work with your commute, not on top of it.",
      },
    ],
    localContent: [
      "Coaching for Étape du Dales, Fred Whitton, and Yorkshire sportives",
      "Plans built for Yorkshire Dales climbs and Pennine routes",
      "Same time zone — Dublin operates on GMT/BST like Leeds",
      "Members in Otley CC, Albarosa, and Yorkshire clubs",
    ],
  },
};

/** Cities linked from country landing pages for internal link equity */
const COUNTRY_CITIES: Record<string, { slug: string; label: string }[]> = {
  ireland: [
    { slug: "dublin", label: "DUBLIN" },
    { slug: "cork", label: "CORK" },
    { slug: "galway", label: "GALWAY" },
    { slug: "belfast", label: "BELFAST" },
  ],
  uk: [
    { slug: "london", label: "LONDON" },
    { slug: "manchester", label: "MANCHESTER" },
    { slug: "leeds", label: "LEEDS" },
    { slug: "edinburgh", label: "EDINBURGH" },
    { slug: "belfast", label: "BELFAST" },
  ],
};

interface Props {
  params: Promise<{ location: string }>;
}

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((location) => ({ location }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const data = LOCATIONS[location];
  if (!data) return {};

  return {
    title: data.seoTitle,
    description: data.seoDescription,
    alternates: {
      canonical: `https://roadmancycling.com/coaching/${location}`,
    },
    openGraph: {
      title: data.seoTitle,
      description: data.seoDescription,
      type: "website",
      url: `https://roadmancycling.com/coaching/${location}`,
    },
  };
}

export default async function CoachingLocationPage({ params }: Props) {
  const { location } = await params;
  const data = LOCATIONS[location];
  if (!data) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Roadman Cycling Coaching — ${data.areaServed}`,
          description: data.seoDescription,
          serviceType: "Online Cycling Coaching",
          provider: {
            "@type": "Person",
            name: "Anthony Walsh",
            jobTitle: "Head Coach & Founder",
            url: "https://roadmancycling.com",
          },
          areaServed: {
            "@type": "Country",
            name: data.areaServed,
          },
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
            {
              "@type": "ListItem",
              position: 3,
              name: data.title,
              item: `https://roadmancycling.com/coaching/${location}`,
            },
          ],
        }}
      />

      {/* LocalBusiness schema — triggers Google local business features for geo-targeted pages */}
      {data.localBusiness && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Roadman Cycling",
            description: data.seoDescription,
            address: {
              "@type": "PostalAddress",
              addressLocality: data.localBusiness.locality,
              addressCountry: data.localBusiness.countryCode,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: data.localBusiness.latitude,
              longitude: data.localBusiness.longitude,
            },
            url: `https://roadmancycling.com/coaching/${location}`,
            priceRange: "$195/month",
            sameAs: [
              "https://youtube.com/@theroadmanpodcast",
              "https://instagram.com/roadman.cycling",
            ],
          }}
        />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                {data.heroSubtitle}
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {data.title.toUpperCase()}
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                {data.heroBody}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button href="/apply" size="lg">
                  Apply Now — 7-Day Free Trial
                </Button>
                <Button href="/coaching" variant="ghost" size="lg">
                  See All Coaching Options
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Local context */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHY ROADMAN FOR {data.headingLabel.toUpperCase()} CYCLISTS
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.localContent.map((item, i) => (
                <ScrollReveal key={item} direction="up" delay={i * 0.08}>
                  <Card className="p-5" hoverable={false}>
                    <div className="flex items-start gap-3">
                      <span className="text-coral mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {COUNTRY_CITIES[location] && (
              <ScrollReveal direction="up" className="text-center mt-12">
                <p className="text-foreground-subtle text-xs mb-4 tracking-wider font-heading">
                  OR EXPLORE COACHING BY CITY
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {COUNTRY_CITIES[location].map((city) => (
                    <Link
                      key={city.slug}
                      href={`/coaching/${city.slug}`}
                      className="px-4 py-2 rounded-lg bg-white/5 text-foreground-subtle hover:bg-white/10 hover:text-off-white transition-colors font-heading text-xs tracking-wider"
                    >
                      {city.label}
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </Container>
        </Section>

        {/* Five Pillars summary */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  FIVE PILLARS. ONE SYSTEM.
                </GradientText>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                Every coaching programme covers training, nutrition, strength,
                recovery, and accountability. Not just workouts — a complete
                system built around your life.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["Training", "Nutrition", "Strength", "Recovery", "Accountability"].map(
                (pillar, i) => (
                  <ScrollReveal key={pillar} direction="up" delay={i * 0.06}>
                    <Card className="p-4 text-center" glass hoverable={false}>
                      <p className="font-heading text-sm text-coral tracking-wider">
                        {pillar.toUpperCase()}
                      </p>
                    </Card>
                  </ScrollReveal>
                )
              )}
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
                RESULTS FROM {data.headingLabel.toUpperCase()} CYCLISTS
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {data.testimonials.map((t, i) => (
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

        {/* Triathlon cross-link — every geo page passes authority to the
            /coaching/triathlon pillar. City-specific framing keeps it
            natural rather than boilerplate. */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <Card className="p-8 md:p-10 text-center" glass hoverable={false}>
                <p className="text-coral font-heading text-xs tracking-widest mb-4">
                  FOR {data.headingLabel.toUpperCase()} TRIATHLETES
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RACING A 70.3 OR IRONMAN?
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto mb-6 leading-relaxed">
                  Our{" "}
                  <Link
                    href="/coaching/triathlon"
                    className="text-coral hover:text-coral/80 transition-colors"
                  >
                    triathlon bike coaching
                  </Link>{" "}
                  programme is bike-leg-specific, run-protective, and works
                  for {data.headingLabel} triathletes at 70.3 and Ironman
                  distances. Same coach, same methodology — different
                  periodisation.
                </p>
                <Button href="/coaching/triathlon" size="lg">
                  Triathlon Bike Coaching →
                </Button>
              </Card>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>

            <FAQSchema faqs={data.faqs} />

            <div className="space-y-4">
              {data.faqs.map((item, i) => (
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
              START COACHING TODAY.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              7-day free trial. Five pillars. Personalised to your goals.
              Coaching cyclists in {data.areaServed} and worldwide.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              Apply Now
            </Link>
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
