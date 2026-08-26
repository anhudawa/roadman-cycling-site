# GSC Event structured-data repair — 26 August 2026

## Search Console evidence

- Property: `sc-domain:roadmancycling.com`
- Events report last updated: 25 August 2026
- Valid items: 115
- Invalid items: 21
- Critical issues on all 21 invalid items:
  - missing `location`
  - missing `startDate`
- The examples are the 21 Tour de France stage URLs, including
  `/tour-de-france/stage/1`, `/stage/3`, `/stage/11`, and `/stage/21`.
- The report showed recent crawls through 26 August 2026, so this was a live
  structured-data defect rather than historical residue.

## Root cause

Each stage page emitted one complete `SportsEvent` for the stage and a second
inline `SportsEvent` under `superEvent`. The nested Tour-level object had only a
name and URL, so Google treated it as another Event item and correctly reported
the required `startDate` and `location` fields as missing.

## Repair

- Give the canonical Tour event on `/tour-de-france` the stable identifier
  `https://roadmancycling.com/tour-de-france#event`.
- Give every stage event its own stable `#event` identifier.
- Point `superEvent` at the canonical Tour identifier using an `@id` reference
  instead of duplicating an incomplete Event object on every stage page.
- Preserve the complete stage-level name, date, status, attendance mode,
  location, URL, and description.

This follows Google's requirement that each eligible Event describe its name,
start date, and location, while keeping each stage URL focused on its single
stage event.

## Expected Search Console result

After Google recrawls the 21 stage pages, the two critical issue groups should
fall from 21 to zero. Validation should only be started after the production
markup is verified, because that action asks Google to recrawl the affected
set.
