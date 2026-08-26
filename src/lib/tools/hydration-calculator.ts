export interface SweatRateInputs {
  preWeightKg: number;
  postWeightKg: number;
  fluidMl: number;
  urineMl: number;
  durationMinutes: number;
}

/**
 * Field estimate following the cycling consensus fluid-balance equation.
 * This measures loss during one observation; it does not prescribe intake.
 */
export function calculateSweatMetrics({
  preWeightKg,
  postWeightKg,
  fluidMl,
  urineMl,
  durationMinutes,
}: SweatRateInputs) {
  const durationHours = durationMinutes / 60;
  const massChangeKg = preWeightKg - postWeightKg;
  const sweatLossLitres = massChangeKg + fluidMl / 1000 - urineMl / 1000;
  const sweatRateLitresPerHour = sweatLossLitres / durationHours;
  const netBodyMassChangePercent = (massChangeKg / preWeightKg) * 100;

  return {
    durationHours,
    massChangeKg,
    sweatLossLitres,
    sweatRateLitresPerHour,
    netBodyMassChangePercent,
  };
}
