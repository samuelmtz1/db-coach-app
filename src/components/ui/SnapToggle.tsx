import type { Phase } from '../../engine/types'

/** Pre-snap / Post-snap. `shortcut` muestra la pista de la barra espaciadora en equipos con teclado. */
export function SnapToggle({ phase, onChange, shortcut = false }: { phase: Phase; onChange: (p: Phase) => void; shortcut?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="Momento de la jugada" className="flex rounded-lg border border-line bg-panel p-1">
        {(['pre', 'post'] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={phase === p}
            onClick={() => onChange(p)}
            className={[
              'min-h-11 rounded-md px-4 font-display text-lg font-bold transition-colors',
              phase === p ? 'bg-accent text-ink' : 'text-muted hover:text-text active:bg-line',
            ].join(' ')}
          >
            {p === 'pre' ? 'Pre-snap' : 'Post-snap'}
          </button>
        ))}
      </div>
      {shortcut && (
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-xs text-muted [@media(hover:hover)]:inline">
          Espacio
        </kbd>
      )}
    </div>
  )
}
