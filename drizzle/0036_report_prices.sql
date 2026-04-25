-- Standardise paid report pricing to USD amounts.
-- Individual reports: $29 each (was $24 plateau, $14 fuelling/FTP).
-- Bundle: $69 (was $49; saves ~$18 vs buying all three separately).
UPDATE "report_products" SET price_cents = 2900 WHERE slug IN ('report_plateau', 'report_fuelling', 'report_ftp');
UPDATE "report_products" SET price_cents = 6900 WHERE slug = 'bundle_performance';
