import Link from "next/link";
import Image from "next/image";
import { Container } from "./Container";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

const footerColumns = {
  podcast: {
    title: "Podcast",
    links: [
      { label: "Episode Archive", href: "/podcast" },
      { label: "Guests", href: "/guests" },
      { label: "Topic Hubs", href: "/topics" },
      {
        label: "Apple Podcasts",
        href: "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
        external: true,
      },
      {
        label: "Spotify",
        href: "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
        external: true,
      },
    ],
  },
  learn: {
    title: "Learn",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Topic Hubs", href: "/topics" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "All Tools", href: "/tools" },
    ],
  },
  community: {
    title: "Community",
    links: [
      { label: "Clubhouse (Free)", href: "/community/clubhouse" },
      { label: "Not Done Yet Coaching", href: "/community/not-done-yet" },
      { label: "Strength Training", href: "/strength-training" },
      { label: "Events", href: "/events" },
    ],
  },
  about: {
    title: "About",
    links: [
      { label: "About Roadman", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

const socialLinks = [
  {
    label: "YouTube",
    href: "https://youtube.com/@theroadmanpodcast",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/roadman.cycling",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M5.34 0A5.328 5.328 0 0 0 0 5.34v13.32A5.328 5.328 0 0 0 5.34 24h13.32A5.328 5.328 0 0 0 24 18.66V5.34A5.328 5.328 0 0 0 18.66 0zm6.525 2.568c4.988 0 7.399 3.376 7.399 6.852 0 1.963-.966 4.39-2.088 5.455-.399.377-.762.321-1.074.074-.397-.315-.504-.847-.165-1.35.636-.946 1.095-2.204 1.095-3.675 0-2.633-1.834-4.86-5.167-4.86-3.333 0-5.379 2.227-5.379 4.86 0 1.471.497 2.729 1.133 3.675.339.504.192 1.035-.203 1.35-.312.247-.675.303-1.074-.074-1.16-1.066-2.126-3.492-2.126-5.455 0-3.476 2.661-6.852 7.649-6.852zm-.099 4.093c2.015 0 3.612 1.632 3.612 3.612a3.61 3.61 0 0 1-1.408 2.858c.286.567.67 1.638.859 2.804.246 1.555.062 3.024-.66 3.687-.39.358-.832.431-1.225.288a1.394 1.394 0 0 1-.899-.94c-.222-.739-.489-2.277-.489-2.277-.103-.619-.51-.855-.79-.855-.281 0-.688.236-.791.855 0 0-.267 1.538-.489 2.277a1.394 1.394 0 0 1-.898.94c-.394.143-.836.07-1.225-.288-.722-.663-.907-2.132-.661-3.687.19-1.166.573-2.237.859-2.804A3.61 3.61 0 0 1 8.154 10.273c0-1.98 1.597-3.612 3.612-3.612z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer aria-label="Site footer" className="relative bg-deep-purple grain-overlay overflow-hidden">
      {/* Gradient divider line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-coral/40 to-transparent" />

      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative pt-[var(--spacing-section)] pb-8">
        <Container>
          {/* Top: Logo + Tagline + Newsletter */}
          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16 pb-16 border-b border-white/10">
            <div className="max-w-md">
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/images/logo-white.png"
                  alt="Roadman Cycling"
                  width={200}
                  height={71}
                  className="h-10 sm:h-12 w-auto"
                />
              </Link>
              <p className="text-foreground-muted leading-relaxed mb-2">
                The world&apos;s largest cycling performance podcast. Translating
                conversations with Greg LeMond, Professor Seiler, Dan Lorang, and
                1,400+ episodes of world-class expertise into content that makes you
                faster.
              </p>
              <p className="text-sm text-foreground-subtle italic">
                Built for cyclists who are &apos;not done yet&apos;.
              </p>
            </div>
            <div className="max-w-sm w-full">
              <h3 className="font-heading text-2xl text-off-white mb-3 tracking-wider">
                THE SATURDAY SPIN NEWSLETTER
              </h3>
              <p className="text-foreground-muted text-sm mb-4">
                Every Saturday. The week&apos;s sharpest cycling insights — straight
                from the podcast.
              </p>
              <EmailCapture
                variant="minimal"
                source="footer"
                buttonText="SUBSCRIBE"
              />
            </div>
          </div>

          {/* Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
            {Object.values(footerColumns).map((section) => (
              <div key={section.title}>
                <h4 className="font-heading text-lg text-off-white mb-4 tracking-wider">
                  {section.title.toUpperCase()}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => {
                    const isExternal = "external" in link && link.external;
                    return (
                      <li key={link.href}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-foreground-muted hover:text-coral transition-colors inline-flex items-center gap-1"
                            style={{
                              transitionDuration: "var(--duration-fast)",
                            }}
                          >
                            {link.label}
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="w-3 h-3 opacity-40"
                              aria-hidden="true"
                            >
                              <path d="M3.5 3.5h5v5M8.5 3.5L3 9" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-foreground-muted hover:text-coral transition-colors"
                            style={{
                              transitionDuration: "var(--duration-fast)",
                            }}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b border-white/10">
            <p className="text-sm text-foreground-subtle uppercase tracking-widest font-heading">
              Follow Roadman
            </p>
            <div className="flex items-center gap-5">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-coral transition-all hover:scale-110"
                  style={{ transitionDuration: "var(--duration-fast)" }}
                  aria-label={link.label}
                >
                  {link.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground-subtle">
            <p>
              &copy; {new Date().getFullYear()} Roadman Cycling. All rights
              reserved.
            </p>
            <p className="italic">
              Built for cyclists who are &apos;not done yet&apos;.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
