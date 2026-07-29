# Roadman Recommends operations guide

Roadman Recommends is an editorial affiliate library, not a conventional shop. Roadman does not take payment, hold stock or fulfil orders. Riders choose a retailer and leave through a tracked Roadman redirect; sales appear only after an affiliate network reports them.

## One-time launch setup

1. Apply `drizzle/0052_roadman_recommends.sql`, `0053_recommends_partner_catalog.sql` and `0054_recommends_collections_settings.sql` to the production database using the normal Roadman migration process.
2. Confirm `/admin/recommends` loads without the database setup notice.
3. Add the first real recommendation and at least one active retailer offer.
4. Publish it and check the public product page in every relevant region.
5. Click each retailer button and confirm it reaches the correct product page, including the affiliate parameters supplied by the network.
6. Import a small network report in `/admin/recommends/conversions` and confirm the transaction appears once.

The migrations include eight categories, two clearly labelled draft examples,
three starter collections and the approved launch catalogue for Hexis, MAAP,
Competitive Cyclist, Zwift and Muc-Off. Drafts are never public. Replace or
archive the examples when they are no longer useful to editors.

## Publishing a recommendation

Open **Admin → Recommends → Products → New recommendation**.

- Use a stable, readable slug. Changing a published slug changes its public URL.
- Write a decisive verdict, then explain why Roadman recommends it, who it suits and who should skip it.
- Select the evidence label that can be supported: personally used, team tested, research based, community favourite or editorial.
- Add real strengths and limitations. Avoid absolute claims such as “puncture-proof” or “guaranteed”.
- Upload an owned or licensed image and write useful alternative text. Remote image URLs are supported, but an uploaded asset is more reliable.
- Add specifications only when they help a rider decide.
- Add one or more retailer offers with the complete affiliate destination URL.
- Set the regions where each retailer can actually sell and deliver.
- Save as draft, preview the public structure, then publish or schedule.

Status behaviour:

- **Draft:** visible only in admin.
- **Scheduled:** becomes public automatically at the scheduled time.
- **Published:** public immediately.
- **Archived:** removed from the public library without deleting historical click or conversion data.

Duplicated products always return to draft and their copied retailer offers are inactive.

The team can also use **Admin → Recommends → Imports & exports** to download the
current catalogue, edit products or offers in bulk, and re-import them. Product
rows are matched by slug. Repeat a slug on several rows to attach several
regional retailer offers.

## Retailer links and regions

Every public retailer button uses `/go/recommends/{offerId}`. This route:

- accepts only active offers on public products;
- records the product, retailer offer, region, device, placement, campaign and referrer;
- flags common bots so they can be excluded from reporting;
- adds a unique `subId3` click ID to approved Impact (`sjv.io` and `g39l.net`)
  links so a network export can reconcile a sale to the Roadman click;
- creates a 90-day anonymous Recommends session only when the rider has granted
  analytics consent;
- redirects with a temporary, non-cacheable response;
- refuses malformed destinations and continues the shopper journey if tracking storage briefly fails.

The destination saved in admin must already contain the affiliate network’s required publisher, campaign or deep-link parameters. Roadman does not invent or alter network parameters.

Use price labels such as “€49.99” only when they are being maintained. If price freshness cannot be guaranteed, prefer wording such as “Check current price”. Review the **Link health** screen at least monthly and after any merchant or affiliate-network change.

## Tracking definitions

- **Outbound click:** a non-bot request through the Roadman redirect.
- **Reported sale:** a pending, approved or paid transaction imported from an affiliate network.
- **Conversion rate:** reported sales divided by non-bot outbound clicks for the selected reporting window.
- **Sales value:** order value reported by the network.
- **Commission:** commission reported by the network. Pending commission is not guaranteed income.
- **Unmatched conversion:** a network transaction with no recognised `product_slug`, `offer_id` or matched click.

First-party clicks and network sales are separate facts. Do not describe a click as a sale.

## Conversion imports

Export a CSV from the affiliate network and upload it at **Admin → Recommends → Conversions**. Imports are idempotent using `network + transaction_id`; uploading an updated report changes the existing transaction instead of duplicating it.

Required columns:

- `network`
- `transaction_id`
- `transaction_at`

Optional columns:

- `retailer`
- `product_slug`
- `offer_id`
- `click_id`
- `sale_amount`
- `commission_amount`
- `currency`
- `status`

Allowed statuses are `pending`, `approved`, `rejected`, `cancelled`, `returned` and `paid`. Dates should use ISO 8601. See `docs/roadman-recommends-conversion-template.csv`.

Impact links now receive the Roadman click ID in `subId3`. Include the matching
Impact sub-ID column as `click_id` when preparing the conversion CSV. Other
networks are left untouched until their supported sub-ID parameter and signing
rules have been confirmed.

## Analytics and review rhythm

The analytics screen shows the last 30 days by:

- day;
- product and category;
- retailer;
- country or region;
- device;
- campaign.

Recommended rhythm:

- Weekly: review clicks, demand and any unmatched transactions.
- Monthly: validate active destinations, prices and regional availability.
- Quarterly: re-read every published verdict, strengths, limitations and evidence label.
- Immediately: archive an unsafe, recalled, discontinued or materially changed product.

## Affiliate disclosure

The public library and product pages state that Roadman may earn a commission at
no extra cost to the rider and that recommendations are editorially independent.
Administrators can edit this text in **Admin → Recommends → Settings**. Keep it
visible and check disclosure and privacy requirements with Roadman’s legal
adviser when adding a new market or affiliate programme.

## Catalogue controls

- **Products:** editorial content, evidence, imagery, publishing and regional
  offers.
- **Categories:** public information architecture and browse order.
- **Collections:** manual edits, Roadman Picks and Best Value groupings.
- **Brands:** names, websites and logo references.
- **Affiliate offers:** all programmes, regions, prices and last-check dates in
  one view.
- **Link health:** offers that are unchecked, stale or returning errors.
- **Settings:** disclosure, default shopping region and stale-offer cadence.

No additional environment variables are required for the launch catalogue.
Product image uploads continue to use the site’s existing Vercel Blob
configuration.

## Future network automation

CSV import is ready now. A network API or server-to-server postback can later write into the same `affiliate_conversions` model. Each adapter must:

- verify the network signature or credentials;
- preserve the external transaction ID;
- map network statuses into the supported Roadman statuses;
- store the raw payload for audit;
- upsert rather than append duplicates;
- never mark a transaction approved before the network does.
