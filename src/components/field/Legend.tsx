import { FIELD_COLORS, ROLE_COLORS, ZONE_COLORS } from '../../data/theme'

const ITEMS = [
  { label: 'Deep', color: ZONE_COLORS.deep, shape: 'zone' },
  { label: 'Hook/Curl', color: ZONE_COLORS.hook, shape: 'zone' },
  { label: 'Flat · Curl/Flat', color: ZONE_COLORS.flat, shape: 'zone' },
  { label: 'Man', color: ROLE_COLORS.man, shape: 'line' },
  { label: 'Rush', color: ROLE_COLORS.rush, shape: 'line' },
  { label: 'Blitz', color: ROLE_COLORS.blitz, shape: 'line' },
] as const

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Leyenda de colores">
      {ITEMS.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          {it.shape === 'zone' ? (
            <span
              className="inline-block h-3 w-5 rounded-full border-2"
              style={{ borderColor: it.color, background: `${it.color}55` }}
              aria-hidden="true"
            />
          ) : (
            <span className="inline-block h-0.5 w-5" style={{ background: it.color }} aria-hidden="true" />
          )}
          {it.label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span
          className="inline-grid h-5 w-5 place-items-center rounded-full border-2 border-dashed bg-[#0f1724] font-display text-[0.7rem] font-bold leading-none"
          style={{ borderColor: ZONE_COLORS.deep, color: FIELD_COLORS.hybridText }}
          aria-hidden="true"
        >
          SP
        </span>
        Híbrido (LB en rol de DB)
      </li>
    </ul>
  )
}
