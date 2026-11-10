import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Field, sy } from '../../components/field/Field'
import { Arrow, ManLine, ZoneLabel, ZoneShape } from '../../components/field/Overlays'
import { Ball, DefenderGlyph, Ghost } from '../../components/field/Players'
import { clampBoardPoint, clampOffense, distToPolyline } from '../../engine/board'
import { FIELD_WIDTH, VIEW_BOTTOM, VIEW_TOP, ballX } from '../../engine/geometry'
import type { DefenseSnapshot, Phase, Point } from '../../engine/types'
import { FIELD_COLORS } from '../../data/theme'
import { newStrokeId, useBoardStore, type BoardDoc, type BoardPlayerState, type BoardRoute, type PenColor } from '../../store/boardStore'

export const PEN_COLORS: Record<PenColor, string> = { white: '#ffffff', yellow: '#ffd23f', red: '#ff4d4d' }

/** Radio del borrador, en yardas. */
const ERASE_RADIUS = 1.1
/** Distancia mínima entre puntos de un trazo a mano. */
const PEN_STEP = 0.25
const DRAG_THRESHOLD = 6
const MARGIN = 1.5

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y })

/** Puntos absolutos de la ruta de un jugador, empezando en el jugador. */
export function routeLine(player: BoardPlayerState, route: BoardRoute): Point[] {
  return [player.pos, ...route.points.map((o) => add(player.pos, o))]
}

function toField(svg: SVGSVGElement | null | undefined, clientX: number, clientY: number): Point | null {
  const ctm = svg?.getScreenCTM()
  if (!ctm) return null
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
  return { x: p.x, y: -p.y }
}

/** Borra lo que esté bajo el borrador: trazos, rutas y círculos de pre-snap. */
function eraseAt(doc: BoardDoc, p: Point): BoardDoc | null {
  const strokes = doc.strokes.filter((s) => distToPolyline(p, s.points) > ERASE_RADIUS)
  const routes = { ...doc.routes }
  let changed = strokes.length !== doc.strokes.length
  for (const pl of doc.players) {
    const r = routes[pl.id]
    if (r && r.points.length > 0 && distToPolyline(p, routeLine(pl, r)) <= ERASE_RADIUS) {
      delete routes[pl.id]
      changed = true
    }
  }
  const players = doc.players.map((pl) => {
    if (pl.presnap && Math.hypot(pl.presnap.x - p.x, pl.presnap.y - p.y) <= ERASE_RADIUS) {
      changed = true
      return { ...pl, presnap: undefined }
    }
    return pl
  })
  return changed ? { ...doc, strokes, routes, players } : null
}

interface Props {
  defense: DefenseSnapshot | null
  phase: Phase
  label: string
}

