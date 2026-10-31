import type { KeyboardEvent } from 'react'
import type { Point, ResolvedDefender, ResolvedOffense } from '../../engine/types'
import { FIELD_COLORS, colorFor } from '../../data/theme'
import { position } from '../../data/positions'
import { sy } from './Field'

const R = 1.05

export function OffensePlayer({ player }: { player: ResolvedOffense }) {
  const r = player.lineman ? 0.85 : 1
  return (
    <g transform={`translate(${player.pos.x} ${sy(player.pos.y)})`} aria-hidden="true">
      <circle r={r} fill={FIELD_COLORS.offense} stroke="#1b1f24" strokeWidth={0.12} />
      {player.label && (
        <text fontSize={0.95} fontWeight={700} fill={FIELD_COLORS.offenseText} textAnchor="middle" dominantBaseline="central">
          {player.label}
        </text>
      )}
    </g>
  )
}

export function Ball({ at }: { at: Point }) {
  return <ellipse cx={at.x} cy={sy(at.y) - 0.1} rx={0.32} ry={0.5} fill="#8a4b22" stroke="#f4f4f0" strokeWidth={0.06} aria-hidden="true" />
}

interface DefenderProps {
  d: ResolvedDefender
  at: Point
  selected: boolean
  onSelect: (id: string) => void
}

export function Defender({ d, at, selected, onSelect }: DefenderProps) {
  const color = colorFor(d.kind, d.zone?.family)
  const pos = position(d.pos)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(d.id)
    }
  }
  return (
    <g
      className="player-move outline-none"
      style={{ transform: `translate(${at.x}px, ${sy(at.y)}px)` }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${pos.name}${d.hybrid ? ' (híbrido)' : ''}: ${d.roleLabel}`}
      onClick={() => onSelect(d.id)}
      onKeyDown={onKey}
    >
      {/* Área táctil más grande que el círculo visible. */}
      <circle r={2} fill="transparent" />
      {selected && <circle r={R + 0.6} fill="none" stroke={FIELD_COLORS.selected} strokeWidth={0.22} />}
      {d.hybrid && <circle r={R + 0.35} fill="none" stroke="#ffffff" strokeWidth={0.12} strokeDasharray="0.35 0.25" />}
      <circle r={R} fill={FIELD_COLORS.defense} stroke={color} strokeWidth={0.3} />
      <text fontSize={pos.short.length > 1 ? 0.85 : 1} fontWeight={700} fill="#ffffff" textAnchor="middle" dominantBaseline="central">
        {pos.short}
      </text>
    </g>
  )
}

/** Silueta punteada donde estaba alineado antes del snap. */
export function Ghost({ at }: { at: Point }) {
  return (
    <circle
      cx={at.x}
      cy={sy(at.y)}
      r={R}
      fill="none"
      stroke="#ffffff"
      strokeOpacity={0.45}
      strokeWidth={0.12}
      strokeDasharray="0.3 0.25"
      aria-hidden="true"
    />
  )
}
