export interface SpeciesRanges {
  ph_min: number | null
  ph_max: number | null
  temp_min: number | null
  temp_max: number | null
  tds_min: number | null
  tds_max: number | null
}

export const defaultThresholds = {
  ph: { good: [6.5, 7.5], warn: [6, 8] },
  temp: { good: [24, 28], warn: [22, 30] },
  tds: { good: [150, 300], warn: [100, 400] },
} as const

function bounds(minValue: number | null | undefined, maxValue: number | null | undefined, fallback: { readonly good: readonly number[]; readonly warn: readonly number[] }, lowerMargin: number, upperMargin = lowerMargin) {
  const min = Number(minValue)
  const max = Number(maxValue)
  if (minValue == null || maxValue == null || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) return fallback
  return { good: [min, max], warn: [min - lowerMargin, max + upperMargin] }
}

export function getSpeciesThresholds(species?: SpeciesRanges) {
  return {
    ph: bounds(species?.ph_min, species?.ph_max, defaultThresholds.ph, 0.5),
    temp: bounds(species?.temp_min, species?.temp_max, defaultThresholds.temp, 2),
    tds: bounds(species?.tds_min, species?.tds_max, defaultThresholds.tds, 50, 100),
  }
}
