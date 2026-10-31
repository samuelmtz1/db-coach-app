// Lógica pura del modo Verificar: arma la tabla de cada frente + cover y el resumen para el chat.
import { alignDefense } from '../../engine/align'
import type { Coverage, Front, Group, RoleKind, ZoneFamily } from '../../engine/types'
import { ASSIGNMENTS } from '../../data/assignments'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS, VERIFY_FORMATION_ID } from '../../data/formations'
import { FRONTS } from '../../data/fronts'
import { position } from '../../data/positions'
import { comboKey, type ComboNote, type RowCheck, type ViewRef } from '../../store/verifyStore'

export interface ChecklistRow {
  id: string
  name: string
  short: string
  group: Group
  kind: RoleKind
  /** Familia de la zona (color del anillo), si juega zona. */
  family?: ZoneFamily
  roleLabel: string
  alignLabel: string
  depth: number
  hybrid: boolean
  /** Lo que el coach aprueba al marcar ✔. Si cambia, la marca anterior deja de valer. */
  snapshot: string
}

export interface Combo {
  key: string
  front: Front
  coverage: Coverage
  rows: ChecklistRow[]
  error?: string
}

export type RowState = 'pending' | 'ok' | 'fix' | 'changed'

const formatDepth = (y: number) => `${Number(y.toFixed(1))} yd`

/** Las 30 combinaciones, calculadas contra Shotgun 2x2 con balón al centro. */
export function buildChecklist(): Combo[] {
  const formation = FORMATIONS.find((f) => f.id === VERIFY_FORMATION_ID)!
  return FRONTS.flatMap((front) =>
    COVERAGES.map((coverage) => {
      const key = comboKey(front.id, coverage.id)
      try {
        const snap = alignDefense(front, coverage.id, ASSIGNMENTS[front.id]?.[coverage.id], formation, 'M')
        const rows = snap.defense.map((d) => {
          const pos = position(d.pos)
          const depth = Number(d.auto.y.toFixed(1))
          return {
            id: d.id,
            name: pos.name,
            short: pos.short,
            group: d.group,
            kind: d.kind,
            family: d.zone?.family,
            roleLabel: d.roleLabel,
            alignLabel: d.alignLabel,
            depth,
            hybrid: d.hybrid,
            snapshot: `${d.roleLabel} | ${d.alignLabel} | ${formatDepth(depth)}${d.hybrid ? ' | híbrido' : ''}`,
          }
        })
        return { key, front, coverage, rows }
      } catch (e) {
        return { key, front, coverage, rows: [], error: e instanceof Error ? e.message : String(e) }
      }
    }),
  )
}

export function rowState(row: ChecklistRow, check: RowCheck | undefined): RowState {
  if (!check) return 'pending'
  if (check.snapshot !== row.snapshot) return 'changed'
  return check.status
}

export interface Progress {
  ok: number
  fix: number
  /** Sin marcar, o marcadas antes de que cambiara el contenido. */
  pending: number
  changed: number
  total: number
}

export function comboProgress(combo: Combo, checks: Record<string, RowCheck> | undefined): Progress {
  const p: Progress = { ok: 0, fix: 0, pending: 0, changed: 0, total: combo.rows.length }
  for (const row of combo.rows) {
    const st = rowState(row, checks?.[row.id])
    if (st === 'ok') p.ok++
    else if (st === 'fix') p.fix++
    else {
      p.pending++
      if (st === 'changed') p.changed++
    }
  }
  return p
}

const HASH_NAME = { L: 'hash izq.', M: 'balón al centro', R: 'hash der.' } as const

/** "(viendo Trips, hash izq.)" si la nota se escribió con otra formación u otro hash. */
export function viewSuffix(view: ViewRef): string {
  if (view.formationId === VERIFY_FORMATION_ID && view.hash === 'M') return ''
  const name = FORMATIONS.find((f) => f.id === view.formationId)?.name ?? view.formationId
  return ` (viendo ${name}, ${HASH_NAME[view.hash]})`
}

/** Texto para pegar en el chat: qué hay que corregir, con las notas del coach. */
export function buildSummary(
  combos: Combo[],
  rows: Record<string, Record<string, RowCheck>>,
  notes: Record<string, ComboNote>,
  version: string,
): string {
  const progress = combos.map((c) => ({ c, p: comboProgress(c, rows[c.key]) }))
  const reviewed = progress.filter(({ p }) => p.total > 0 && p.pending === 0).length
  const totalOk = progress.reduce((n, { p }) => n + p.ok, 0)
  const totalFix = progress.reduce((n, { p }) => n + p.fix, 0)

  const lines = [
    `DB Coach v${version} · Verificación (Shotgun 2x2, balón al centro)`,
    `Revisadas: ${reviewed}/${combos.length} combinaciones · ${totalOk} OK · ${totalFix} por corregir`,
  ]

  for (const { c, p } of progress) {
    const note = notes[c.key]?.text.trim()
    if (p.fix === 0 && !note) continue
    lines.push('', `${c.front.name} + ${c.coverage.name}`)
    for (const row of c.rows) {
      const check = rows[c.key]?.[row.id]
      if (rowState(row, check) !== 'fix') continue
      lines.push(`  ✘ ${row.short} (${row.name}) · ${row.snapshot}`)
      if (check!.note.trim()) lines.push(`    Nota: ${check!.note.trim()}${viewSuffix(check!.view)}`)
    }
    if (note) lines.push(`  Nota general: ${note}${viewSuffix(notes[c.key].view)}`)
  }

  const pending = progress.filter(({ p }) => p.pending > 0).map(({ c }) => `${c.front.name} + ${c.coverage.name}`)
  if (pending.length) lines.push('', `Sin terminar (${pending.length}): ${pending.join(', ')}`)
  return lines.join('\n')
}
