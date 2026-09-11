import Link from "next/link";

export function GoodLegsEditorialCTA({ source }: { source: string }) {
  return (
    <aside className="my-12 rounded-2xl border border-coral/30 bg-deep-purple p-6 md:p-8" aria-label="Good Legs by Roadman">
      <p className="font-heading text-xs tracking-widest text-coral">GOOD LEGS BY ROADMAN</p>
      <h2 className="mt-3 font-heading text-3xl leading-tight text-off-white">Give strength a place in your riding week.</h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-foreground-muted">
        We’re building Good Legs to plan strength around your rides, record your lifts and help you adjust when recovery calls for less.
      </p>
      <Link href={`/app?source=${source}`} data-track={`good_legs_preview_${source}`} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-coral px-5 py-3 font-heading text-off-white">
        SEE GOOD LEGS & JOIN THE WAITLIST →
      </Link>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">In development for iPhone. The beta waitlist is open; a public launch date has not been announced.</p>
    </aside>
  );
}
