import type { Point, ResolvedZone } from '../../engine/types'
import { ROLE_COLORS, ZONE_COLORS } from '../../data/theme'
import { sy } from './Field'

export function ZoneShape({ zone, highlighted }: { zone: ResolvedZone; highlighted: boolean }) {
  const color = ZONE_COLORS[zone.family]
  return (
    <g className="fade-in" clipPath="url(#field-clip)" aria-hidden="true">
      <ellipse
        cx={zone.center.x}
        cy={sy(zone.center.y)}
        rx={zone.rx}
        ry={zone.ry}
        fill={color}
        fillOpacity={highlighted ? 0.45 : 0.24}
        stroke={color}
        strokeOpacity={0.9}
        strokeWidth={highlighted ? 0.3 : 0.15}
      />
    </g>
  )
}

export function ZoneLabel({ zone }: { zone: ResolvedZone }) {
  return (
    <text
      className="fade-in"
      x={zone.center.x}
      y={sy(zone.center.y + zone.ry - 1.1)}
      fontSize={0.95}
      fontWeight={700}
      fill="#ffffff"
      stroke="#0d1117"
      strokeWidth={0.25}
      paintOrder="stroke"
      textAnchor="middle"
      dominantBaseline="central"
      aria-hidden="true"
    >
      {zone.label}
    </text>
  )
}

type ArrowKind = 'drop' | 'rush' | 'blitz'

export function Arrow({ from, to, kind }: { from: Point; to: Point; kind: ArrowKind }) {
  const stroke = kind === 'drop' ? '#ffffff' : ROLE_COLORS[kind]
  const marker = kind === 'drop' ? 'white' : kind
  // Se recorta el final para que la flecha no quede debajo del círculo del jugador.
  const len = Math.hypot(to.x - from.x, to.y - from.y)
  if (len < 1.5) return null
  const cut = kind === 'drop' ? 1.4 : 0
  const end = { x: to.x - ((to.x - from.x) / len) * cut, y: to.y - ((to.y - from.y) / len) * cut }
  return (
    <line
      className="fade-in"
      x1={from.x}
      y1={sy(from.y)}
      x2={end.x}
      y2={sy(end.y)}
      stroke={stroke}
      strokeOpacity={0.9}
      strokeWidth={0.18}
      strokeDasharray={kind === 'drop' ? '0.5 0.3' : undefined}
      markerEnd={`url(#arrow-${marker})`}
      aria-hidden="true"
    />
  )
}

export function ManLine({ from, to }: { from: Point; to: Point }) {
  return (
    <line
      className="fade-in"
      x1={from.x}
      y1={sy(from.y)}
      x2={to.x}
      y2={sy(to.y)}
      stroke={ROLE_COLORS.man}
      strokeWidth={0.2}
      aria-hidden="true"
    />
  )
}
