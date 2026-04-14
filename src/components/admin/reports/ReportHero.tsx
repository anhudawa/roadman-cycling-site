import Image from 'next/image';

interface Props {
  brandName: string;
  logoUrl: string | null;
  monthLabel: string;
}

export function ReportHero({ brandName, logoUrl, monthLabel }: Props) {
  return (
    <section className="flex flex-col items-center gap-6 pt-16 pb-10 text-center">
      {logoUrl && (
        <div className="relative h-24 w-48">
          <Image src={logoUrl} alt={`${brandName} logo`} fill className="object-contain" />
        </div>
      )}
      <h1 className="font-[var(--font-bebas-neue)] text-7xl tracking-wide text-white">
        {brandName}
      </h1>
      <p className="text-lg uppercase tracking-[0.3em] text-white/60">
        Monthly Partnership Report — {monthLabel}
      </p>
      <div className="h-1 w-24 rounded-full bg-[#F16363]" />
    </section>
  );
}
