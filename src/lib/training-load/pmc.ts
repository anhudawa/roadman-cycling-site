export interface PmcStartingLoad {
  /** Values at the end of the day BEFORE the first daily TSS entry. */
  ctl: number;
  atl: number;
}

/**
 * Daily recurrences published in TrainingPeaks' CTL / ATL help documentation.
 * TSB for a day uses the PREVIOUS day's CTL and ATL. Starting values must
 * describe the day before the entered sequence; never seed from its first ride.
 */
export function calculatePMC(days: readonly number[], starting: PmcStartingLoad) {
  if ([starting.ctl, starting.atl, ...days].some((n) => !Number.isFinite(n) || n < 0)) {
    throw new RangeError("Training load inputs must be finite, non-negative numbers.");
  }
  let { ctl, atl } = starting;
  let tsb = ctl - atl;
  for (const tss of days) {
    tsb = ctl - atl;
    ctl += (tss - ctl) / 42;
    atl += (tss - atl) / 7;
  }
  return { ctl, atl, tsb, nextDayTsb: ctl - atl };
}
