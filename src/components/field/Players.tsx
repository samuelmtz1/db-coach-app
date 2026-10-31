import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { FIELD_WIDTH, VIEW_TOP } from '../../engine/geometry'
import type { Point, ResolvedDefender, ResolvedOffense } from '../../engine/types'
import { FIELD_COLORS, colorFor } from '../../data/theme'
import { position } from '../../data/positions'
import { sy } from './Field'

const R = 1.05
/** Píxeles que hay que mover el dedo antes de que un toque cuente como arrastre. */
const DRAG_THRESHOLD = 6

export function OffensePlayer({ player }: { player: ResolvedOffense }) {
  const r = player.lineman ? 0.85 : 1
  return (
    <g transform={`translate(${player.pos.x} ${sy(player.pos.y)})`} aria-hidden="true">
      <circle r={r} fill={FIELD_COLORS.offense} stroke="#1b1f24" strokeWidth={0.12} />
      {player.label && (
        <text
          fontSize={player.label.length > 1 ? 0.8 : 0.95}
          fontWeight={700}
          fill={FIELD_COLORS.offenseText}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {player.label}
        </text>
      )}
    </g>
  )
}

export function Ball({ at }: { at: Point }) {
  return <ellipse cx={at.x} cy={sy(at.y) - 0.1} rx={0.32} ry={0.5} fill="#8a4b22" stroke="#f4f4f0" strokeWidth={0.06} aria-hidden="true" />
}

/** Mantiene al defensor dentro del campo y de su lado de la LOS. */
function clampDefense(p: Point): Point {
  return {
    x: Math.min(FIELD_WIDTH - 1, Math.max(1, p.x)),
    y: Math.min(VIEW_TOP - 1, Math.max(1, p.y)),
  }
}

interface DefenderProps {
  d: ResolvedDefender
  at: Point
  selected: boolean
  onSelect: (id: string) => void
  /** Si existe, el defensor se puede arrastrar con el dedo o el mouse, y mover con las flechas. */
  onMove?: (id: string, to: Point) => void
}

export function Defender({ d, at, selected, onSelect, onMove }: DefenderProps) {
  const color = colorFor(d.kind, d.zone?.family)
  const pos = position(d.pos)
  const ref = useRef<SVGGElement>(null)
  const drag = useRef<{ id: number; cx: number; cy: number; off: Point; moved: boolean } | null>(null)
  const lastPointerUp = useRef(0)
  const [dragging, setDragging] = useState(false)

  // iOS Safari no respeta touch-action en elementos SVG: sin esto, arrastrar también movería la página.
  useEffect(() => {
    const el = ref.current
    if (!el || !onMove) return
    const stop = (e: TouchEvent) => e.preventDefault()
    el.addEventListener('touchstart', stop, { passive: false })
    return () => el.removeEventListener('touchstart', stop)
  }, [onMove])

  const toField = (clientX: number, clientY: number): Point | null => {
    const svg = ref.current?.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: -p.y }
  }

  const onPointerDown = (e: PointerEvent<SVGGElement>) => {
    if (!onMove || e.button !== 0) return
    const p = toField(e.clientX, e.clientY)
    if (!p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, cx: e.clientX, cy: e.clientY, off: { x: at.x - p.x, y: at.y - p.y }, moved: false }
  }

  const onPointerMove = (e: PointerEvent<SVGGElement>) => {
    const g = drag.current
    if (!g || g.id !== e.pointerId || !onMove) return
    if (!g.moved && Math.hypot(e.clientX - g.cx, e.clientY - g.cy) < DRAG_THRESHOLD) return
    const p = toField(e.clientX, e.clientY)
    if (!p) return
    if (!g.moved) {
      g.moved = true
      setDragging(true)
    }
    onMove(d.id, clampDefense({ x: p.x + g.off.x, y: p.y + g.off.y }))
  }

  const onPointerEnd = (e: PointerEvent<SVGGElement>) => {
    const g = drag.current
    if (!g || g.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    lastPointerUp.current = performance.now()
    // Un toque sin arrastre selecciona, igual que un click.
    if (!g.moved && e.type === 'pointerup') onSelect(d.id)
  }

  // El click que sigue a un pointerup ya se resolvió arriba. Un click sin pointer (lector de pantalla) selecciona.
  const onClick = () => {
    if (onMove && performance.now() - lastPointerUp.current < 600) return
    onSelect(d.id)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(d.id)
      return
    }
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]
    if (step && onMove) {
      e.preventDefault()
      onMove(d.id, clampDefense({ x: at.x + step[0], y: at.y + step[1] }))
    }
  }

  return (
    <g
      ref={ref}
      className={['player-move outline-none', onMove && 'draggable', dragging && 'is-dragging'].filter(Boolean).join(' ')}
      style={{ transform: `translate(${at.x}px, ${sy(at.y)}px)` }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${pos.name}${d.hybrid ? ' (híbrido)' : ''}: ${d.roleLabel}${onMove ? '. Flechas para moverlo' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClick={onClick}
      onKeyDown={onKey}
    >
      {/* Área táctil más grande que el círculo visible. */}
      <circle r={2} fill="transparent" />
      {selected && <circle r={R + 0.6} fill="none" stroke={FIELD_COLORS.selected} strokeWidth={0.22} />}
      <circle
        r={R}
        fill={FIELD_COLORS.defense}
        stroke={color}
        strokeWidth={0.3}
        strokeDasharray={d.hybrid ? '0.42 0.28' : undefined}
      />
      <text
        fontSize={pos.short.length > 1 ? 0.85 : 1}
        fontWeight={700}
        fill={d.hybrid ? FIELD_COLORS.hybridText : '#ffffff'}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {pos.short}
      </text>
    </g>
  )
}

/** Silueta punteada: dónde estaba antes del snap, o dónde lo pone la regla si lo movieron a mano. */
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
