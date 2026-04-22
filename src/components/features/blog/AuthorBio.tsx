import Image from "next/image";
import Link from "next/link";

/**
 * Author bio card rendered at the bottom of every blog post. E-E-A-T
 * signal that tells Google (and AI citation agents) who wrote this and
 * what their authority is. Every blog page ends up surfacing a Person
 * link to /about and verified `sameAs` social URLs — compounding the
 * site's entity consolidation for the Anthony Walsh Person entity.
 *
 * Kept deliberately simple: one author (Anthony) because every article
 * in the catalogue has his byline. If we add guest authors later, this
 * becomes a lookup component keyed on post.author.
 */
export function AuthorBio() {
  return (
    <aside
      className="mt-16 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
      aria-label="About the author"
    >
      <p className="text-xs text-coral font-heading tracking-widest mb-4">
        ABOUT THE AUTHOR
      </p>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border border-white/10">
          <Image
            src="/images/about/anthony-profile-closeup.jpg"
            alt="Anthony Walsh — founder, Roadman Cycling"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="flex-1">
          <p className="font-heading text-lg text-off-white mb-1 tracking-wide">
            ANTHONY WALSH
          </p>
          <p className="text-sm text-foreground-subtle mb-3">
            Cycling coach & founder of Roadman Cycling
          </p>
          <p className="text-sm text-foreground-muted leading-relaxed mb-4">
            Host of the Roadman Cycling Podcast, with over 1,300 on-the-record
            conversations with World Tour coaches, sports scientists, and pro
            riders — including Prof. Stephen Seiler, Dan Lorang, Greg LeMond
            and Joe Friel. Based in Dublin, Ireland. Coaches cyclists and
            triathletes across Ireland, the UK and the US through the{" "}
            <Link
              href="/coaching"
              className="text-coral hover:text-coral/80 transition-colors"
            >
              Not Done Yet coaching community
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-heading tracking-wider">
            <Link
              href="/about"
              className="text-foreground-muted hover:text-coral transition-colors"
            >
              ABOUT →
            </Link>
            <a
              href="https://x.com/Roadman_Podcast"
              target="_blank"
              rel="noopener noreferrer me"
              className="text-foreground-muted hover:text-coral transition-colors"
            >
              X / TWITTER
            </a>
            <a
              href="https://instagram.com/roadman.cycling"
              target="_blank"
              rel="noopener noreferrer me"
              className="text-foreground-muted hover:text-coral transition-colors"
            >
              INSTAGRAM
            </a>
            <a
              href="https://youtube.com/@theroadmanpodcast"
              target="_blank"
              rel="noopener noreferrer me"
              className="text-foreground-muted hover:text-coral transition-colors"
            >
              YOUTUBE
            </a>
            <a
              href="https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC"
              target="_blank"
              rel="noopener noreferrer me"
              className="text-foreground-muted hover:text-coral transition-colors"
            >
              SPOTIFY
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
