# Tour stage phantom Event fix — 31 August 2026

## Search Console evidence

Google Search Console reported 21 invalid Event items across all 21 Tour de France 2026 stage pages:

- 21 missing `location`;
- 21 missing `startDate`;
- 15 missing `name`.

The affected item name was `N/A`, even though each page's visible `SportsEvent` already had a name, date and two addressed locations. Starting validation against the live pages failed immediately and returned the `N/A` item, confirming that Google still detected a separate incomplete Event.

## Root cause

The stage schema nested this ID-only reference:

```json
"superEvent": { "@id": "https://roadmancycling.com/tour-de-france#event" }
```

Although it did not explicitly repeat `@type`, Google inferred the range of `superEvent` as another Event on the page. Because that node contained only an ID, it became a second item with no name, start date or location. The complete stage `SportsEvent` was not the invalid item.

## Release decision

- Remove the ID-only `superEvent` reference from stage pages. The complete parent Tour event remains published on `/tour-de-france` and does not need to be duplicated or dereferenced on every stage.
- Mark every 2026 stage `EventCompleted`. The race ended on 26 July 2026; missing editorial result detail on some stages does not mean those historical events remain scheduled.
- Preserve each stage's own name, start/end date, locations, URL, attendance mode and description.

## Validation contract

1. The source test forbids `superEvent` on stage pages.
2. A rendered stage page must expose exactly one Event/SportsEvent node.
3. That node must have `name`, `startDate`, `endDate`, `location` and `EventCompleted`.
4. Start Search Console validation for all three critical issues only after production passes those checks.
