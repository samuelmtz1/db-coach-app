import { useState } from 'react'
import { SnapToggle } from '../../components/ui/SnapToggle'
import { alignDefense } from '../../engine/align'
import type { Formation, Hash, Phase } from '../../engine/types'
import { ASSIGNMENTS } from '../../data/assignments'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS, VERIFY_FORMATION_ID } from '../../data/formations'
import { FRONTS } from '../../data/fronts'
import { FIELD_COLORS, colorFor } from '../../data/theme'
import { useLabStore } from '../../store/labStore'
import { comboKey, useVerifyStore } from '../../store/verifyStore'
import { HASH_OPTIONS } from '../coverage-lab/CoverageLab'
import { Diagram } from '../coverage-lab/Diagram'
import { buildChecklist, buildSummary, comboProgress, rowState, type ChecklistRow, type Combo, type Progress } from './checklist'

type CopyStatus = 'idle' | 'copied' | 'failed'

/** El contenido no cambia mientras corre la app: las 30 tablas se calculan una vez. */
const COMBOS = buildChecklist()

export function VerifyMode() {
  const v = useVerifyStore()
  const combos = COMBOS
  const combo = combos.find((c) => c.key === comboKey(v.frontId, v.coverageId)) ?? combos[0]
  const checks = v.rows[combo.key]
  const progress = comboProgress(combo, checks)

  const [phase, setPhase] = useState<Phase>('post')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copy, setCopy] = useState<CopyStatus>('idle')

  const formation = FORMATIONS.find((f) => f.id === v.view.formationId) ?? FORMATIONS[0]
  const snap = diagramFor(combo, formation, v.view.hash)

  const summary = buildSummary(combos, v.rows, v.notes, __APP_VERSION__)
  const reviewed = combos.filter((c) => {
    const p = comboProgress(c, v.rows[c.key])
    return p.total > 0 && p.pending === 0
  }).length

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
  }

  const clearAll = () => {
    if (window.confirm('¿Borrar todas las marcas y notas guardadas en este dispositivo?')) {
      v.clearAll()
      setCopy('idle')
    }
  }

  // El link navega a #coberturas; antes deja lista la misma situación en ese tab.
  const openInLab = () => {
    const lab = useLabStore.getState()
    lab.setFront(combo.front.id)
    lab.setCoverage(combo.coverage.id)
    lab.setFormation(formation.id)
    lab.setHash(v.view.hash)
  }

  const pendingRows = combo.rows.filter((r) => {
    const st = rowState(r, checks?.[r.id])
    return st === 'pending' || st === 'changed'
  })
  const isDefaultView = formation.id === VERIFY_FORMATION_ID && v.view.hash === 'M'

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-6">
      <aside className="flex flex-col gap-4">
        <section aria-labelledby="matrix-title" className="rounded-lg border border-line bg-panel p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="matrix-title" className="font-display text-xl font-bold">
              Combinaciones
            </h2>
            <p className="text-sm text-muted">
              <span className="font-semibold text-text">{reviewed}</span> de {combos.length} revisadas
            </p>
          </div>
          <Matrix combos={combos} current={combo.key} />
          <p className="mt-2 text-xs text-muted">✔ todo OK · ✘ con correcciones · 4/11 en progreso</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              className="min-h-11 rounded-md border border-accent bg-accent px-4 font-display text-base font-bold text-ink transition-opacity hover:opacity-90 active:opacity-80"
            >
              Copiar resumen
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="min-h-11 rounded-md border border-line bg-panel-2 px-4 font-display text-base font-semibold transition-colors hover:border-muted active:bg-line"
            >
              Borrar marcas
            </button>
          </div>
          <p className="mt-2 min-h-5 text-sm" aria-live="polite">
            {copy === 'copied' && 'Resumen copiado. Pégalo en el chat con Claude.'}
            {copy === 'failed' && (
              <span className="text-[#ff8f8f]">No se pudo copiar. Ábrelo abajo y cópialo a mano.</span>
            )}
          </p>
          <details className="mt-1" open={copy === 'failed' || undefined}>
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-muted hover:text-text">
              Ver resumen
            </summary>
            <textarea
              readOnly
              value={summary}
              aria-label="Resumen de la verificación"
              rows={8}
              className="mt-1 w-full resize-y rounded-md border border-line bg-ink p-2 font-mono text-xs text-text"
              onFocus={(e) => e.currentTarget.select()}
            />
          </details>
        </section>

        {/* En pantallas anchas el diagrama se queda a la vista mientras se recorre la lista. */}
        <section aria-label="Diagrama de la combinación" className="grid gap-2 lg:sticky lg:top-4">
          {snap ? (
            <div className="overflow-hidden rounded-lg border border-line">
              <Diagram
                snap={snap}
                phase={phase}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                label={`${combo.front.name} · ${combo.coverage.name} vs ${formation.name}, ${phase === 'pre' ? 'pre-snap' : 'post-snap'}`}
              />
            </div>
          ) : (
            <p role="alert" className="rounded-lg border border-line bg-panel p-4 text-sm text-muted">
              No se puede dibujar esta combinación.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid flex-1 gap-1 text-xs font-semibold text-muted">
              Formación
              <select
                value={formation.id}
                onChange={(e) => v.setView({ formationId: e.target.value })}
                className="min-h-11 rounded-md border border-line bg-panel-2 px-2 font-display text-base font-semibold text-text"
              >
                {FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid flex-1 gap-1 text-xs font-semibold text-muted">
              Balón en
              <select
                value={v.view.hash}
                onChange={(e) => v.setView({ hash: e.target.value as Hash })}
                className="min-h-11 rounded-md border border-line bg-panel-2 px-2 font-display text-base font-semibold text-text"
              >
                {HASH_OPTIONS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <SnapToggle phase={phase} onChange={setPhase} />
          </div>
          {!isDefaultView && (
            <p className="text-xs text-muted">
              La lista sigue con Shotgun 2x2 al centro. Tus notas guardan que estabas viendo {formation.name}.
            </p>
          )}
        </section>
      </aside>

      <section aria-labelledby="combo-title" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="combo-title" className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              {combo.front.name} · {combo.coverage.name}
            </h2>
            <p className="text-sm text-muted">
              Valores con Shotgun 2x2, balón al centro · <ProgressText p={progress} />
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => pendingRows.forEach((r) => v.mark(combo.key, r.id, 'ok', r.snapshot))}
              disabled={pendingRows.length === 0}
              className="min-h-11 rounded-md border border-line bg-panel px-4 font-display text-base font-semibold transition-colors hover:border-muted active:bg-line disabled:border-transparent disabled:bg-transparent disabled:text-muted/70"
            >
              Marcar pendientes OK
            </button>
            <a
              href="#coberturas"
              onClick={openInLab}
              className="inline-flex min-h-11 items-center rounded-md border border-line bg-panel px-4 font-display text-base font-semibold transition-colors hover:border-muted active:bg-line"
            >
              Abrir en Coberturas
            </a>
          </div>
        </div>

        {combo.error ? (
          <p role="alert" className="rounded-lg border border-line bg-panel p-4">
            <span className="block font-display text-lg font-bold">Esta combinación tiene un error de contenido</span>
            <span className="text-sm text-muted">{combo.error}</span>
          </p>
        ) : (
          <ol className="grid gap-2">
            {combo.rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                comboKey={combo.key}
                selected={row.id === selectedId}
                onSelect={() => setSelectedId(row.id === selectedId ? null : row.id)}
              />
            ))}
          </ol>
        )}

        <label className="mt-4 grid gap-1 text-sm font-semibold text-muted">
          Nota general de {combo.front.name} + {combo.coverage.name}
          <textarea
            value={v.notes[combo.key]?.text ?? ''}
            onChange={(e) => v.setComboNote(combo.key, e.target.value)}
            rows={3}
            placeholder="Algo que no cabe en un solo jugador: la rotación, el número de rushers…"
            className="w-full resize-y rounded-md border border-line bg-panel-2 p-2 text-base font-normal text-text placeholder:text-muted/80"
          />
        </label>
      </section>
    </div>
  )
}

