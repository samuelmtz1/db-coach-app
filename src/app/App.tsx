import { CoverageLab } from '../features/coverage-lab/CoverageLab'

const TABS = [
  { id: 'lab', label: 'Coberturas', ready: true },
  { id: 'compare', label: 'Comparar', ready: false, version: 'v1.2' },
  { id: 'whiteboard', label: 'Whiteboard', ready: false, version: 'v1.3' },
] as const

export function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 sm:px-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            DB <span className="text-accent">Coach</span>
          </h1>
          <nav aria-label="Secciones" className="-mx-4 max-w-[100vw] overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-1 whitespace-nowrap">
              {TABS.map((t) => (
                <li key={t.id}>
                  {t.ready ? (
                    <span
                      aria-current="page"
                      className="inline-flex min-h-11 items-center border-b-2 border-accent px-3 font-display text-lg font-semibold"
                    >
                      {t.label}
                    </span>
                  ) : (
                    <span className="inline-flex min-h-11 items-center px-3 font-display text-lg font-semibold text-muted">
                      {t.label}
                      <span className="ml-1.5 rounded bg-panel-2 px-1.5 text-xs text-muted">Próximamente</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[110rem] flex-1 px-4 py-4 sm:px-6">
        <CoverageLab />
      </main>

      <footer className="px-4 py-3 text-center text-xs text-muted sm:px-6">DB Coach v{__APP_VERSION__}</footer>
    </div>
  )
}
