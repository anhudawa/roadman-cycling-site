"use client";

/**
 * Results-page PDF download. Plain anchor pointed at the route — the
 * server sets `Content-Disposition: attachment` so the browser handles
 * the rest. Kept as a client component only so we can tag a quick
 * analytics signal (data-cta) without bouncing through a form action.
 */
export function DownloadPdfButton({
  slug,
  profile,
}: {
  slug: string;
  profile: string;
}) {
  return (
    <a
      href={`/api/diagnostic/${slug}/pdf`}
      data-cta="pdf-download"
      data-profile={profile}
      className="inline-flex items-center gap-2 rounded-md border border-coral/40 bg-coral/10 text-coral hover:bg-coral hover:text-off-white px-4 py-2 text-sm font-heading tracking-widest uppercase transition-colors cursor-pointer"
    >
      <span aria-hidden="true">↓</span> Download PDF
    </a>
  );
}
