import { OL_SPACING, ballX as hashToBallX, clampX, hashX, resolveSide, sign, techDx } from './geometry'
import { detectStrength, findReceiver, placeOffense, type StrengthResult } from './strength'
import { resolveZone, zoneLabel } from './zones'
import type {
  AlignRule,
  Assignment,
  DefenseSnapshot,
  Formation,
  Front,
  Hash,
  Point,
  ResolvedDefender,
  ResolvedOffense,
  Role,
} from './types'

interface Ctx {
  ball: number
  str: StrengthResult
  offense: ResolvedOffense[]
  qb: Point
}

/** Último hombre de la línea de un lado (TE pegado o tackle). */
function emlosX(ctx: Ctx, side: 'L' | 'R'): number {
  const s = sign(side)
  const tackle = ctx.ball + s * OL_SPACING * 2
  const attached = ctx.offense.filter(
    (p) => p.eligible && !p.backfield && Math.abs(p.pos.x - tackle) <= OL_SPACING * 1.5 && (p.pos.x - tackle) * s > 0,
  )
  return attached.length ? attached[0].pos.x : tackle
}

function alignPoint(rule: AlignRule, ctx: Ctx): Point {
  const strength = ctx.str.strength
  switch (rule.ref) {
    case 'tech': {
      const side = resolveSide(rule.side, strength)
      return { x: ctx.ball + sign(side) * techDx(rule.tech), y: rule.depth }
    }
    case 'ball': {
      const s = rule.side ? sign(resolveSide(rule.side, strength)) : 1
      return { x: ctx.ball + s * rule.dx, y: rule.depth }
    }
    case 'hash': {
      const side = resolveSide(rule.side, strength)
      return { x: hashX(side) + sign(side) * rule.dx, y: rule.depth }
    }
    case 'apex': {
      const side = resolveSide(rule.side, strength)
      const recs = ctx.str.receivers[side]
      const anchor = recs[1] ?? recs[0]
      const edge = emlosX(ctx, side)
      const x = anchor ? (anchor.pos.x + edge) / 2 : edge + sign(side) * 3
      return { x, y: rule.depth }
    }
    case 'receiver': {
      const rec = findReceiver(rule.rec, ctx.str, ctx.offense)
      if (!rec) {
        // Sin ese receptor (p. ej. no hay #3): se queda en el apex de su lado.
        const relSide = rule.rec === 'RB' ? 'S' : (rule.rec[0] as 'S' | 'W')
        return alignPoint({ ref: 'apex', side: relSide, depth: rule.depth }, ctx)
      }
      const outward = Math.sign(rec.pos.x - ctx.ball) || 1
      return { x: rec.pos.x + outward * rule.leverage, y: rule.depth }
    }
  }
}

function roleLabel(role: Role): string {
  switch (role.kind) {
    case 'zone':
      return zoneLabel(role.zone)
    case 'man':
      return role.target === 'RB'
        ? 'Man RB'
        : `Man #${role.target[1]} ${role.target[0] === 'S' ? 'Strong' : 'Weak'}`
    case 'rush':
      return 'Rush'
    case 'blitz':
      return 'Blitz'
  }
}

/** Punto a `dist` yardas de `from` en dirección a `to`. */
function toward(from: Point, to: Point, dist: number): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist }
}

export class MissingAssignmentError extends Error {}

/**
 * Corazón del motor: frente + cover + formación + hash → posiciones pre y post snap,
 * zonas y asignaciones man de los 11 defensores.
 */
export function alignDefense(
  front: Front,
  coverageId: string,
  assignments: Record<string, Assignment> | undefined,
  formation: Formation,
  hash: Hash,
): DefenseSnapshot {
  if (!assignments) {
    throw new MissingAssignmentError(`Sin asignaciones para ${front.name} + ${coverageId}`)
  }
  const ball = hashToBallX(hash)
  const offense = placeOffense(formation, hash)
  const str = detectStrength(offense, ball)
  const qbPlayer = offense.find((p) => p.backfield && !p.eligible)
  const ctx: Ctx = { ball, str, offense, qb: qbPlayer?.pos ?? { x: ball, y: -5 } }

  const defense: ResolvedDefender[] = front.players.map((fp) => {
    const a = assignments[fp.id]
    if (!a) throw new MissingAssignmentError(`${fp.id} sin asignación en ${front.name} + ${coverageId}`)

    const raw = alignPoint(a.align ?? fp.align, ctx)
    const pre = { x: clampX(raw.x), y: raw.y }
    const base = { id: fp.id, pos: fp.pos, group: fp.group, pre, roleLabel: roleLabel(a.role), hybrid: Boolean(a.hybrid) }

    switch (a.role.kind) {
      case 'zone': {
        const zone = resolveZone(a.role.zone, str.strength, ball)
        return { ...base, kind: 'zone', zone, post: zone.drop }
      }
      case 'man': {
        const target = findReceiver(a.role.target, str, offense)
        return { ...base, kind: 'man', manTargetId: target?.id, post: pre }
      }
      case 'rush':
        return { ...base, kind: 'rush', post: toward(pre, ctx.qb, 3) }
      case 'blitz':
        return { ...base, kind: 'blitz', post: toward(pre, ctx.qb, Math.max(0, Math.hypot(pre.x - ctx.qb.x, pre.y - ctx.qb.y) - 1.5)) }
    }
  })

  return {
    ball: { x: ball, y: 0 },
    strength: str.strength,
    strengthReason: str.reason,
    offense,
    defense,
  }
}
