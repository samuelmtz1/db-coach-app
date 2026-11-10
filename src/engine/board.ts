import { FIELD_WIDTH, OL_SPACING, VIEW_BOTTOM, VIEW_TOP } from './geometry'
import type { Point, ResolvedOffense } from './types'

// Lógica pura del whiteboard: quién cuenta como back, cómo se dibuja una ruta del menú
// y a qué distancia está un trazo (para el borrador).

/** Un jugador ofensivo en el pizarrón. */
export interface BoardPlayer {
  id: string
  label: string
  pos: Point
  eligible: boolean
  lineman: boolean
}

/** Mitad del ancho de la "caja": del balón al tackle, más 1.5 yd. */
const BOX_HALF = OL_SPACING * 2 + 1.5
/** Un elegible más atrás que esto, dentro de la caja, es un back. */
const BACKFIELD_DEPTH = -2.5

/**
 * Convierte el pizarrón en la ofensiva que entiende el motor.
 * Un elegible dentro de la caja y detrás de la línea es back (RB/FB); fuera de ella, receptor.
 * Así, sacar al RB a abrirse lo convierte en receptor y la defensa se ajusta.
 */
export function resolveBoardOffense(players: BoardPlayer[], ball: number): ResolvedOffense[] {
  return players.map((p) => {
    const inBox = Math.abs(p.pos.x - ball) <= BOX_HALF && p.pos.y <= BACKFIELD_DEPTH
    return {
      id: p.id,
      label: p.label,
      pos: p.pos,
      eligible: p.eligible,
      // El QB (no elegible, detrás de la línea) siempre está en el backfield.
      backfield: p.lineman ? false : p.eligible ? inBox : p.pos.y < -1.5,
      lineman: p.lineman,
    }
  })
}

export interface RouteShapeInput {
  from: 'los' | 'start'
  points: [number, number][]
}

/** Lado hacia el que "abre" un jugador: +1 si está a la derecha del balón, -1 si a la izquierda. */
export function outwardSign(pos: Point, ball: number): 1 | -1 {
  return pos.x >= ball ? 1 : -1
}

/**
 * Puntos de una ruta del menú, relativos al jugador (offsets), para que la ruta
 * lo siga si después lo mueven.
 */
export function routeOffsets(shape: RouteShapeInput, start: Point, ball: number): Point[] {
  const s = outwardSign(start, ball)
  return shape.points.map(([dx, y]) => {
    const abs = { x: clampBoardX(start.x + s * dx), y: shape.from === 'los' ? y : start.y + y }
    return { x: abs.x - start.x, y: abs.y - start.y }
  })
}

export function clampBoardX(x: number, margin = 0.5): number {
  return Math.min(FIELD_WIDTH - margin, Math.max(margin, x))
}

export function clampBoardPoint(p: Point, margin = 0.5): Point {
  return { x: clampBoardX(p.x, margin), y: Math.min(VIEW_TOP - margin, Math.max(VIEW_BOTTOM + margin, p.y)) }
}

/** Los jugadores ofensivos se quedan de su lado de la LOS. */
export function clampOffense(p: Point): Point {
  return { x: clampBoardX(p.x, 1), y: Math.min(-0.6, Math.max(VIEW_BOTTOM + 1, p.y)) }
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/** Distancia mínima de un punto a una línea quebrada. */
export function distToPolyline(p: Point, line: Point[]): number {
  if (line.length === 0) return Infinity
  if (line.length === 1) return Math.hypot(p.x - line[0].x, p.y - line[0].y)
  let best = Infinity
  for (let i = 1; i < line.length; i++) best = Math.min(best, distToSegment(p, line[i - 1], line[i]))
  return best
}
