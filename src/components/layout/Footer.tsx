import Link from "next/link";
import Image from "next/image";
import { Container } from "./Container";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

const footerLinks = {
  content: {
    title: "Content",
    links: [
      { label: "Podcast", href: "/podcast" },
      { label: "Blog", href: "/blog" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  tools: {
    title: "Tools",
    links: [
      { label: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "Race Weight Calculator", href: "/tools/race-weight" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Energy Availability", href: "/tools/energy-availability" },
      { label: "Shock Pressure", href: "/tools/shock-pressure" },
    ],
  },
  community: {
    title: "Community",
    links: [
      { label: "Clubhouse (Free)", href: "/community/clubhouse" },
      { label: "Not Done Yet", href: "/community/not-done-yet" },
      { label: "Strength Training", href: "/strength-training" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

const socialLinks = [
  {
    label: "YouTube",
    href: "https://youtube.com/@theroadmanpodcast",
    icon: "youtube",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/roadman.cycling",
    icon: "instagram",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/roadmancycling",
    icon: "facebook",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/Roadman_Podcast",
    icon: "twitter",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@roadmancyclingpodcast",
    icon: "tiktok",
  },
];

const podcastPlatforms = [
  { label: "Apple Podcasts", href: "#" },
  { label: "Spotify", href: "#" },
  { label: "YouTube", href: "https://youtube.com/@theroadmanpodcast" },
];

export function Footer() {
  return (
    <footer className="bg-deep-purple border-t border-white/5 pt-[var(--spacing-section)] pb-8">
      <Container>
        {/* Newsletter CTA */}
        <div className="mb-16 pb-16 border-b border-white/10">
          <div className="max-w-xl">
            <h3 className="font-heading text-[var(--text-section)] text-off-white mb-4">
              GET THE INSIGHTS
            </h3>
            <p className="text-foreground-muted mb-6">
              No fluff. No filler. Just the stuff that makes you faster, once a
              week.
            </p>
            <EmailCapture
              variant="minimal"
              source="footer"
              buttonText="SUBSCRIBE"
            />
          </div>
        </div>

        {/* Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-heading text-lg text-off-white mb-4 tracking-wider">
                {section.title.toUpperCase()}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-muted hover:text-coral transition-colors"
                      style={{ transitionDuration: "var(--duration-fast)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + Podcast Platforms */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 pb-12 border-b border-white/10">
          <div>
            <p className="text-sm text-foreground-subtle mb-3">
              Follow Roadman
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-coral transition-colors"
                  style={{ transitionDuration: "var(--duration-fast)" }}
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-foreground-subtle mb-3">
              Listen on
            </p>
            <div className="flex gap-4">
              {podcastPlatforms.map((platform) => (
                <a
                  key={platform.label}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-muted hover:text-coral transition-colors text-sm"
                  style={{ transitionDuration: "var(--duration-fast)" }}
                >
                  {platform.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image
              src="/images/logo-white.png"
              alt="Roadman Cycling"
              width={120}
              height={43}
              className="h-8 w-auto"
            />
          </Link>
          <p className="text-xs text-foreground-subtle">
            &copy; {new Date().getFullYear()} Roadman Cycling. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
