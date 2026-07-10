# Guest Export & Outreach Instructions

Step-by-step process for running the backlink outreach campaign. Everything you need is on the site or in this folder.

---

## Step 1: Get the guest list

The full guest directory is live at:

**https://www.roadmancycling.com/guests**

This page lists every podcast guest with their name, credential, and number of appearances. It is generated from the site's data files, so it is always up to date.

For each guest, the URL pattern is:
- Guest page: `https://www.roadmancycling.com/guests/[slug]`
- Expert profile (if they have one): `https://www.roadmancycling.com/experts/[slug]`

The slug is the guest's name in lowercase with hyphens — e.g. "Stephen Seiler" becomes `stephen-seiler`.

Not every guest has an expert profile. The expert profiles are for guests who have curated topic pages (e.g. /experts/stephen-seiler/polarised-training). You can check the experts index at:

**https://www.roadmancycling.com/experts**

The tracking CSV in this folder (`tracking-template.csv`) has the first 20 guests pre-populated with their guest page URLs and expert profile URLs where they exist.

---

## Step 2: Find each guest's website and contact

For each guest in your outreach batch:

1. **Check their guest page on the site.** Some pages already link out to the guest's website, social profiles, or organisation.
2. **Google their name + the credential listed on their guest page.** Example: "Stephen Seiler University of Agder" — this will surface their official profile, personal site, or LinkedIn.
3. **Check LinkedIn.** Most guests have a public LinkedIn profile with a contact email or website link.
4. **Check their personal website's contact page.** Many coaches, nutritionists, and authors have a contact form or email on their site.
5. **Check Instagram/X bio.** Some guests list their email or a Linktree in their social bio.

Add the website and email to the tracking spreadsheet as you go. If you can't find an email, note it and move to the next guest. Don't spend more than 5 minutes per guest on contact research.

---

## Step 3: Send the emails

**Cadence:** 10 emails per week, sent on Monday mornings.

**Process for each batch:**

1. Open the tracking spreadsheet.
2. Pick the next 10 guests who have an email address and haven't been contacted yet.
3. For each guest:
   - Decide which template to use:
     - **Template A** — if they have a guest page and an expert profile. This is the default.
     - **Template B** — if their expertise connects to a specific guide or tool on the site. Check their expert profile for topic pages.
     - **Template A (guest page only)** — if they only have a /guests/ page and no /experts/ profile. Adjust the template to remove the expert profile line.
   - Copy the template from `outreach-template.md`.
   - Replace [First Name], [slug], and any [topic] placeholders.
   - Personalise anything that feels too generic — one specific detail from their episode makes it land better.
   - Send from the team email.
4. Log in the tracking spreadsheet:
   - Outreach Date
   - Template Used (A, B, or C)
   - Set the Follow-up Date to 2 weeks from today.

---

## Step 4: Follow up

Every Monday, also check the Follow-up Date column in the spreadsheet:

1. Filter for rows where Follow-up Date = today and Response is blank.
2. Send Template C to those guests.
3. Update Template Used to "C" and clear the Follow-up Date.

If they don't reply to Template C, mark the Response column as "No reply" and move on. Never send a third email.

---

## Step 5: Track responses

When a guest replies:

- **They linked to us:** Update "Link Placed" to Y, add the URL of the page where they linked, and note the date.
- **They said they'll do it later:** Note it. Don't chase — they'll either do it or they won't.
- **They asked for page updates:** Note the request in the "Notes" column and flag it for Anthony or the dev team.
- **They declined or didn't reply:** Mark it and move on. No hard feelings, no second chances.

---

## Weekly time estimate

- Monday: ~90 minutes (send 10 new emails + check follow-ups)
- Rest of the week: ~15 minutes (handle any replies that come in)

Total: about 2 hours per week.

---

## Where to find things

| What | Where |
|------|-------|
| Guest list (live) | https://www.roadmancycling.com/guests |
| Expert profiles (live) | https://www.roadmancycling.com/experts |
| Email templates | `outreach-template.md` in this folder |
| Tracking spreadsheet | `tracking-template.csv` in this folder |
| Priority guest list | `priority-guests.md` in this folder |

---

## Important

- Start with the priority guests in `priority-guests.md` — these are the highest-value backlink targets.
- Don't contact guests who are clearly unreachable (retired without a public presence, no website, no email). Skip them and move to the next.
- If a guest has a .edu or institutional profile but no personal email, try their institutional contact. Academics usually respond.
- Every email goes out under the framing "Anthony asked me to send this" — it's warm outreach from someone they've already met, not a cold pitch.
