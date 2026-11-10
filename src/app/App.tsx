import { useEffect, useState } from 'react'
import { ComparePage } from '../features/compare/ComparePage'
import { CoverageLab } from '../features/coverage-lab/CoverageLab'
import { VerifyMode } from '../features/verify/VerifyMode'
import { Whiteboard } from '../features/whiteboard/Whiteboard'

type Route = 'coberturas' | 'comparar' | 'whiteboard' | 'verificar'

const TABS: { id: Route; label: string }[] = [
  { id: 'coberturas', label: 'Coberturas' },
  { id: 'comparar', label: 'Comparar' },
  { id: 'whiteboard', label: 'Whiteboard' },
  { id: 'verificar', label: 'Verificar' },
]

const ROUTES = TABS.map((t) => t.id)

/** El tab vive en la URL (#comparar) para que recargar o compartir el link abra el mismo tab. */
function useRoute(): Route {
  const read = (): Route => ROUTES.find((r) => window.location.hash === `#${r}`) ?? 'coberturas'
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const onHash = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export function App() {
  const route = useRoute()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-8 gap-y-1 px-4 py-2 sm:px-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            DB <span className="text-accent">Coach</span>
          </h1>
          <nav aria-label="Secciones" className="-mx-4 max-w-[100vw] overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-1 whitespace-nowrap">
              {TABS.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    aria-current={route === t.id ? 'page' : undefined}
                    className={[
                      'inline-flex min-h-11 items-center border-b-2 px-3 font-display text-lg font-semibold transition-colors',
                      route === t.id ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text',
                    ].join(' ')}
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[110rem] flex-1 px-4 py-4 sm:px-6">
        {route === 'verificar' ? (
          <VerifyMode />
        ) : route === 'comparar' ? (
          <ComparePage />
        ) : route === 'whiteboard' ? (
          <Whiteboard />
        ) : (
          <CoverageLab />
        )}
      </main>

      <footer className="px-4 py-3 text-center text-xs text-muted sm:px-6">DB Coach v{__APP_VERSION__}</footer>
    </div>
  )
}
