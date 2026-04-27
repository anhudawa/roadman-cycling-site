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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      {POSITIONS.map((p) => {
        const selected = p.value === value;
        return (
          <button
            type="button"
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`group relative rounded-lg border px-3 py-3 min-h-[88px] text-left transition-all ${
              selected
                ? "border-coral bg-coral/10 shadow-[0_0_0_1px_rgba(241,99,99,0.4),0_4px_24px_-8px_rgba(241,99,99,0.4)]"
                : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
            aria-pressed={selected}
          >
            <p
              className={`font-heading text-base uppercase tracking-wide ${
                selected ? "text-coral" : "text-off-white"
              }`}
            >
              {p.label}
            </p>
            <p className="mt-1 text-xs leading-snug text-foreground-muted">
              {p.desc}
            </p>
            <p
              className="text-[0.62rem] mt-2 text-foreground-subtle"
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
