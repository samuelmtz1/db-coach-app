import type { DefenseSnapshot, ResolvedDefender } from './types'

// Compara dos defensas jugador por jugador (por id: CB_S, MIKE, FS...).
// Los ids son los mismos en todos los frentes, así que también sirve para comparar frentes.

export type DiffStatus =
  /** Misma responsabilidad y misma alineación. */
  | 'same'
  /** Cambia la responsabilidad (zona, man, rush o blitz). */
  | 'role'
  /** Misma responsabilidad, otra regla de alineación o profundidad. */
  | 'align'
  /** Misma regla, pero el lugar cambia respecto al balón (otra formación u otro hash). */
  | 'moved'
  /** El jugador existe solo en un lado (p. ej. el Nickel al comparar 4-3-4 con 4-2-5). */
  | 'onlyA'
  | 'onlyB'

export interface DefenderDiff {
  id: string
  a?: ResolvedDefender
  b?: ResolvedDefender
  status: DiffStatus
  roleChanged: boolean
  alignChanged: boolean
  /** Yardas que se recorre la alineación pre-snap, medidas respecto al balón. */
  shift: number
}

/** Diferencia de profundidad que ya cuenta como otra alineación (yardas). */
const DEPTH_STEP = 1
/** Recorrido mínimo respecto al balón para contar como "se mueve" (yardas). */
export const MOVE_STEP = 1.5

function depthChanged(a: ResolvedDefender, b: ResolvedDefender): boolean {
  return Math.abs(Math.round(a.auto.y) - Math.round(b.auto.y)) >= DEPTH_STEP
}

/** Distancia entre las dos alineaciones de regla, con el balón como origen en cada campo. */
function shiftFromBall(a: ResolvedDefender, b: ResolvedDefender, ballA: number, ballB: number): number {
  return Math.hypot(a.auto.x - ballA - (b.auto.x - ballB), a.auto.y - b.auto.y)
}

/** Orden: el de la defensa A, y al final los que solo están en B. */
export function diffSnapshots(a: DefenseSnapshot, b: DefenseSnapshot): DefenderDiff[] {
  const byIdB = new Map(b.defense.map((d) => [d.id, d]))
  const out: DefenderDiff[] = a.defense.map((da) => {
    const db = byIdB.get(da.id)
    if (!db) return { id: da.id, a: da, status: 'onlyA', roleChanged: true, alignChanged: true, shift: 0 }
    const roleChanged = da.roleLabel !== db.roleLabel || da.hybrid !== db.hybrid
    const alignChanged = da.alignLabel !== db.alignLabel || depthChanged(da, db)
    const shift = shiftFromBall(da, db, a.ball.x, b.ball.x)
    const status: DiffStatus = roleChanged ? 'role' : alignChanged ? 'align' : shift >= MOVE_STEP ? 'moved' : 'same'
    return { id: da.id, a: da, b: db, status, roleChanged, alignChanged, shift }
  })
  const idsA = new Set(a.defense.map((d) => d.id))
  for (const db of b.defense) {
    if (!idsA.has(db.id)) out.push({ id: db.id, b: db, status: 'onlyB', roleChanged: true, alignChanged: true, shift: 0 })
  }
  return out
}

/** ids de los defensores que cambian de algo: rol, alineación, lugar, o que solo existen en un lado. */
export function changedIds(diff: DefenderDiff[]): Set<string> {
  return new Set(diff.filter((d) => d.status !== 'same').map((d) => d.id))
}
