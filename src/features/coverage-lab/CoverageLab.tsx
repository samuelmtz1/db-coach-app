import { useEffect, useMemo } from 'react'
import { OptionGroup } from '../../components/ui/OptionGroup'
import { SnapToggle } from '../../components/ui/SnapToggle'
import { Legend } from '../../components/field/Legend'
import { alignDefense, MissingAssignmentError } from '../../engine/align'
import type { DefenseSnapshot, Hash } from '../../engine/types'
import { ASSIGNMENTS } from '../../data/assignments'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS } from '../../data/formations'
import { FRONTS } from '../../data/fronts'
import { position } from '../../data/positions'
import { useLabStore } from '../../store/labStore'
import { Diagram } from './Diagram'

type Result = { ok: true; snap: DefenseSnapshot } | { ok: false; message: string }

export const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: 'L', label: 'Hash izq.' },
  { value: 'M', label: 'Centro' },
  { value: 'R', label: 'Hash der.' },
]

export function CoverageLab() {
  const s = useLabStore()
  const front = FRONTS.find((f) => f.id === s.frontId)!
  const coverage = COVERAGES.find((c) => c.id === s.coverageId)!
  const formation = FORMATIONS.find((f) => f.id === s.formationId)!

  const result: Result = useMemo(() => {
    try {
      const snap = alignDefense(front, coverage.id, ASSIGNMENTS[front.id]?.[coverage.id], formation, s.hash, s.overrides)
      return { ok: true, snap }
    } catch (e) {
      if (e instanceof MissingAssignmentError) {
        return { ok: false, message: `${front.name} + ${coverage.name} todavía no está cargado.` }
      }
      return { ok: false, message: e instanceof Error ? e.message : 'Error desconocido al alinear la defensa.' }
    }
  }, [front, coverage, formation, s.hash, s.overrides])

  // Barra espaciadora = snap, para presentar sin tocar la pantalla.
  const togglePhase = s.togglePhase
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        togglePhase()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePhase])

  const selected = result.ok ? result.snap.defense.find((d) => d.id === s.selectedId) : undefined
  const movedCount = Object.keys(s.overrides).length
  const title = `${front.name} · ${coverage.name} vs ${formation.name}`

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
      <aside className="grid content-start gap-5 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-1">
        <OptionGroup
          label="Frente"
          value={s.frontId}
          onChange={s.setFront}
          options={FRONTS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available, hint: f.personnel }))}
          note={front.personnel}
        />
        <OptionGroup
          label="Cover"
          value={s.coverageId}
          onChange={s.setCoverage}
          options={COVERAGES.map((c) => ({ value: c.id, label: c.name.replace('Cover ', 'C'), disabled: !c.available, hint: c.summary }))}
          note={coverage.summary}
        />
        <OptionGroup
          label="Formación ofensiva"
          value={s.formationId}
          onChange={s.setFormation}
          columns={2}
          options={FORMATIONS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available }))}
        />
        <OptionGroup<Hash> label="Balón en" value={s.hash} onChange={s.setHash} options={HASH_OPTIONS} />
      </aside>

      <section className="min-w-0" aria-label="Diagrama">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
            {result.ok && (
              <p className="text-sm text-muted">
                Strength: <span className="text-text">{result.snap.strength === 'R' ? 'derecha' : 'izquierda'}</span> ·{' '}
                {result.snap.strengthReason}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={s.resetOverrides}
              disabled={movedCount === 0}
              title="Regresa a los defensores movidos a su alineación de regla"
              className="min-h-11 rounded-lg border border-line bg-panel px-4 font-display text-lg font-bold transition-colors hover:border-muted active:bg-line disabled:border-transparent disabled:bg-transparent disabled:text-muted/70"
            >
              Reset{movedCount > 0 && ` (${movedCount})`}
            </button>
            <SnapToggle phase={s.phase} onChange={s.setPhase} shortcut />
          </div>
        </div>

        {result.ok ? (
          <div className="overflow-hidden rounded-lg border border-line">
            <Diagram
              snap={result.snap}
              phase={s.phase}
              selectedId={s.selectedId}
              onSelect={(id) => s.select(id === s.selectedId ? null : id)}
              onMove={s.moveDefender}
              label={`${title}, ${s.phase === 'pre' ? 'pre-snap' : 'post-snap'}`}
            />
          </div>
        ) : (
          <div role="alert" className="grid min-h-64 place-items-center rounded-lg border border-line bg-panel p-6 text-center">
            <p>
              <span className="block font-display text-xl font-bold">No se puede dibujar esta combinación</span>
              <span className="text-muted">{result.message}</span>
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <Legend />
          <p className="min-h-6 max-w-xl text-sm" aria-live="polite">
            {selected ? (
              <>
                <span className="font-display text-base font-bold">{position(selected.pos).name}</span>
                {selected.hybrid && <span className="text-muted"> (híbrido)</span>}
                <span className="text-muted"> · </span>
                {selected.roleLabel}
                <span className="text-muted">
                  {' '}
                  · {selected.moved ? `movido a mano, a ${selected.pre.y.toFixed(0)} yd` : `${selected.alignLabel}, ${selected.pre.y.toFixed(0)} yd`}
                </span>
              </>
            ) : (
              <span className="text-muted">
                Toca un defensor para ver su responsabilidad. En pre-snap también puedes arrastrarlo: su rol no cambia.
              </span>
            )}
          </p>
        </div>
      </section>
    </div>
  )
}
