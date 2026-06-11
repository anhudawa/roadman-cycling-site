// One-off helper: parse episode + blog frontmatter into a verified citation
// pack so answer/expert authoring never invents slugs. Output: /tmp/citation-pack.json
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const PODCAST_DIR = path.join(ROOT, "content/podcast");
const BLOG_DIR = path.join(ROOT, "content/blog");

// --- guest name normalisation (mirrors src/lib/guests.ts) ---
const NAME_ALIASES = {
  "Dr Stephen Seiler": "Stephen Seiler",
  "Professor Stephen Seiler": "Stephen Seiler",
  "Prof Seiler": "Stephen Seiler",
  "Prof Tim Spector": "Tim Spector",
  "Dr Andy Galpin": "Andy Galpin",
  "Professor Andy Galpin": "Andy Galpin",
  "Dr Berry": "Sarah Berry",
  "Dr Gordan": "Dr Mark Gordon",
  "Dr Gervais": "Dr Michael Gervais",
  "Dr Lim": "Dr Allen Lim",
  "Dr Pruitt": "Dr Andy Pruitt",
  Dowsett: "Alex Dowsett",
  Hincapie: "George Hincapie",
  Hincape: "George Hincapie",
  Brownlee: "Alistair Brownlee",
  Matthews: "Michael Matthews",
  Bottas: "Valtteri Bottas",
  "Mads W": "Mads Wurtz Schmidt",
  "Lachlan Morton": "Lachlan Morton",
  '"Lachlan Morton"': "Lachlan Morton",
  '"Professor Stephen Seiler"': "Stephen Seiler",
  "Aron D": "Aron D'Souza",
  "Dr David Dunne": "David Dunne",
  "Dr. David Dunne": "David Dunne",
  "Dr Sam Impey": "Sam Impey",
  "Dr. Sam Impey": "Sam Impey",
  "Dr Tim Podlogar": "Tim Podlogar",
  "Phil Bert": "Phil Burt",
  "Jack Ultra Cyclist": "Jack Thompson",
  "Jack Ultracyclist": "Jack Thompson",
  "Ger Redmond": "Ger Remond",
  "Trek Segafredo Star Taylor Wiles": "Tayler Wiles",
  "Dr Gordon Laing": "Dr Mark Gordon",
  "Dr Michael Ormsbee": "Michael Ormsbee",
  "Dr. Christian Schrot": "Christian Schrot",
  "Dr Christian Schrot": "Christian Schrot",
  "Darren Raferty": "Darren Rafferty",
};

const EXCLUDED_NAMES = new Set([
  "Rider Support",
  "Roadman Podcast",
  "RDMN Clips",
  "Rdmn Podcast Clips",
  "RDMN Podcast Clips",
  "Roadman Cycling Podcast",
  "Roadman Clips",
  "Team Jayco's Secret AI Tech",
  "Team Jayco’s Secret AI Tech",
  "Time Trial",
  "Tour of Flanders",
  "World Tour Nutritionist",
  "Eva Lovia",
  "Joss Ross",
]);

function isLikelyPersonName(name) {
  if (EXCLUDED_NAMES.has(name)) return false;
  const titlePatterns = [
    /^(How|Why|What|When|The|My|I\b|Top|Best|Secret|Effect|First|Perfect|Racing|Reacting|Decoding|Pros?\b|BADLANDS|Majorca|Protein|Ultimate)/i,
    /[!?]/,
    /\d{4}/,
    /Training|Cycling|Bike|Aero|Winter|Zone|Crash|Fight|Selected|Illness|Questions|Tips/i,
  ];
  for (const p of titlePatterns) if (p.test(name)) return false;
  const words = name.trim().split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  if (!/^[A-ZÀ-ÖØ-Ý]/.test(words[0])) return false;
  return true;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’‘]/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeName(name) {
  const cleaned = name.replace(/^["']|["']$/g, "").trim();
  return NAME_ALIASES[cleaned] || NAME_ALIASES[name] || cleaned;
}

// --- parse podcast episodes ---
const episodeFiles = fs
  .readdirSync(PODCAST_DIR)
  .filter((f) => f.endsWith(".mdx"));

const episodes = [];
const guestMap = new Map();

for (const file of episodeFiles) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(PODCAST_DIR, file), "utf8");
  const { data } = matter(raw);
  const ep = {
    slug,
    title: data.title || "",
    guest: data.guest || null,
    guestCredential: data.guestCredential || null,
    pillar: data.pillar || null,
    type: data.type || null,
    publishDate: data.publishDate || null,
    keywords: data.keywords || [],
  };
  episodes.push(ep);

  if (ep.guest) {
    const norm = normalizeName(String(ep.guest).trim());
    if (isLikelyPersonName(norm)) {
      const gslug = slugify(norm);
      if (!guestMap.has(gslug)) {
        guestMap.set(gslug, {
          name: norm,
          slug: gslug,
          credential: ep.guestCredential || null,
          episodes: [],
        });
      }
      const g = guestMap.get(gslug);
      g.episodes.push({ slug, title: ep.title, pillar: ep.pillar });
      if (!g.credential && ep.guestCredential) g.credential = ep.guestCredential;
    }
  }
}

// --- parse blog posts ---
const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
const blog = [];
for (const file of blogFiles) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data } = matter(raw);
  blog.push({
    slug,
    title: data.title || "",
    pillar: data.pillar || null,
    keywords: data.keywords || [],
  });
}

const guests = Array.from(guestMap.values()).sort(
  (a, b) => b.episodes.length - a.episodes.length
);

const out = {
  generatedAt: new Date().toISOString(),
  episodeCount: episodes.length,
  blogCount: blog.length,
  guestCount: guests.length,
  episodes,
  blog,
  guests,
};

fs.writeFileSync("/tmp/citation-pack.json", JSON.stringify(out, null, 1));
console.log(
  `episodes=${episodes.length} blog=${blog.length} guests=${guests.length}`
);
console.log("--- guest slugs (with episode counts) ---");
for (const g of guests) {
  console.log(`${g.slug}\t${g.episodes.length}\t${g.name}`);
}
