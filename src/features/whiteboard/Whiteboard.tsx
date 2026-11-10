import { useEffect } from 'react'
import { Legend } from '../../components/field/Legend'
import { OptionGroup } from '../../components/ui/OptionGroup'
import { SnapToggle } from '../../components/ui/SnapToggle'
import { resolveBoardOffense, routeOffsets } from '../../engine/board'
import { ballX } from '../../engine/geometry'
import type { Hash } from '../../engine/types'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS } from '../../data/formations'
import { FRONTS } from '../../data/fronts'
import { ROUTES } from '../../data/routes'
import { useBoardStore, type PenColor, type Tool } from '../../store/boardStore'
import { HASH_OPTIONS } from '../coverage-lab/CoverageLab'
import { solveAgainst } from '../shared/solve'
import { BoardCanvas, PEN_COLORS } from './BoardCanvas'

const TOOLS: { value: Tool; label: string; hint: string }[] = [
  { value: 'move', label: 'Mover', hint: 'Arrastra jugadores; tócalos para elegirlos' },
  { value: 'route', label: 'Ruta a mano', hint: 'Toca el campo punto por punto para la ruta del jugador elegido' },
  { value: 'pen', label: 'Lápiz', hint: 'Dibuja libre con el dedo' },
  { value: 'erase', label: 'Borrador', hint: 'Pasa el dedo sobre un trazo, una ruta o un círculo de pre-snap' },
]

const COLOR_NAMES: Record<PenColor, string> = { white: 'Blanco', yellow: 'Amarillo', red: 'Rojo' }

const toolbarButton =
  'min-h-11 rounded-lg border border-line bg-panel px-4 font-display text-lg font-bold transition-colors hover:border-muted active:bg-line disabled:border-transparent disabled:bg-transparent disabled:text-muted/70'

