import Image from "next/image";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/features/consent/CookieSettingsButton";
import { Container } from "./Container";

const COMPACT_LINKS = [
  { label: "Methodology", href: "/methodology" },
  { label: "Podcast", href: "/podcast" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Coaching",
    links: [
      { label: "Start application", href: "/apply" },
      { label: "Coaching overview", href: "/coaching" },
      { label: "Not Done Yet", href: "/community/not-done-yet" },
      { label: "Rider results", href: "/proof" },
      { label: "The methodology", href: "/methodology" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Start here", href: "/start-here" },
      { label: "Cycling blog", href: "/blog" },
      { label: "Cycling training plans", href: "/training-plans" },
      { label: "Event plan finder", href: "/plan" },
      { label: "Topic hubs", href: "/topics" },
      { label: "Masters cycling", href: "/masters" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Roadman Podcast", href: "/podcast" },
      { label: "Free cycling tools", href: "/tools" },
      { label: "Training camps", href: "/training-camps" },
      { label: "Saturday Spin", href: "/newsletter" },
      { label: "Free Clubhouse", href: "/community/clubhouse" },
    ],
  },
  {
    title: "Roadman",
    links: [
      { label: "About Roadman", href: "/about" },
      { label: "Research & evidence", href: "/research" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & cookies", href: "/cookies" },
    ],
  },
] as const;

export function CoachingFooter({ expanded = false }: { expanded?: boolean }) {
  return (
    <footer
      aria-label="Site footer"
      data-sticky-apply-stop
      className="relative overflow-hidden border-t border-white/10 bg-deep-purple"
    >
      <Container width="coaching">
        <div
          className={
            expanded
              ? "grid gap-12 py-14 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.55fr)] lg:gap-16 lg:py-20"
              : "flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:py-14"
          }
        >
          <div className={expanded ? "max-w-md" : undefined}>
            <Link href="/" prefetch={false} className="mb-4 inline-block">
              <Image
                src="/images/logo-white.png"
                alt="Roadman Cycling"
                width={763}
                height={345}
                sizes="160px"
                className="h-10 w-auto max-w-none"
              />
            </Link>
            <p className="font-heading text-2xl tracking-wide text-off-white">
              STOP PLATEAUING.{" "}
              <span className="text-coral">START PROGRESSING.</span>
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground-muted">
              Personalised cycling coaching for serious amateur and masters
              riders who know they are not done yet.
            </p>
            {expanded ? (
              <Link
                href="/apply"
                prefetch={false}
                data-track="home_footer_apply"
                className="group mt-6 inline-flex min-h-11 items-center gap-2 border-b border-coral/50 font-heading text-sm tracking-wide text-coral transition-colors hover:border-coral hover:text-off-white focus-visible:border-coral focus-visible:text-off-white"
              >
                START YOUR APPLICATION
                <span
                  className="transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>
            ) : null}
          </div>

          {expanded ? (
            <nav
              aria-label="Explore Roadman"
              className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
            >
              {FOOTER_COLUMNS.map((column) => (
                <section key={column.title}>
                  <h2 className="font-heading text-sm tracking-[0.14em] text-off-white">
                    {column.title.toUpperCase()}
                  </h2>
                  <ul className="mt-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          className="inline-flex min-h-11 items-center text-sm leading-snug text-foreground-muted transition-colors hover:text-coral focus-visible:text-coral"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          ) : (
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
                {COMPACT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center text-sm text-foreground-muted transition-colors hover:text-coral focus-visible:text-coral"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-foreground-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Roadman Cycling · Dublin, Ireland
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <CookieSettingsButton className="transition-colors hover:text-coral" />
            <a
              href="mailto:anthony@roadmancycling.com"
              className="transition-colors hover:text-coral"
            >
              anthony@roadmancycling.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
