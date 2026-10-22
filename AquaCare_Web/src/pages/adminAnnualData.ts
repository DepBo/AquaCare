export type AnnualDashboardData = {
  year: number
  availableYears: number[]
  basis: string
  months: { month: number; revenue: number | null; growthPercent: number | null; movingAverage: number | null }[]
  byVersion: { month: number; versions: Record<'V1' | 'V2' | 'V3' | 'V4', number> }[]
  highlights: {
    peakMonthlyRevenue: number
    peakMonth: number | null
    maxGrowthPercent: number | null
    maxDeclinePercent: number | null
  }
}
