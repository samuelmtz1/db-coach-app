import { FIELD_WIDTH, OL_SPACING, ballX, sign, sidelineX } from './geometry'
import type { Formation, Hash, ReceiverRef, ResolvedOffense, Side } from './types'

/** Coloca a cada jugador ofensivo en el campo según el hash. */
export function placeOffense(formation: Formation, hash: Hash): ResolvedOffense[] {
  const bx = ballX(hash)
  const placed = new Map<string, number>()

  // Los slots dependen de su receptor de afuera, así que van al final.
  const ordered = [...formation.players].sort(
    (a, b) => Number(a.x.from === 'slot') - Number(b.x.from === 'slot'),
  )
  for (const p of ordered) {
    let x: number
    if (p.x.from === 'ball') {
      x = bx + p.x.dx
    } else if (p.x.from === 'sideline') {
      x = sidelineX(p.x.side) - sign(p.x.side) * p.x.d
    } else {
      const outside = placed.get(p.x.outside)
      if (outside === undefined) throw new Error(`Slot ${p.id} sin receptor ${p.x.outside}`)
      const tackle = bx + sign(p.x.side) * OL_SPACING * 2
      x = outside + (tackle - outside) * (p.x.at ?? 0.5)
    }
    placed.set(p.id, x)
  }

  return formation.players.map((p) => ({
    id: p.id,
    label: p.label,
    pos: { x: placed.get(p.id)!, y: p.y },
    eligible: p.eligible,
    backfield: Boolean(p.backfield),
    lineman: Boolean(p.lineman),
  }))
}

export interface StrengthResult {
  strength: Side
  reason: string
  /** Receptores de cada lado, de afuera hacia adentro (#1, #2, #3). */
  receivers: Record<Side, ResolvedOffense[]>
}

/**
 * Strength = lado con más receptores fuera del backfield.
 * Empate: lado del field (el más ancho). Balón al centro y empate: derecha.
 */
export function detectStrength(offense: ResolvedOffense[], ball: number): StrengthResult {
  const receivers = offense.filter((p) => p.eligible && !p.backfield)
  const outsideIn = (a: ResolvedOffense, b: ResolvedOffense) =>
    Math.abs(b.pos.x - ball) - Math.abs(a.pos.x - ball)
  const left = receivers.filter((p) => p.pos.x < ball).sort(outsideIn)
  const right = receivers.filter((p) => p.pos.x > ball).sort(outsideIn)

  let strength: Side
  let reason: string
  if (left.length !== right.length) {
    strength = left.length > right.length ? 'L' : 'R'
    reason = `${Math.max(left.length, right.length)} receptores contra ${Math.min(left.length, right.length)}`
  } else if (Math.abs(ball - FIELD_WIDTH / 2) > 0.5) {
    strength = ball < FIELD_WIDTH / 2 ? 'R' : 'L'
    reason = `${left.length}x${right.length} empatado: strength al lado del field`
  } else {
    strength = 'R'
    reason = `${left.length}x${right.length} empatado con balón al centro: strength a la derecha`
  }

  return { strength, reason, receivers: { L: left, R: right } }
}

/** Busca un receptor por referencia (S1, W2, RB, FB...). */
export function findReceiver(
  ref: ReceiverRef,
  result: StrengthResult,
  offense: ResolvedOffense[],
): ResolvedOffense | undefined {
  if (ref === 'RB' || ref === 'FB') {
    const backs = offense.filter((p) => p.backfield && p.eligible)
    const rb = backs.find((p) => p.id === 'RB') ?? backs[0]
    return ref === 'RB' ? rb : backs.find((p) => p !== rb)
  }
  const side: Side = ref[0] === 'S' ? result.strength : result.strength === 'R' ? 'L' : 'R'
  return result.receivers[side][Number(ref[1]) - 1]
}
