# Roadman Recommends product-review rich results — 31 August 2026

## Search Console baseline

Google Search Console reported **52 invalid Product snippet items** on 31 August 2026. The single critical issue was:

> Either `offers`, `review`, or `aggregateRating` should be specified.

The report was last updated on 30 August 2026 and first detected the issue on 23 April 2026. Current examples are Roadman Recommends product pages such as the Garmin Edge 1050, Wahoo KICKR CORE 2, MAAP Team Bib Evo and Muc-Off product recommendations.

## Diagnosis

Each affected page emitted a `Product` object containing its name, description, image, category and brand, but omitted the editorial review already visible on the page. Numeric prices cannot be marked up safely because the catalogue stores region-specific retailer labels rather than one guaranteed machine-readable price. Roadman also does not publish a numeric star score, so an aggregate rating would be fabricated.

## Release decision

Keep the existing Product object and add one nested editorial `Review` that mirrors visible content:

- Anthony Walsh as the named review author;
- the visible Roadman verdict and short description as `reviewBody`;
- the visible strengths as `positiveNotes`;
- the visible limitations as `negativeNotes`;
- the catalogue's last-reviewed date as `datePublished`.

This follows Google's documented editorial product-review pattern without inventing a rating, price, availability or review count. Empty strengths or limitations are omitted rather than represented as false claims.

## Verification contract

1. Unit-test the Product and Review graph, including the no-fake-rating rule.
2. Pass TypeScript, lint and the production build.
3. Verify a representative live recommendation page contains `Product.review`, `positiveNotes` and `negativeNotes` that match visible copy.
4. Start Search Console validation only after production verification.
5. Recheck the Product snippets report after Google's recrawl; validation can take days and is not a same-day ranking claim.