function diagramFor(combo: Combo, formation: Formation, hash: Hash) {
  try {
    return alignDefense(combo.front, combo.coverage.id, ASSIGNMENTS[combo.front.id]?.[combo.coverage.id], formation, hash)
  } catch {
    return null
  }
}

function ProgressText({ p }: { p: Progress }) {
  const parts = [`${p.ok} OK`]
  if (p.fix) parts.push(`${p.fix} por corregir`)
  if (p.pending) parts.push(`${p.pending} sin marcar`)
  return <span className="text-text">{parts.join(' · ')}</span>
}

function Matrix({ combos, current }: { combos: Combo[]; current: string }) {
  const v = useVerifyStore()
  return (
    <table className="w-full table-fixed border-separate border-spacing-1">
      <caption className="sr-only">Estado de revisión por frente y cover</caption>
      <thead>
        <tr>
          <th scope="col" className="w-[4.5rem]">
            <span className="sr-only">Frente</span>
          </th>
          {COVERAGES.map((c) => (
            <th key={c.id} scope="col" className="font-display text-sm font-semibold text-muted">
              {c.name.replace('Cover ', 'C')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {FRONTS.map((f) => (
          <tr key={f.id}>
            <th scope="row" className="pr-1 text-left font-display text-base font-bold">
              {f.name}
            </th>
            {COVERAGES.map((c) => {
              const cb = combos.find((x) => x.key === comboKey(f.id, c.id))!
              const p = comboProgress(cb, v.rows[cb.key])
              const active = cb.key === current
              const done = p.total > 0 && p.pending === 0
              const text = p.fix ? `✘ ${p.fix}` : done ? '✔' : p.ok ? `${p.ok}/${p.total}` : '·'
              const status = p.fix
                ? `${p.fix} por corregir`
                : done
                  ? 'todo OK'
                  : p.ok
                    ? `${p.ok} de ${p.total} OK`
                    : 'sin revisar'
              return (
                <td key={c.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${f.name} + ${c.name}: ${status}`}
                    onClick={() => v.selectCombo(f.id, c.id)}
                    className={[
                      'min-h-11 w-full rounded-md border font-display text-base font-bold tabular-nums transition-colors',
                      active ? 'border-accent ring-2 ring-accent' : 'border-line hover:border-muted active:bg-line',
                      p.fix ? 'bg-panel-2 text-[#ff8f8f]' : done ? 'bg-panel-2 text-text' : 'bg-ink text-muted',
                    ].join(' ')}
                  >
                    {text}
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface RowProps {
  row: ChecklistRow
  comboKey: string
  selected: boolean
  onSelect: () => void
}

function Row({ row, comboKey: key, selected, onSelect }: RowProps) {
  const v = useVerifyStore()
  const check = v.rows[key]?.[row.id]
  const st = rowState(row, check)
  const color = colorFor(row.kind, row.family)

  return (
    <li
      className={[
        'rounded-md border bg-panel p-3 transition-colors',
        selected ? 'border-accent' : st === 'fix' ? 'border-[#ff8f8f]/60' : 'border-line',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Resaltar ${row.name} en el diagrama`}
          className="flex min-h-11 min-w-0 flex-1 basis-60 items-center gap-3 rounded-md text-left"
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] font-display text-sm font-bold ${row.hybrid ? 'border-dashed' : ''}`}
            style={{
              borderColor: color,
              background: FIELD_COLORS.defense,
              color: row.hybrid ? FIELD_COLORS.hybridText : '#ffffff',
            }}
            aria-hidden="true"
          >
            {row.short}
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-tight">
              {row.name}
              {row.hybrid && <span className="ml-1.5 text-sm font-semibold text-muted">híbrido</span>}
            </span>
            <span className="block leading-snug">{row.roleLabel}</span>
            <span className="block text-sm text-muted">
              {row.alignLabel} · {row.depth} yd
            </span>
          </span>
        </button>
        <div role="group" aria-label={`Revisión de ${row.name}`} className="flex gap-1.5">
          <MarkButton active={st === 'ok'} onClick={() => v.mark(key, row.id, 'ok', row.snapshot)}>
            ✔ OK
          </MarkButton>
          <MarkButton active={st === 'fix'} tone="fix" onClick={() => v.mark(key, row.id, 'fix', row.snapshot)}>
            ✘ Corregir
          </MarkButton>
        </div>
      </div>
      {st === 'changed' && (
        <p className="mt-2 text-sm text-accent">El contenido cambió desde tu revisión. Revísalo otra vez.</p>
      )}
      {st === 'fix' && (
        <label className="mt-2 grid gap-1 text-sm font-semibold text-muted">
          ¿Qué hay que corregir?
          <textarea
            value={check?.note ?? ''}
            onChange={(e) => v.setRowNote(key, row.id, e.target.value)}
            rows={2}
            placeholder="Ej.: a 8 yd, no a 7. Por fuera del #2."
            className="w-full resize-y rounded-md border border-line bg-panel-2 p-2 text-base font-normal text-text placeholder:text-muted/80"
          />
        </label>
      )}
    </li>
  )
}

function MarkButton({
  active,
  tone = 'ok',
  onClick,
  children,
}: {
  active: boolean
  tone?: 'ok' | 'fix'
  onClick: () => void
  children: string
}) {
  const on = tone === 'ok' ? 'border-accent bg-accent text-ink' : 'border-[#ff4d4d] bg-[#ff4d4d] text-ink'
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'min-h-11 rounded-md border px-3 font-display text-base font-bold whitespace-nowrap transition-colors',
        active ? on : 'border-line bg-panel-2 text-text hover:border-muted active:bg-line',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

