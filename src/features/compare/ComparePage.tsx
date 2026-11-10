import { Legend } from '../../components/field/Legend'
import { OptionGroup } from '../../components/ui/OptionGroup'
import { SelectField } from '../../components/ui/SelectField'
import { SnapToggle } from '../../components/ui/SnapToggle'
import { useSnapShortcut } from '../../components/ui/useSnapShortcut'
import { changedIds, diffSnapshots, type DefenderDiff } from '../../engine/diff'
import type { Phase } from '../../engine/types'
import { colorFor } from '../../data/theme'
import { defenderName, defenderShort } from '../../data/positions'
import { useCompareStore, type CompareDim } from '../../store/compareStore'
import { Diagram } from '../coverage-lab/Diagram'
import { solve, type Situation, type SolveResult } from '../shared/solve'
import { DIMS, DIM_ORDER, HASH_LABELS, nextOption, optionLabel, paneOptions, sideSituation } from './compare'

/** Columnas del selector de A / B según cuántas opciones tiene la dimensión. */
const PANE_COLUMNS: Record<CompareDim, 3 | 5 | 6> = { coverage: 5, formation: 6, front: 6, hash: 3 }

export function ComparePage() {
  const s = useCompareStore()
  const base: Situation = { frontId: s.frontId, coverageId: s.coverageId, formationId: s.formationId, hash: s.hash }
  const sitA = sideSituation(base, s.dim, s.a)
  const sitB = sideSituation(base, s.dim, s.b)
  // Dos alineaciones de 11 jugadores: es barato recalcular en cada render.
  const resA = solve(sitA)
  const resB = solve(sitB)
  const diff = resA.ok && resB.ok ? diffSnapshots(resA.snap, resB.snap) : null
  const changed = diff ? changedIds(diff) : new Set<string>()

  useSnapShortcut(s.togglePhase)

  const onDim = (dim: CompareDim) => {
    if (dim === s.dim) return
    const current = String(base[DIMS[dim].key])
    s.setDim(dim, current, nextOption(dim, current))
  }

  const select = (id: string) => s.select(id === s.selectedId ? null : id)
  const fixed = DIM_ORDER.filter((d) => d !== s.dim)
  const highlight = s.highlight && diff ? changed : undefined

  return (
    <div className="grid gap-4">
      <section
        aria-label="Situación"
        className="grid gap-4 rounded-lg border border-line bg-panel p-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-end"
      >
        <OptionGroup<CompareDim>
          label="Qué cambia"
          value={s.dim}
          onChange={onDim}
          columns={4}
          options={DIM_ORDER.map((d) => ({ value: d, label: DIMS[d].label }))}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {fixed.map((d) => (
            <SelectField
              key={d}
              label={`${DIMS[d].label} (A y B)`}
              value={String(base[DIMS[d].key])}
              onChange={(v) => s.setBase({ [DIMS[d].key]: v })}
              options={DIMS[d].options}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            {optionLabel(s.dim, s.a)} <span className="text-muted">vs</span> {optionLabel(s.dim, s.b)}
          </h2>
          <p className="text-sm text-muted" aria-live="polite">
            {diffHeadline(diff, s.a === s.b)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={s.swap}
            disabled={s.a === s.b}
            title="Intercambia los campos A y B"
            className={secondaryButton}
          >
            Invertir A ⇄ B
          </button>
          <button
            type="button"
            aria-pressed={s.highlight}
            onClick={() => s.setHighlight(!s.highlight)}
            title="Atenúa a los defensores que no cambian"
            className={[secondaryButton, s.highlight ? 'border-text' : ''].join(' ')}
          >
            Resaltar cambios: {s.highlight ? 'Sí' : 'No'}
          </button>
          <SnapToggle phase={s.phase} onChange={s.setPhase} shortcut />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Pane
          side="A"
          dim={s.dim}
          value={s.a}
          onChange={s.setA}
          result={resA}
          phase={s.phase}
          selectedId={s.selectedId}
          onSelect={select}
          highlight={highlight}
          situation={sitA}
        />
        <Pane
          side="B"
          dim={s.dim}
          value={s.b}
          onChange={s.setB}
          result={resB}
          phase={s.phase}
          selectedId={s.selectedId}
          onSelect={select}
          highlight={highlight}
          situation={sitB}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <Legend />
        <p className="flex items-center gap-2 text-sm text-muted">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-white" aria-hidden="true" />
          Halo blanco: cambia respecto al otro campo
        </p>
      </div>

      {diff && <ChangeList diff={diff} selectedId={s.selectedId} onSelect={select} />}
    </div>
  )
}

const secondaryButton =
  'min-h-11 rounded-lg border border-line bg-panel px-4 font-display text-lg font-bold transition-colors hover:border-muted active:bg-line disabled:border-transparent disabled:bg-transparent disabled:text-muted/70'

function diffHeadline(diff: DefenderDiff[] | null, same: boolean): string {
  if (!diff) return 'Uno de los dos campos no se puede dibujar.'
  if (same) return 'Los dos campos son iguales: elige otra opción en A o en B.'
  const role = diff.filter((d) => d.status === 'role' || d.status === 'onlyA' || d.status === 'onlyB').length
  const align = diff.filter((d) => d.status === 'align' || d.status === 'moved').length
  if (role + align === 0) return 'Nadie cambia: misma responsabilidad y misma alineación.'
  const parts = []
  if (role) parts.push(`${role} ${role === 1 ? 'cambia' : 'cambian'} de responsabilidad`)
  if (align) parts.push(`${align} ${align === 1 ? 'se realinea' : 'se realinean'}`)
  return parts.join(' · ')
}

interface PaneProps {
  side: 'A' | 'B'
  dim: CompareDim
  value: string
  onChange: (v: string) => void
  result: SolveResult
  phase: Phase
  selectedId: string | null
  onSelect: (id: string) => void
  highlight?: Set<string>
  situation: Situation
}

function Pane({ side, dim, value, onChange, result, phase, selectedId, onSelect, highlight, situation }: PaneProps) {
  const label = `Campo ${side}: ${optionLabel('front', situation.frontId)} · ${optionLabel('coverage', situation.coverageId)} vs ${optionLabel('formation', situation.formationId)}, ${HASH_LABELS[situation.hash]}`
  return (
    <section aria-label={`Campo ${side}`} className="min-w-0">
      <div className="mb-2 flex items-end gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent font-display text-2xl font-bold text-ink"
          aria-hidden="true"
        >
          {side}
        </span>
        <div className="min-w-0 flex-1">
          <OptionGroup
            label={`${DIMS[dim].label} en ${side}`}
            value={value}
            onChange={onChange}
            columns={PANE_COLUMNS[dim]}
            options={paneOptions(dim)}
          />
        </div>
      </div>
      {result.ok ? (
        <>
          <div className="overflow-hidden rounded-lg border border-line">
            <Diagram
              snap={result.snap}
              phase={phase}
              selectedId={selectedId}
              onSelect={onSelect}
              highlight={highlight}
              label={`${label}, ${phase === 'pre' ? 'pre-snap' : 'post-snap'}`}
            />
          </div>
          <p className="mt-1 text-sm text-muted">
            Strength: <span className="text-text">{result.snap.strength === 'R' ? 'derecha' : 'izquierda'}</span> ·{' '}
            {result.snap.strengthReason}
          </p>
        </>
      ) : (
        <div role="alert" className="grid min-h-64 place-items-center rounded-lg border border-line bg-panel p-6 text-center">
          <p>
            <span className="block font-display text-xl font-bold">No se puede dibujar este campo</span>
            <span className="text-muted">{result.message}</span>
          </p>
        </div>
      )}
    </section>
  )
}

const STATUS_TEXT: Record<DefenderDiff['status'], string> = {
  same: 'Igual',
  role: 'Cambia responsabilidad',
  align: 'Cambia alineación',
  moved: 'Misma regla, otro lugar',
  onlyA: 'Solo en A',
  onlyB: 'Solo en B',
}

function ChangeList({ diff, selectedId, onSelect }: { diff: DefenderDiff[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const changes = diff.filter((d) => d.status !== 'same')
  const same = diff.filter((d) => d.status === 'same')

  return (
    <section aria-label="Qué cambia" className="rounded-lg border border-line bg-panel">
      <h3 className="border-b border-line px-4 py-2 font-display text-xl font-bold">Qué cambia</h3>
      {changes.length === 0 ? (
        <p className="px-4 py-3 text-muted">Los 11 defensores hacen lo mismo en los dos campos.</p>
      ) : (
        <ul className="divide-y divide-line">
          {changes.map((d) => {
            const ref = d.a ?? d.b!
            const selected = d.id === selectedId
            return (
              <li key={d.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(d.id)}
                  className={[
                    'grid w-full gap-x-4 gap-y-1 px-4 py-2.5 text-left transition-colors sm:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)]',
                    selected ? 'bg-panel-2 outline-2 -outline-offset-2 outline-accent' : 'hover:bg-panel-2',
                  ].join(' ')}
                >
                  <span>
                    <span className="block font-display text-lg font-bold leading-tight">{defenderName(ref.id, ref.pos)}</span>
                    <span className="text-xs text-muted">
                      {STATUS_TEXT[d.status]}
                      {d.status === 'moved' && ` (${d.shift.toFixed(0)} yd)`}
                    </span>
                  </span>
                  <SideCell tag="A" d={d.a} other={d.b} status={d.status} />
                  <SideCell tag="B" d={d.b} other={d.a} status={d.status} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {same.length > 0 && changes.length > 0 && (
        <p className="border-t border-line px-4 py-2 text-sm text-muted">
          Sin cambios: {same.map((d) => defenderShort(d.id, d.a!.pos)).join(', ')}
        </p>
      )}
    </section>
  )
}

function SideCell({
  tag,
  d,
  other,
  status,
}: {
  tag: 'A' | 'B'
  d: DefenderDiff['a']
  other: DefenderDiff['a']
  status: DefenderDiff['status']
}) {
  if (!d) {
    return (
      <span className="text-sm text-muted">
        <span className="mr-2 font-display font-bold">{tag}</span>No está en este frente
      </span>
    )
  }
  const color = colorFor(d.kind, d.zone?.family)
  const roleDiffers = !other || other.roleLabel !== d.roleLabel
  const alignDiffers = !other || status === 'align' || status === 'moved'
  return (
    <span className="flex min-w-0 items-start gap-2 text-sm">
      <span className="font-display font-bold">{tag}</span>
      <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border-2" style={{ borderColor: color }} aria-hidden="true" />
      <span className="min-w-0">
        <span className={roleDiffers ? 'font-semibold text-text' : 'text-muted'}>
          {d.roleLabel}
          {d.hybrid && ' (híbrido)'}
        </span>
        <span className={['block', alignDiffers ? 'text-text' : 'text-muted'].join(' ')}>
          {d.alignLabel}, {d.auto.y.toFixed(0)} yd
        </span>
      </span>
    </span>
  )
}
