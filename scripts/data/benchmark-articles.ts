import { type ClusterArticleSpec } from "./triathlon-cluster-articles";

export const BENCHMARK_ARTICLES: ClusterArticleSpec[] = [
  {
    slug: "ftp-benchmarks-by-age-and-experience",
    title: "FTP Benchmarks by Age and Experience Level",
    seoTitle: "FTP Benchmarks by Age $— Where Do You Stand?",
    seoDescription: "FTP benchmarks for cyclists by age group and experience level. Compare your power output against recreational, competitive, and elite riders.",
    excerpt: "Where does your FTP sit compared to other riders your age? Here are the benchmarks $— from beginner to elite $— with the context most tables leave out.",
    targetKeyword: "ftp benchmarks age",
    supportingKeywords: ["average ftp cycling", "good ftp for age", "ftp by age group", "cycling power benchmarks"],
    angle: "Benchmark reference page with tables by age group (20s, 30s, 40s, 50s, 60+) and experience level. Cites Coggan, Allen, and podcast data.",
    pillar: "coaching",
    requiredSections: ["How to read FTP benchmarks", "FTP benchmarks by age group", "FTP benchmarks by experience level", "W/kg benchmarks (the number that matters more)", "How fast can you improve?", "When benchmarks stop mattering"],
    internalLinks: [{ href: "/tools/ftp-zones", anchor: "FTP zone calculator" }, { href: "/tools/wkg", anchor: "W/kg calculator" }, { href: "/glossary/ftp", anchor: "what is FTP" }],
    wordTarget: 2500,
    featuredImage: "/images/cycling/gravel-road-climb-2.jpg",
  },
  {
    slug: "time-crunched-cyclist-benchmarks",
    title: "What Time-Crunched Cyclists Can Realistically Achieve",
    seoTitle: "Time-Crunched Cyclist Benchmarks $— Realistic Goals",
    seoDescription: "Realistic performance benchmarks for cyclists training 6-10 hours per week. FTP gains, race results, and what to expect at each experience level.",
    excerpt: "If you train 6-10 hours a week, here's what's realistically achievable $— and what isn't. Based on coaching data and the research.",
    targetKeyword: "time crunched cyclist benchmarks",
    supportingKeywords: ["cycling 6 hours week", "realistic cycling improvement", "limited time cycling", "how fast can I get"],
    angle: "Benchmark page specifically for the 6-10hr/week rider. Addresses the gap between pro schedules and amateur reality.",
    pillar: "coaching",
    requiredSections: ["The 6-hour-a-week reality", "Year 1 expectations", "Year 2-3 expectations", "The plateau zone (year 3+)", "What coaching changes at each stage", "The one metric that matters most"],
    internalLinks: [{ href: "/blog/time-crunched-cyclist-8-hours-week", anchor: "time-crunched guide" }, { href: "/problem/not-getting-faster", anchor: "not getting faster" }, { href: "/assessment", anchor: "coaching assessment" }],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-roadside-break.jpg",
  },
];
