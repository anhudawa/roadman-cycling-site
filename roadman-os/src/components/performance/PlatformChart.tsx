import type { PlatformMetrics } from '@/lib/queries/performance'

export interface PlatformChartProps {
  data: PlatformMetrics[]
}

/** Colour map for known platforms. Falls back to mid-grey. */
const PLATFORM_COLOURS: Record<string, string> = {
  youtube: '#FF0000',
  spotify: '#1DB954',
  apple_podcasts: '#9933CC',
  instagram: '#E1306C',
  facebook: '#1877F2',
  tiktok: '#00F2EA',
  twitter_x: '#1DA1F2',
  linkedin: '#0A66C2',
  website: '#F16363',
  beehiiv: '#FF6719',
  ga4: '#E37400',
  skool: '#4C1273',
  manual: '#545559',
}

/**
 * SVG bar chart showing views per platform, colour-coded.
 * No external chart libraries — raw SVG only.
 */
export function PlatformChart({ data }: PlatformChartProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-mid-grey text-sm">
        No platform data for this period
      </div>
    )
  }

  const chartWidth = 700
  const chartHeight = 300
  const barPadding = 8
  const labelHeight = 40
  const topPadding = 20
  const leftPadding = 60
  const plotWidth = chartWidth - leftPadding - 20
  const plotHeight = chartHeight - labelHeight - topPadding

  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const barWidth = Math.max(
    (plotWidth - barPadding * (data.length - 1)) / data.length,
    20,
  )

  // Y-axis tick values
  const yTicks = [0, Math.round(maxViews / 4), Math.round(maxViews / 2), Math.round((maxViews * 3) / 4), maxViews]

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }

  function formatLabel(source: string): string {
    return source
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full max-w-[700px]"
        role="img"
        aria-label="Platform comparison bar chart"
      >
        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => {
          const y = topPadding + plotHeight - (tick / maxViews) * plotHeight
          return (
            <g key={`tick-${tick}`}>
              <line
                x1={leftPadding}
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="#545559"
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
              <text
                x={leftPadding - 8}
                y={y + 4}
                textAnchor="end"
                fill="#545559"
                fontSize={10}
                fontFamily="sans-serif"
              >
                {formatNumber(tick)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((platform, i) => {
          const barHeight = (platform.views / maxViews) * plotHeight
          const x = leftPadding + i * (barWidth + barPadding)
          const y = topPadding + plotHeight - barHeight
          const colour = PLATFORM_COLOURS[platform.source] ?? '#545559'

          return (
            <g key={platform.source}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colour}
                rx={3}
              />
              {/* Value label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="#FAFAFA"
                fontSize={10}
                fontFamily="sans-serif"
              >
                {formatNumber(platform.views)}
              </text>
              {/* Platform label below */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                fill="#545559"
                fontSize={9}
                fontFamily="sans-serif"
                transform={`rotate(-30, ${x + barWidth / 2}, ${chartHeight - 8})`}
              >
                {formatLabel(platform.source)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
