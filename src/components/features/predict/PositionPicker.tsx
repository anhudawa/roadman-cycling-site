type Position =
  | "tt_bars"
  | "aero_drops"
  | "aero_hoods"
  | "endurance_hoods"
  | "standard_hoods"
  | "climbing";

interface PositionPickerProps {
  value: Position;
  onChange: (p: Position) => void;
}

const POSITIONS: {
  value: Position;
  label: string;
  cda: string;
  desc: string;
}[] = [
  { value: "tt_bars", label: "TT bars", cda: "0.21 m²", desc: "Time-trial extensions" },
  { value: "aero_drops", label: "Aero drops", cda: "0.27 m²", desc: "Aero bike, drops" },
  { value: "aero_hoods", label: "Aero hoods", cda: "0.30 m²", desc: "Aero bike, hoods" },
  { value: "endurance_hoods", label: "Endurance", cda: "0.32 m²", desc: "Endurance, hoods" },
  { value: "standard_hoods", label: "Standard", cda: "0.34 m²", desc: "Standard, hoods" },
  { value: "climbing", label: "Climbing", cda: "0.38 m²", desc: "Tops, climbing" },
];

export function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {POSITIONS.map((p) => {
        const selected = p.value === value;
        return (
          <button
            type="button"
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`group relative rounded-lg border px-3 py-3 text-left transition-all ${
              selected
                ? "border-coral bg-coral/10 shadow-[0_0_0_1px_rgba(241,99,99,0.4),0_4px_24px_-8px_rgba(241,99,99,0.4)]"
                : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
            aria-pressed={selected}
          >
            <PositionGlyph position={p.value} active={selected} />
            <p
              className={`mt-2 font-heading text-sm uppercase tracking-wide ${
                selected ? "text-coral" : "text-off-white"
              }`}
            >
              {p.label}
            </p>
            <p
              className="text-[0.62rem] mt-0.5 text-foreground-subtle"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              CdA {p.cda}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function PositionGlyph({
  position,
  active,
}: {
  position: Position;
  active: boolean;
}) {
  const stroke = active ? "#F16363" : "rgba(250,250,250,0.7)";
  // Stylised side-view of rider in each position. 40x20 viewbox.
  const paths: Record<Position, React.ReactElement> = {
    tt_bars: (
      <>
        <path d="M2 18 L20 11 L26 6 L34 6" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="34" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
    aero_drops: (
      <>
        <path d="M2 18 L18 12 L24 8 L32 9" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="32" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
    aero_hoods: (
      <>
        <path d="M2 18 L18 12 L24 9 L30 7" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="30" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
    endurance_hoods: (
      <>
        <path d="M2 18 L16 12 L22 8 L28 5" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="28" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
    standard_hoods: (
      <>
        <path d="M2 18 L16 11 L22 6 L28 4" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="28" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
    climbing: (
      <>
        <path d="M2 18 L14 10 L20 4 L26 2" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
        <circle cx="26" cy="18" r="3" stroke={stroke} strokeWidth={1.4} fill="none" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 40 22" width="100%" height="32" aria-hidden="true">
      {paths[position]}
    </svg>
  );
}