export function Whiteboard() {
  const doc = useBoardStore((s) => s.doc)
  const ui = useBoardStore((s) => s.ui)
  const selectedId = useBoardStore((s) => s.selectedId)
  const canUndo = useBoardStore((s) => s.past.length > 0)
  const canRedo = useBoardStore((s) => s.future.length > 0)
  const store = useBoardStore.getState()

  const ball = ballX(doc.hash)
  const offense = resolveBoardOffense(doc.players, ball)
  const result = ui.showDefense ? solveAgainst(ui.frontId, ui.coverageId, offense, ball) : null
  const snap = result?.ok ? result.snap : null

  const selected = doc.players.find((p) => p.id === selectedId && !p.lineman)
  const selectedRoute = selected ? doc.routes[selected.id] : undefined
  const front = FRONTS.find((f) => f.id === ui.frontId)!
  const coverage = COVERAGES.find((c) => c.id === ui.coverageId)!
  const formation = FORMATIONS.find((f) => f.id === doc.formationId)

  // Teclado: ⌘Z / Ctrl+Z deshacer, ⇧⌘Z / Ctrl+Y rehacer, Espacio = snap, Escape suelta al jugador.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useBoardStore.getState()
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        s.redo()
      } else if (e.code === 'Space' && e.target === document.body && s.ui.showDefense) {
        e.preventDefault()
        s.setUi({ phase: s.ui.phase === 'pre' ? 'post' : 'pre' })
      } else if (e.key === 'Escape') {
        s.select(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const setDashed = (dashed: boolean) => {
    store.setUi({ dashed })
    // Con un jugador elegido, el estilo se aplica también a su ruta (p. ej. para marcar un motion).
    if (selected && selectedRoute && selectedRoute.dashed !== dashed) {
      store.commit((d) => ({ ...d, routes: { ...d.routes, [selected.id]: { ...d.routes[selected.id], dashed } } }))
    }
  }

  const applyRoute = (templateId: string) => {
    if (!selected) return
    const t = ROUTES.find((r) => r.id === templateId)!
    const back = offense.find((p) => p.id === selected.id)?.backfield
    const shape = back && t.backfield ? t.backfield : t
    const points = routeOffsets(shape, selected.pos, ball)
    store.commit((d) => ({ ...d, routes: { ...d.routes, [selected.id]: { points, dashed: ui.dashed, templateId } } }))
  }

  const togglePresnap = () => {
    if (!selected) return
    store.commit((d) => ({
      ...d,
      players: d.players.map((p) => (p.id === selected.id ? { ...p, presnap: p.presnap ? undefined : p.pos } : p)),
    }))
  }

  const clearRoute = () => {
    if (!selected) return
    store.commit((d) => {
      const routes = { ...d.routes }
      delete routes[selected.id]
      return { ...d, routes }
    })
  }

  const hasDrawings =
    doc.strokes.length > 0 || Object.keys(doc.routes).length > 0 || doc.players.some((p) => p.presnap)

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
      {/* En pantallas angostas la pizarra va primero; la configuración queda debajo. */}
      <aside className="order-2 grid content-start gap-5 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
        <OptionGroup
          label="Plantilla de formación"
          value={doc.formationId}
          onChange={store.loadFormation}
          columns={2}
          options={FORMATIONS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available }))}
          note="Elegir una plantilla reacomoda a la ofensiva y borra rutas y motion."
        />
        <OptionGroup<Hash>
          label="Balón en"
          value={doc.hash}
          onChange={store.setHash}
          options={HASH_OPTIONS}
          note="Todo se recorre con el balón."
        />
        <fieldset className="grid gap-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          <legend className="sr-only">Defensa</legend>
          <OptionGroup<'on' | 'off'>
            label="Defensa"
            value={ui.showDefense ? 'on' : 'off'}
            onChange={(v) => store.setUi({ showDefense: v === 'on' })}
            columns={2}
            options={[
              { value: 'on', label: 'Mostrar' },
              { value: 'off', label: 'Ocultar' },
            ]}
            note={ui.showDefense ? 'Se recalcula cuando mueves a un receptor.' : undefined}
          />
          {ui.showDefense && (
            <>
              <OptionGroup
                label="Frente"
                value={ui.frontId}
                onChange={(frontId) => store.setUi({ frontId })}
                options={FRONTS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available, hint: f.personnel }))}
              />
              <OptionGroup
                label="Cover"
                value={ui.coverageId}
                onChange={(coverageId) => store.setUi({ coverageId })}
                options={COVERAGES.map((c) => ({ value: c.id, label: c.name.replace('Cover ', 'C'), disabled: !c.available, hint: c.summary }))}
              />
            </>
          )}
        </fieldset>
      </aside>

      <section className="order-1 min-w-0 lg:order-2" aria-label="Pizarra">
        <div className="mb-3 flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="min-w-0">
            <OptionGroup<Tool>
              label="Herramienta"
              value={ui.tool}
              onChange={(tool) => store.setUi({ tool })}
              columns={4}
              options={TOOLS}
            />
          </div>
          <div className="w-44">
            <OptionGroup<'solid' | 'dashed'>
              label="Línea"
              value={ui.dashed ? 'dashed' : 'solid'}
              onChange={(v) => setDashed(v === 'dashed')}
              columns={2}
              options={[
                { value: 'solid', label: 'Sólida', hint: 'Rutas' },
                { value: 'dashed', label: 'Punteada', hint: 'Motion' },
              ]}
            />
          </div>
          <fieldset>
            <legend className="mb-2 font-display text-sm font-semibold tracking-wide text-muted">Color del lápiz</legend>
            <div className="flex gap-1.5">
              {(Object.keys(PEN_COLORS) as PenColor[]).map((c) => {
                const active = ui.color === c && ui.tool === 'pen'
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Lápiz ${COLOR_NAMES[c].toLowerCase()}`}
                    title={COLOR_NAMES[c]}
                    onClick={() => store.setUi({ color: c, tool: 'pen' })}
                    className={[
                      'grid h-11 w-11 place-items-center rounded-md border transition-colors',
                      active ? 'border-accent bg-panel-2' : 'border-line bg-panel-2 hover:border-muted',
                    ].join(' ')}
                  >
                    <span
                      className={['block h-5 w-5 rounded-full', ui.color === c ? 'ring-2 ring-text ring-offset-2 ring-offset-panel-2' : ''].join(' ')}
                      style={{ background: PEN_COLORS[c] }}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={store.undo} disabled={!canUndo} className={toolbarButton} title="⌘Z / Ctrl+Z">
              Deshacer
            </button>
            <button type="button" onClick={store.redo} disabled={!canRedo} className={toolbarButton} title="⇧⌘Z / Ctrl+Y">
              Rehacer
            </button>
            <button
              type="button"
              onClick={store.clearDrawings}
              disabled={!hasDrawings}
              className={toolbarButton}
              title="Borra rutas, motion y dibujos a mano. Se puede deshacer."
            >
              Borrar dibujos
            </button>
          </div>
        </div>

        <div className="mb-2 flex min-h-11 flex-wrap items-center justify-between gap-3">
          {/* Nada aquí arriba cambia al arrastrar: si el campo se recorriera a media jugada, el dedo caería en otra yarda. */}
          <h2 className="font-display text-2xl font-bold leading-tight">
            {formation?.name ?? 'Formación libre'}
            {ui.showDefense && (
              <>
                {' '}
                <span className="text-muted">vs</span> {front.name} · {coverage.name}
              </>
            )}
          </h2>
          {ui.showDefense && <SnapToggle phase={ui.phase} onChange={(phase) => store.setUi({ phase })} shortcut />}
        </div>

        {result && !result.ok && (
          <p role="alert" className="mb-2 rounded-lg border border-line bg-panel px-4 py-2 text-sm">
            No se puede dibujar la defensa: <span className="text-muted">{result.message}</span>
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-line">
          <BoardCanvas
            defense={snap}
            phase={ui.phase}
            label={`Whiteboard: ${formation?.name ?? 'formación'}${snap ? ` contra ${front.name} ${coverage.name}` : ''}`}
          />
        </div>
        {snap && (
          <p className="mt-1 text-sm text-muted" aria-live="polite">
            Strength: <span className="text-text">{snap.strength === 'R' ? 'derecha' : 'izquierda'}</span> · {snap.strengthReason}
          </p>
        )}

        <div className="mt-3 rounded-lg border border-line bg-panel p-4" aria-live="polite">
          {selected ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold">
                  Ruta de <span className="text-accent">{selected.label}</span>
                  {selectedRoute && (
                    <span className="ml-2 text-base font-semibold text-muted">
                      {selectedRoute.templateId ? ROUTES.find((r) => r.id === selectedRoute.templateId)?.name : 'a mano'}
                      {selectedRoute.dashed && ', punteada'}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={togglePresnap} className={toolbarButton} aria-pressed={Boolean(selected.presnap)}>
                    {selected.presnap ? 'Quitar pre-snap' : 'Marcar pre-snap'}
                  </button>
                  <button type="button" onClick={clearRoute} disabled={!selectedRoute} className={toolbarButton}>
                    Borrar ruta
                  </button>
                </div>
              </div>
              <OptionGroup
                label="Rutas"
                value={selectedRoute?.templateId ?? ''}
                onChange={applyRoute}
                columns={6}
                options={ROUTES.map((r) => ({ value: r.id, label: r.name }))}
              />
              <p className="text-sm text-muted">
                {ui.tool === 'route'
                  ? `Toca el campo para agregar puntos a la ruta de ${selected.label}.`
                  : selected.presnap
                    ? `Arrastra a ${selected.label}: la línea punteada marca el motion desde el círculo de pre-snap.`
                    : `Arrastra a ${selected.label} para moverlo. "Marcar pre-snap" deja un círculo punteado donde está ahora, para dibujar un motion.`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {ui.tool === 'route'
                ? 'Ruta a mano: primero toca a un receptor o a un back, luego toca el campo punto por punto.'
                : ui.tool === 'pen'
                  ? 'Lápiz: dibuja con el dedo. La línea sólida o punteada y el color aplican al siguiente trazo.'
                  : ui.tool === 'erase'
                    ? 'Borrador: pasa el dedo sobre un trazo, una ruta o un círculo de pre-snap.'
                    : 'Toca a un receptor o a un back para darle una ruta del menú. Arrástralo para moverlo: la defensa se ajusta sola.'}
            </p>
          )}
        </div>

        {ui.showDefense && (
          <div className="mt-3">
            <Legend />
          </div>
        )}
      </section>
    </div>
  )
}
