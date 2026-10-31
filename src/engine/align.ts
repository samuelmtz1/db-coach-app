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
  Overrides,
  Point,
  ReceiverRef,
  RelSide,
  ResolvedDefender,
  ResolvedOffense,
  Side,
} from './types'

interface Ctx {
  ball: number
  str: StrengthResult
  offense: ResolvedOffense[]
  qb: Point
}

/** Distancia mínima entre centros de defensores (radio del círculo ≈ 1.05). */
export const MIN_GAP = 2.2
/** Profundidad mínima de un defensor (la DL se alinea a 1 yd). */
const MIN_DEPTH = 1

const sideName = (rel: RelSide) => (rel === 'S' ? 'strong' : 'weak')

/** "#2 strong", "RB", "FB". Con `role`, en el formato de los roles: "#2 Strong". */
export function receiverName(ref: ReceiverRef, role = false): string {
  if (ref === 'RB' || ref === 'FB') return ref
  const side = ref[0] === 'S' ? 'strong' : 'weak'
  return `#${ref[1]} ${role ? side[0].toUpperCase() + side.slice(1) : side}`
}

/** Receptor pegado a la línea (TE): a menos de 1.25 espacios de OL por fuera del tackle. */
function isAttached(ctx: Ctx, p: ResolvedOffense, side: Side): boolean {
  const s = sign(side)
  const tackle = ctx.ball + s * OL_SPACING * 2
  const out = (p.pos.x - tackle) * s
  return p.eligible && !p.backfield && out > 0 && out <= OL_SPACING * 1.25
}

/** Último hombre de la línea de un lado (TE pegado o tackle). */
function emlosX(ctx: Ctx, side: Side): number {
  const attached = ctx.offense.filter((p) => isAttached(ctx, p, side))
  return attached.length ? attached[0].pos.x : ctx.ball + sign(side) * OL_SPACING * 2
}

interface Aligned {
  point: Point
  label: string
}

function alignPoint(rule: AlignRule, ctx: Ctx): Aligned {
  const strength = ctx.str.strength
  switch (rule.ref) {
    case 'tech': {
      const side = resolveSide(rule.side, strength)
      return {
        point: { x: ctx.ball + sign(side) * techDx(rule.tech), y: rule.depth },
        label: rule.tech === 0 ? '0-tech' : `${rule.tech}-tech ${sideName(rule.side)}`,
      }
    }
    case 'ball': {
      const s = rule.side ? sign(resolveSide(rule.side, strength)) : 1
      const toward = rule.side ? ` hacia el lado ${sideName(rule.side)}` : ' a la derecha'
      return {
        point: { x: ctx.ball + s * rule.dx, y: rule.depth },
        label: rule.dx === 0 ? 'Sobre el balón' : `${rule.dx} yd del balón${toward}`,
      }
    }
    case 'hash': {
      const side = resolveSide(rule.side, strength)
      const where =
        rule.dx === 0 ? 'Sobre el hash' : `${Math.abs(rule.dx)} yd por ${rule.dx > 0 ? 'fuera' : 'dentro'} del hash`
      return {
        point: { x: hashX(side) + sign(side) * rule.dx, y: rule.depth },
        label: `${where} ${sideName(rule.side)}`,
      }
    }
    case 'apex': {
      const side = resolveSide(rule.side, strength)
      // Se ancla al #2 (o al #1) que no esté pegado a la línea: con un TE, el apex queda entre el TE y el #1.
      const detached = ctx.str.receivers[side].filter((p) => !isAttached(ctx, p, side))
      const anchor = detached[1] ?? detached[0]
      const edge = emlosX(ctx, side)
      const x = anchor ? (anchor.pos.x + edge) / 2 : edge + sign(side) * 3
      return { point: { x, y: rule.depth }, label: `Apex ${sideName(rule.side)}` }
    }
    case 'receiver': {
      const rec = findReceiver(rule.rec, ctx.str, ctx.offense)
      if (!rec) {
        // Sin ese receptor (p. ej. no hay #3): se queda en el apex de su lado.
        const relSide: RelSide = rule.rec === 'RB' || rule.rec === 'FB' ? 'S' : (rule.rec[0] as RelSide)
        const apex = alignPoint({ ref: 'apex', side: relSide, depth: rule.depth }, ctx)
        return { point: apex.point, label: `${apex.label} (no hay ${receiverName(rule.rec)})` }
      }
      // Un back se toma de frente, sin leverage.
      if (rec.backfield) return { point: { x: rec.pos.x, y: rule.depth }, label: `Sobre el ${receiverName(rule.rec)}` }
      const outward = Math.sign(rec.pos.x - ctx.ball) || 1
      const lev =
        rule.leverage === 0
          ? ''
          : `, ${Math.abs(rule.leverage)} yd por ${rule.leverage > 0 ? 'fuera' : 'dentro'}`
      return {
        point: { x: rec.pos.x + outward * rule.leverage, y: rule.depth },
        label: `Sobre el ${receiverName(rule.rec)}${lev}`,
      }
    }
  }
}

