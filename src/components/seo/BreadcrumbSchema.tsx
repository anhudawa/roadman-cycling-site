/**
 * @deprecated Consolidated into `BreadcrumbJsonLd` in `./JsonLd`.
 * This file is kept only as a re-export to avoid stale imports.
 *
 * Note: `BreadcrumbJsonLd` does NOT auto-prepend Home — callers must
 * include it in the items array if needed. This differs from the
 * original `BreadcrumbSchema` which prepended Home automatically.
 */
export { BreadcrumbJsonLd as BreadcrumbSchema } from "./JsonLd";
