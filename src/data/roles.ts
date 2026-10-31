// Atajos para escribir asignaciones de forma legible en assignments.ts.
import type { AlignRule, ReceiverRef, RelSide, Role, ZoneSpec } from '../engine/types'

export const RUSH: Role = { kind: 'rush' }
export const BLITZ: Role = { kind: 'blitz' }

export const zone = (type: ZoneSpec['type'], side: ZoneSpec['side'], slot?: ZoneSpec['slot']): Role => ({
  kind: 'zone',
  zone: { type, side, slot },
})

export const man = (target: ReceiverRef): Role => ({ kind: 'man', target })

// Reglas de alineación
export const onReceiver = (rec: ReceiverRef, leverage: number, depth: number): AlignRule => ({
  ref: 'receiver',
  rec,
  leverage,
  depth,
})
export const apex = (side: RelSide, depth: number): AlignRule => ({ ref: 'apex', side, depth })
export const tech = (t: number, side: RelSide, depth = 1): AlignRule => ({
  ref: 'tech',
  tech: t,
  side,
  depth,
})
export const overBall = (dx: number, depth: number, side?: RelSide): AlignRule => ({
  ref: 'ball',
  dx,
  side,
  depth,
})
export const onHash = (side: RelSide, dx: number, depth: number): AlignRule => ({
  ref: 'hash',
  side,
  dx,
  depth,
})