/**
 * Un man que se alinea sobre su receptor y ese receptor no existe: si su fallback sí existe
 * (p. ej. no hay #2 weak pero sí FB), se alinea sobre el fallback en lugar de irse al apex.
 */
function manAwareRule(rule: AlignRule, a: Assignment, ctx: Ctx): AlignRule {
  if (a.role.kind !== 'man' || rule.ref !== 'receiver' || rule.rec !== a.role.target) return rule
  if (findReceiver(rule.rec, ctx.str, ctx.offense)) return rule
  const alt = a.role.fallback?.find((ref) => findReceiver(ref, ctx.str, ctx.offense))
  return alt ? { ...rule, rec: alt } : rule
}

/** Punto a `dist` yardas de `from` en dirección a `to`. */
function toward(from: Point, to: Point, dist: number): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist }
}

/**
 * Separa defensores cuyas alineaciones caen encimadas (p. ej. contra Bunch o Trips),
 * empujándolos lo justo para que los círculos no se tapen.
 */
export function separate(points: Point[], gap = MIN_GAP): Point[] {
  const p = points.map((q) => ({ x: clampX(q.x), y: Math.max(MIN_DEPTH, q.y) }))
  for (let iter = 0; iter < 60; iter++) {
    let moved = false
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[j].x - p[i].x
        const dy = p[j].y - p[i].y
        const d = Math.hypot(dx, dy)
        if (d >= gap) continue
        moved = true
        const push = (gap - d) / 2 + 0.01
        const [ux, uy] = d > 0.01 ? [dx / d, dy / d] : [1, 0]
        p[i] = { x: clampX(p[i].x - ux * push), y: Math.max(MIN_DEPTH, p[i].y - uy * push) }
        p[j] = { x: clampX(p[j].x + ux * push), y: Math.max(MIN_DEPTH, p[j].y + uy * push) }
      }
    }
    if (!moved) break
  }
  return p
}

export class MissingAssignmentError extends Error {}

/**
 * Corazón del motor: frente + cover + formación + hash → posiciones pre y post snap,
 * zonas y asignaciones man de los 11 defensores.
 * `overrides` mueve la alineación pre-snap de algunos defensores sin cambiar su rol.
 */
export function alignDefense(
  front: Front,
  coverageId: string,
  assignments: Record<string, Assignment> | undefined,
  formation: Formation,
  hash: Hash,
  overrides: Overrides = {},
): DefenseSnapshot {
  if (!assignments) {
    throw new MissingAssignmentError(`Sin asignaciones para ${front.name} + ${coverageId}`)
  }
  const ball = hashToBallX(hash)
  const offense = placeOffense(formation, hash)
  const str = detectStrength(offense, ball)
  const qbPlayer = offense.find((p) => p.backfield && !p.eligible)
  const ctx: Ctx = { ball, str, offense, qb: qbPlayer?.pos ?? { x: ball, y: -5 } }

  const rows = front.players.map((fp) => {
    const a = assignments[fp.id]
    if (!a) throw new MissingAssignmentError(`${fp.id} sin asignación en ${front.name} + ${coverageId}`)
    return { fp, a, aligned: alignPoint(manAwareRule(a.align ?? fp.align, a, ctx), ctx) }
  })
  const autos = separate(rows.map((r) => r.aligned.point))

  const defense: ResolvedDefender[] = rows.map(({ fp, a, aligned }, i) => {
    const auto = autos[i]
    const override = overrides[fp.id]
    const pre = override ?? auto
    const base = {
      id: fp.id,
      pos: fp.pos,
      group: fp.group,
      pre,
      auto,
      moved: Boolean(override),
      alignLabel: aligned.label,
      hybrid: Boolean(a.hybrid),
    }
    const rushTo = (gap: number) => toward(pre, ctx.qb, Math.max(0, Math.hypot(pre.x - ctx.qb.x, pre.y - ctx.qb.y) - gap))

    switch (a.role.kind) {
      case 'zone': {
        const zone = resolveZone(a.role.zone, str.strength, ball)
        return { ...base, kind: 'zone', roleLabel: zoneLabel(a.role.zone), zone, post: zone.drop }
      }
      case 'man': {
        const refs = [a.role.target, ...(a.role.fallback ?? [])]
        for (const ref of refs) {
          const target = findReceiver(ref, str, offense)
          if (target) return { ...base, kind: 'man', roleLabel: `Man ${receiverName(ref, true)}`, manTargetId: target.id, post: pre }
        }
        // Nadie a quien cubrir en esta formación: se suma a la presión.
        return { ...base, kind: 'blitz', roleLabel: `Blitz (no hay ${receiverName(a.role.target)})`, post: rushTo(1.5) }
      }
      case 'rush':
        return { ...base, kind: 'rush', roleLabel: 'Rush', post: toward(pre, ctx.qb, 3) }
      case 'blitz':
        return { ...base, kind: 'blitz', roleLabel: 'Blitz', post: rushTo(1.5) }
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