export function BoardCanvas({ defense, phase, label }: Props) {
  const doc = useBoardStore((s) => s.doc)
  const ui = useBoardStore((s) => s.ui)
  const selectedId = useBoardStore((s) => s.selectedId)
  const { select, commit, beginGesture, live } = useBoardStore.getState()
  const wrap = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ id: number; kind: 'pen' | 'erase'; strokeId?: string; started: boolean } | null>(null)

  // iOS Safari ignora touch-action en SVG: al dibujar, el dedo no debe mover la página.
  const drawing = ui.tool !== 'move'
  useEffect(() => {
    const el = wrap.current
    if (!el || !drawing) return
    const stop = (e: TouchEvent) => e.preventDefault()
    el.addEventListener('touchstart', stop, { passive: false })
    return () => el.removeEventListener('touchstart', stop)
  }, [drawing])

  const onBgDown = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return
    const p = toField(e.currentTarget.ownerSVGElement, e.clientX, e.clientY)
    if (!p) return
    const tool = useBoardStore.getState().ui.tool
    if (tool === 'move') {
      select(null)
      return
    }
    if (tool === 'route') {
      const sel = useBoardStore.getState().selectedId
      if (!sel) return
      const at = clampBoardPoint(p)
      commit((d) => {
        const pl = d.players.find((x) => x.id === sel)
        if (!pl) return d
        const prev = d.routes[sel]
        const offset = { x: at.x - pl.pos.x, y: at.y - pl.pos.y }
        const route: BoardRoute = {
          points: [...(prev?.points ?? []), offset],
          dashed: prev && prev.points.length ? prev.dashed : useBoardStore.getState().ui.dashed,
          templateId: null,
        }
        return { ...d, routes: { ...d.routes, [sel]: route } }
      })
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    if (tool === 'pen') {
      const strokeId = newStrokeId()
      const { dashed, color } = useBoardStore.getState().ui
      beginGesture()
      live((d) => ({ ...d, strokes: [...d.strokes, { id: strokeId, points: [p, p], dashed, color }] }))
      gesture.current = { id: e.pointerId, kind: 'pen', strokeId, started: true }
    } else {
      gesture.current = { id: e.pointerId, kind: 'erase', started: false }
      eraseStep(p)
    }
  }

  const eraseStep = (p: Point) => {
    const g = gesture.current
    const next = eraseAt(useBoardStore.getState().doc, p)
    if (!next || !g) return
    // El paso de deshacer se guarda solo si de verdad se borró algo.
    if (!g.started) {
      beginGesture()
      g.started = true
    }
    live(() => next)
  }

  const onBgMove = (e: PointerEvent<SVGRectElement>) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    const p = toField(e.currentTarget.ownerSVGElement, e.clientX, e.clientY)
    if (!p) return
    if (g.kind === 'erase') {
      eraseStep(p)
      return
    }
    live((d) => ({
      ...d,
      strokes: d.strokes.map((s) => {
        if (s.id !== g.strokeId) return s
        const last = s.points.at(-1)!
        return Math.hypot(last.x - p.x, last.y - p.y) < PEN_STEP ? s : { ...s, points: [...s.points, p] }
      }),
    }))
  }

  const onBgUp = (e: PointerEvent<SVGRectElement>) => {
    if (gesture.current?.id === e.pointerId) gesture.current = null
  }

  const post = phase === 'post'
  const offenseIds = new Set(doc.players.map((p) => p.id))
  const offenseById = new Map(doc.players.map((p) => [p.id, p]))

  return (
    <div ref={wrap} style={{ touchAction: drawing ? 'none' : undefined }} data-tool={ui.tool}>
      <Field label={label}>
        <rect
          x={-MARGIN}
          y={-VIEW_TOP}
          width={FIELD_WIDTH + MARGIN * 2}
          height={VIEW_TOP - VIEW_BOTTOM}
          fill="transparent"
          className={ui.tool === 'move' ? undefined : 'cursor-crosshair'}
          onPointerDown={onBgDown}
          onPointerMove={onBgMove}
          onPointerUp={onBgUp}
          onPointerCancel={onBgUp}
        />

        {defense && (
          <g pointerEvents="none" aria-hidden="true">
            {post && defense.defense.filter((d) => d.zone).map((d) => <ZoneShape key={`z-${d.id}`} zone={d.zone!} highlighted={false} />)}
            {post &&
              defense.defense.map((d) => {
                if (d.kind === 'zone') return <Arrow key={`a-${d.id}`} from={d.pre} to={d.post} kind="drop" />
                if (d.kind === 'man' && d.manTargetId && offenseIds.has(d.manTargetId)) {
                  return <ManLine key={`m-${d.id}`} from={d.pre} to={offenseById.get(d.manTargetId)!.pos} />
                }
                if (d.kind === 'rush' || d.kind === 'blitz') return <Arrow key={`r-${d.id}`} from={d.pre} to={d.post} kind={d.kind} />
                return null
              })}
            {post && defense.defense.filter((d) => d.zone).map((d) => <ZoneLabel key={`l-${d.id}`} zone={d.zone!} />)}
            {defense.defense.map((d) => {
              const at = post && d.kind === 'zone' ? d.post : d.pre
              return (
                <g key={d.id} className="player-move" style={{ transform: `translate(${at.x}px, ${sy(at.y)}px)` }}>
                  <DefenderGlyph d={d} />
                </g>
              )
            })}
            {post && defense.defense.filter((d) => d.kind === 'zone').map((d) => <Ghost key={`g-${d.id}`} at={d.pre} />)}
          </g>
        )}

        <g pointerEvents="none" aria-hidden="true">
          {doc.strokes.map((s) => (
            <polyline
              key={s.id}
              points={s.points.map((p) => `${p.x},${sy(p.y)}`).join(' ')}
              fill="none"
              stroke={PEN_COLORS[s.color]}
              strokeWidth={0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? '0.8 0.6' : undefined}
            />
          ))}

          {doc.players.map((p) =>
            p.presnap ? (
              <g key={`mo-${p.id}`}>
                <MotionLine from={p.presnap} to={p.pos} />
                <circle
                  cx={p.presnap.x}
                  cy={sy(p.presnap.y)}
                  r={1}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity={0.9}
                  strokeWidth={0.16}
                  strokeDasharray="0.35 0.28"
                />
              </g>
            ) : null,
          )}

          {doc.players.map((p) => {
            const r = doc.routes[p.id]
            if (!r || r.points.length === 0) return null
            const line = routeLine(p, r)
            return (
              <polyline
                key={`r-${p.id}`}
                points={line.map((q) => `${q.x},${sy(q.y)}`).join(' ')}
                fill="none"
                stroke={p.id === selectedId ? FIELD_COLORS.selected : '#ffffff'}
                strokeWidth={0.3}
                strokeLinejoin="round"
                strokeDasharray={r.dashed ? '0.8 0.55' : undefined}
                markerEnd={p.id === selectedId ? 'url(#arrow-route-sel)' : 'url(#arrow-white)'}
              />
            )
          })}
        </g>

        <defs>
          <marker id="arrow-route-sel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={FIELD_COLORS.selected} />
          </marker>
        </defs>

        <Ball at={{ x: ballX(doc.hash), y: 0 }} />

        {doc.players.map((p) => (
          <OffenseMark key={p.id} player={p} selected={p.id === selectedId} />
        ))}
      </Field>
    </div>
  )
}

