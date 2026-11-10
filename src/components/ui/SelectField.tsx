import type { Option } from './OptionGroup'

interface Props<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

/** Selector compacto con etiqueta visible. En iPad abre el picker nativo del sistema. */
export function SelectField<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <label className="grid gap-1">
      <span className="font-display text-sm font-semibold tracking-wide text-muted">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="min-h-11 w-full cursor-pointer appearance-none rounded-md border border-line bg-panel-2 py-1 pr-9 pl-3 font-display text-lg font-semibold text-text transition-colors hover:border-muted"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" aria-hidden="true">
          ▾
        </span>
      </span>
    </label>
  )
}
