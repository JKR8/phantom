/**
 * Seasonality multipliers per scenario.
 * Based on research data for realistic monthly/weekday patterns.
 * Index 0 = January, Index 11 = December.
 */

export const MONTHLY_MULTIPLIERS: Record<string, number[]> = {
  Retail: [0.82, 0.87, 0.97, 0.97, 1.02, 1.02, 0.97, 1.02, 1.02, 1.02, 1.15, 1.30],
  Ecommerce: [0.88, 0.92, 0.97, 0.97, 0.97, 0.92, 0.87, 0.92, 0.97, 1.02, 1.13, 1.12],
  SaaS_B2B: [0.92, 0.87, 1.02, 1.07, 0.97, 0.92, 0.88, 0.91, 1.04, 1.02, 1.07, 1.11],
  HR: [1.05, 1.02, 1.00, 0.98, 0.97, 0.95, 0.93, 0.95, 1.02, 1.03, 1.04, 1.06],
  Finance: [1.0, 1.0, 1.05, 1.0, 1.0, 1.05, 1.0, 1.0, 1.05, 1.0, 1.0, 1.10],
};

/**
 * Day-of-week multipliers (0 = Sunday, 6 = Saturday).
 * Retail: weekends stronger; B2B: weekdays stronger.
 */
export const WEEKDAY_MULTIPLIERS: Record<string, number[]> = {
  Retail: [1.15, 0.85, 0.90, 0.95, 1.00, 1.05, 1.20],
  SaaS_B2B: [0.30, 1.10, 1.15, 1.15, 1.10, 1.05, 0.35],
  HR: [0.10, 1.10, 1.15, 1.15, 1.10, 1.05, 0.10],
};

/**
 * Get the seasonal multiplier for a given date and scenario.
 */
export function getSeasonalMultiplier(date: Date, scenario: string): number {
  const monthMult = MONTHLY_MULTIPLIERS[scenario]?.[date.getMonth()] ?? 1.0;
  const weekdayMult = WEEKDAY_MULTIPLIERS[scenario]?.[date.getDay()] ?? 1.0;
  return monthMult * weekdayMult;
}

/**
 * Generate an array of dates spread over a given month range,
 * with density weighted by seasonality.
 * Returns ISO date strings.
 */
export function generateSeasonalDates(
  count: number,
  monthsBack: number,
  scenario: string,
  rand: () => number
): string[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  // Build monthly weight table
  const months: { start: Date; end: Date; weight: number }[] = [];
  for (let m = 0; m < monthsBack; m++) {
    const mStart = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const mEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 0);
    const multiplier = MONTHLY_MULTIPLIERS[scenario]?.[mStart.getMonth()] ?? 1.0;
    months.push({ start: mStart, end: mEnd, weight: multiplier });
  }

  const totalWeight = months.reduce((s, m) => s + m.weight, 0);
  const dates: string[] = [];

  for (let i = 0; i < count; i++) {
    // Pick a month weighted by seasonality
    let r = rand() * totalWeight;
    let chosen = months[0];
    for (const m of months) {
      r -= m.weight;
      if (r <= 0) {
        chosen = m;
        break;
      }
    }

    // Pick a random day within the chosen month
    const dayRange = chosen.end.getDate();
    const day = Math.floor(rand() * dayRange) + 1;
    const date = new Date(chosen.start.getFullYear(), chosen.start.getMonth(), day);
    dates.push(date.toISOString());
  }

  return dates;
}