function MotionLine({ from, to }: { from: Point; to: Point }) {
  const len = Math.hypot(to.x - from.x, to.y - from.y)
  if (len < 2.2) return null
  // Se recorta en los dos extremos para no pasar por encima de los círculos.
  const ux = (to.x - from.x) / len
  const uy = (to.y - from.y) / len
  return (
    <line
      x1={from.x + ux * 1.1}
      y1={sy(from.y + uy * 1.1)}
      x2={to.x - ux * 1.2}
      y2={sy(to.y - uy * 1.2)}
      stroke="#ffffff"
      strokeWidth={0.22}
      strokeDasharray="0.6 0.45"
    />
  )
}

/** Jugador ofensivo del pizarrón: se arrastra en "Mover" y se toca para elegirlo y darle ruta. */
function OffenseMark({ player, selected }: { player: BoardPlayerState; selected: boolean }) {
  const tool = useBoardStore((s) => s.ui.tool)
  const { select, beginGesture, live, commit } = useBoardStore.getState()
  const ref = useRef<SVGGElement>(null)
  const drag = useRef<{ id: number; cx: number; cy: number; off: Point; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const interactive = !player.lineman && (tool === 'move' || tool === 'route')
  const draggable = interactive && tool === 'move'

  useEffect(() => {
    const el = ref.current
    if (!el || !draggable) return
    const stop = (e: TouchEvent) => e.preventDefault()
    el.addEventListener('touchstart', stop, { passive: false })
    return () => el.removeEventListener('touchstart', stop)
  }, [draggable])

  const move = (to: Point) =>
    live((d) => ({ ...d, players: d.players.map((p) => (p.id === player.id ? { ...p, pos: clampOffense(to) } : p)) }))

  const onDown = (e: PointerEvent<SVGGElement>) => {
    if (!interactive || e.button !== 0) return
    e.stopPropagation()
    const p = toField(ref.current?.ownerSVGElement, e.clientX, e.clientY)
    if (!p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, cx: e.clientX, cy: e.clientY, off: { x: player.pos.x - p.x, y: player.pos.y - p.y }, moved: false }
  }

  const onMove = (e: PointerEvent<SVGGElement>) => {
    const g = drag.current
    if (!g || g.id !== e.pointerId || !draggable) return
    if (!g.moved && Math.hypot(e.clientX - g.cx, e.clientY - g.cy) < DRAG_THRESHOLD) return
    const p = toField(ref.current?.ownerSVGElement, e.clientX, e.clientY)
    if (!p) return
    if (!g.moved) {
      g.moved = true
      setDragging(true)
      beginGesture()
      select(player.id)
    }
    move({ x: p.x + g.off.x, y: p.y + g.off.y })
  }

  const onUp = (e: PointerEvent<SVGGElement>) => {
    const g = drag.current
    if (!g || g.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    if (!g.moved && e.type === 'pointerup') select(selected && tool === 'move' ? null : player.id)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(selected ? null : player.id)
      return
    }
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]
    if (step) {
      e.preventDefault()
      commit((d) => ({
        ...d,
        players: d.players.map((p) => (p.id === player.id ? { ...p, pos: clampOffense({ x: p.pos.x + step[0], y: p.pos.y + step[1] }) } : p)),
      }))
    }
  }

  const r = player.lineman ? 0.85 : 1
  return (
    <g
      ref={ref}
      className={['player-move outline-none', draggable && 'draggable', dragging && 'is-dragging'].filter(Boolean).join(' ')}
      style={{ transform: `translate(${player.pos.x}px, ${sy(player.pos.y)}px)`, pointerEvents: interactive ? undefined : 'none' }}
      role={player.lineman ? undefined : 'button'}
      tabIndex={player.lineman ? undefined : 0}
      aria-pressed={player.lineman ? undefined : selected}
      aria-label={player.lineman ? undefined : `${player.label}${draggable ? '. Arrástralo o usa las flechas para moverlo' : ''}`}
      aria-hidden={player.lineman ? true : undefined}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={player.lineman ? undefined : onKey}
    >
      {!player.lineman && <circle r={2} fill="transparent" />}
      {selected && <circle r={r + 0.6} fill="none" stroke={FIELD_COLORS.selected} strokeWidth={0.22} />}
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
