# Masters app measurement release

Released: 1 September 2026

## What changed

The executable app search scorecard now includes the new masters segment without
renaming the forthcoming product or creating another waitlist.

- Fixed page: `/app/masters`.
- Fixed expected owner for explicit masters-app intent: `/app/masters`.
- Fixed Google AI page filter: `/app/masters`.
- One shared app waitlist, with masters forms distinguished only by acquisition
  source.

The exact query regex is:

```text
(cycling|cyclist).*(app).*(over 40|over 50|masters)|(over 40|over 50|masters).*(cycling|cyclist).*app
```

## Baseline

Read-only Search Console captures for 23–29 August and 2–29 August reported zero
clicks, impressions and visible rows for the exact masters-app lane. The exact
page and Google AI filters were also zero because `/app/masters` did not exist
before release.

These zeroes are recorded explicitly. They are not inferred from missing
conversion data, and the waitlist baseline remains `null` until a comparable
capture exists.

## Decision dates

- Seven-day post-release window: 2–8 September; capture no earlier than 11
  September.
- 28-day post-release window: 2–29 September; capture no earlier than 2 October.

The comparator rejects renamed routes, altered query filters, overlapping
windows and captures taken before Search Console's three-day lag allowance.
