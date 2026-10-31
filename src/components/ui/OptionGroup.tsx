export interface Option<T extends string> {
  value: T
  label: string
  disabled?: boolean
  hint?: string
}

interface Props<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  columns?: 2 | 3
  note?: string
}

/** Grupo de botones excluyentes (tipo radio), cómodo para el dedo en iPad. */
export function OptionGroup<T extends string>({ label, value, options, onChange, columns = 3, note }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-2 font-display text-sm font-semibold tracking-wide text-muted">{label}</legend>
      <div className={`grid gap-1.5 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              disabled={o.disabled}
              title={o.hint}
              onClick={() => onChange(o.value)}
              className={[
                'min-h-11 rounded-md border px-2 font-display text-base font-semibold transition-colors',
                active
                  ? 'border-accent bg-accent text-ink'
                  : 'border-line bg-panel-2 text-text hover:border-muted active:bg-line',
                'disabled:border-transparent disabled:bg-transparent disabled:text-muted/60',
              ].join(' ')}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {note && <p className="mt-1.5 text-xs text-muted">{note}</p>}
    </fieldset>
  )
}
