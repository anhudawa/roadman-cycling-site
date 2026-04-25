/**
 * Chi-squared test for A/B experiment significance.
 * No external dependencies — uses the chi-squared formula directly.
 */

export interface ChiSquaredResult {
  significant: boolean;
  confidence: number;
  pValue: number;
}

/**
 * Perform a chi-squared test of independence between control and variant.
 */
export function calculateChiSquared(
  controlImpressions: number,
  controlConversions: number,
  variantImpressions: number,
  variantConversions: number
): ChiSquaredResult {
  const totalImpressions = controlImpressions + variantImpressions;
  const totalConversions = controlConversions + variantConversions;
  const totalNonConversions = totalImpressions - totalConversions;

  // Avoid division by zero
  if (
    totalImpressions === 0 ||
    totalConversions === 0 ||
    totalNonConversions === 0
  ) {
    return { significant: false, confidence: 0, pValue: 1 };
  }

  // Expected values under H0 (no difference)
  const e_cc = (controlImpressions * totalConversions) / totalImpressions; // control conversions expected
  const e_cn =
    (controlImpressions * totalNonConversions) / totalImpressions; // control non-conversions expected
  const e_vc = (variantImpressions * totalConversions) / totalImpressions; // variant conversions expected
  const e_vn =
    (variantImpressions * totalNonConversions) / totalImpressions; // variant non-conversions expected

  const controlNonConversions = controlImpressions - controlConversions;
  const variantNonConversions = variantImpressions - variantConversions;

  // Chi-squared statistic (1 degree of freedom)
  const chiSq =
    Math.pow(controlConversions - e_cc, 2) / e_cc +
    Math.pow(controlNonConversions - e_cn, 2) / e_cn +
    Math.pow(variantConversions - e_vc, 2) / e_vc +
    Math.pow(variantNonConversions - e_vn, 2) / e_vn;

  // Approximate p-value from chi-squared distribution with 1 DOF
  // Using the survival function approximation
  const pValue = chiSquaredSurvival(chiSq, 1);
  const confidence = (1 - pValue) * 100;
  const significant = pValue < 0.05;

  return { significant, confidence, pValue };
}

/**
 * Estimate the minimum sample size per variant for a given test.
 *
 * @param baselineRate - current conversion rate (e.g. 0.05 for 5%)
 * @param mde - minimum detectable effect as relative change (e.g. 0.2 for 20% lift)
 * @param power - statistical power (default 0.8)
 * @param significance - significance level (default 0.05)
 */
export function estimateSampleSize(
  baselineRate: number,
  mde: number,
  power = 0.8,
  significance = 0.05
): number {
  // Using the standard formula: n = (Z_alpha/2 + Z_beta)^2 * (p1(1-p1) + p2(1-p2)) / (p1 - p2)^2
  const zAlpha = normalQuantile(1 - significance / 2);
  const zBeta = normalQuantile(power);

  const p1 = baselineRate;
  const p2 = baselineRate * (1 + mde);
  const delta = Math.abs(p2 - p1);

  if (delta === 0) return Infinity;

  const n =
    Math.pow(zAlpha + zBeta, 2) *
    (p1 * (1 - p1) + p2 * (1 - p2)) /
    Math.pow(delta, 2);

  return Math.ceil(n);
}

// ── Internal math helpers ────────────────────────────────

/**
 * Survival function (1 - CDF) of the chi-squared distribution.
 * Uses the regularized incomplete gamma function for 1 DOF.
 */
function chiSquaredSurvival(x: number, _dof: number): number {
  // For 1 DOF: P(X > x) = 2 * (1 - Phi(sqrt(x)))
  // where Phi is the standard normal CDF
  if (x <= 0) return 1;
  return 2 * (1 - normalCDF(Math.sqrt(x)));
}

/**
 * Standard normal CDF approximation (Abramowitz and Stegun).
 */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX / 2);

  return 0.5 * (1 + sign * y);
}

/**
 * Inverse normal (quantile) function approximation.
 * Rational approximation by Peter Acklam.
 */
function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  // Coefficients for rational approximation
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}
