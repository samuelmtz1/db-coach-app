import type { ReactNode } from 'react'
import {
  FIELD_WIDTH,
  HASH_FROM_SIDELINE,
  LOS_YARD_LINE,
  NUMBERS_FROM_SIDELINE,
  VIEW_BOTTOM,
  VIEW_TOP,
} from '../../engine/geometry'
import { FIELD_COLORS } from '../../data/theme'

const MARGIN = 1.5

/** Convierte y del motor (positivo = hacia la defensa) a y de SVG (positivo = abajo). */
export const sy = (y: number) => -y

function yardNumber(y: number): number {
  const abs = LOS_YARD_LINE + y
  return abs > 50 ? 100 - abs : abs
}

interface Props {
  children: ReactNode
  label: string
}

/** Campo vertical estilo transmisión: ofensiva abajo, defensa arriba. */
export function Field({ children, label }: Props) {
  const height = VIEW_TOP - VIEW_BOTTOM
  const stripes: number[] = []
  for (let y = VIEW_BOTTOM - ((VIEW_BOTTOM % 5) + 5) % 5; y < VIEW_TOP; y += 5) stripes.push(y)
  const ticks: number[] = []
  for (let y = Math.ceil(VIEW_BOTTOM); y <= VIEW_TOP; y++) if ((LOS_YARD_LINE + y) % 5 !== 0) ticks.push(y)
  const lines = stripes.filter((y) => y > VIEW_BOTTOM)
  const numbers = lines.filter((y) => (LOS_YARD_LINE + y) % 10 === 0)

  return (
    <svg
      viewBox={`${-MARGIN} ${-VIEW_TOP} ${FIELD_WIDTH + MARGIN * 2} ${height}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full select-none"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <defs>
        <clipPath id="field-clip">
          <rect x={0} y={-VIEW_TOP} width={FIELD_WIDTH} height={height} />
        </clipPath>
        {(['white', 'rush', 'blitz'] as const).map((id) => (
          <marker
            key={id}
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path
              d="M0 0 L10 5 L0 10 z"
              fill={id === 'white' ? '#ffffff' : id === 'rush' ? '#c9d1d9' : '#ff8a00'}
            />
          </marker>
        ))}
      </defs>

      <rect x={-MARGIN} y={-VIEW_TOP} width={FIELD_WIDTH + MARGIN * 2} height={height} fill={FIELD_COLORS.outOfBounds} />
      {stripes.map((y, i) => (
        <rect
          key={y}
          x={0}
          y={sy(y + 5)}
          width={FIELD_WIDTH}
          height={5}
          fill={i % 2 ? FIELD_COLORS.grassA : FIELD_COLORS.grassB}
          clipPath="url(#field-clip)"
        />
      ))}

      <g stroke={FIELD_COLORS.lines} strokeOpacity={0.85}>
        <line x1={0} x2={0} y1={-VIEW_TOP} y2={-VIEW_BOTTOM} strokeWidth={0.35} />
        <line x1={FIELD_WIDTH} x2={FIELD_WIDTH} y1={-VIEW_TOP} y2={-VIEW_BOTTOM} strokeWidth={0.35} />
        {lines.map((y) => (
          <line key={y} x1={0} x2={FIELD_WIDTH} y1={sy(y)} y2={sy(y)} strokeWidth={0.15} />
        ))}
        {ticks.map((y) => (
          <g key={y} strokeWidth={0.12}>
            <line x1={0.2} x2={0.9} y1={sy(y)} y2={sy(y)} />
            <line x1={FIELD_WIDTH - 0.9} x2={FIELD_WIDTH - 0.2} y1={sy(y)} y2={sy(y)} />
            <line x1={HASH_FROM_SIDELINE - 0.35} x2={HASH_FROM_SIDELINE + 0.35} y1={sy(y)} y2={sy(y)} />
            <line
              x1={FIELD_WIDTH - HASH_FROM_SIDELINE - 0.35}
              x2={FIELD_WIDTH - HASH_FROM_SIDELINE + 0.35}
              y1={sy(y)}
              y2={sy(y)}
            />
          </g>
        ))}
      </g>

      <g fill={FIELD_COLORS.lines} fillOpacity={0.75} fontSize={2.2} fontWeight={700} textAnchor="middle" dominantBaseline="central">
        {numbers.map((y) => (
          <g key={y}>
            <text transform={`translate(${NUMBERS_FROM_SIDELINE} ${sy(y)}) rotate(90)`}>{yardNumber(y)}</text>
            <text transform={`translate(${FIELD_WIDTH - NUMBERS_FROM_SIDELINE} ${sy(y)}) rotate(-90)`}>
              {yardNumber(y)}
            </text>
          </g>
        ))}
      </g>

      <line x1={0} x2={FIELD_WIDTH} y1={0} y2={0} stroke={FIELD_COLORS.los} strokeWidth={0.22} />

      {children}
    </svg>
  )
}
