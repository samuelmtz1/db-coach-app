import { Field } from '../../components/field/Field'
import { Arrow, ManLine, ZoneLabel, ZoneShape } from '../../components/field/Overlays'
import { Ball, Defender, Ghost, OffensePlayer } from '../../components/field/Players'
import type { DefenseSnapshot, Phase, Point } from '../../engine/types'

interface Props {
  snap: DefenseSnapshot
  phase: Phase
  selectedId: string | null
  onSelect: (id: string) => void
  label: string
  /** Si existe, en pre-snap los defensores se pueden arrastrar. */
  onMove?: (id: string, to: Point) => void
  /**
   * Modo Comparar: los defensores de este set quedan resaltados y el resto se atenúa
   * (con sus zonas y flechas). Sin este prop, todos se ven igual.
   */
  highlight?: Set<string>
}

/** Opacidad de lo que no cambia cuando hay resaltado. */
const DIMMED = 0.28

/** Dibuja ofensiva + defensa. Pre-snap: solo alineación. Post-snap: zonas, drops, man y rush. */
export function Diagram({ snap, phase, selectedId, onSelect, label, onMove, highlight }: Props) {
  const post = phase === 'post'
  const offenseById = new Map(snap.offense.map((p) => [p.id, p]))
  // Las zonas resaltadas se pintan al final para que queden encima de las atenuadas.
  const dimmed = (id: string) => Boolean(highlight && !highlight.has(id))
  const zones = snap.defense.filter((d) => d.zone).sort((a, b) => Number(dimmed(b.id)) - Number(dimmed(a.id)))
  const op = (id: string) => (dimmed(id) ? DIMMED : undefined)

  return (
    <Field label={label}>
      {post &&
        zones.map((d) => (
          <g key={`z-${d.id}`} opacity={op(d.id)}>
            <ZoneShape zone={d.zone!} highlighted={d.id === selectedId} />
          </g>
        ))}

      {snap.offense.map((p) => (
        <OffensePlayer key={p.id} player={p} />
      ))}
      <Ball at={snap.ball} />

      {/* Pre-snap: la silueta marca dónde lo pone la regla cuando el coach lo movió. */}
      {!post && snap.defense.filter((d) => d.moved).map((d) => <Ghost key={`g-${d.id}`} at={d.auto} />)}

      {post &&
        snap.defense.map((d) => {
          if (d.kind === 'zone') {
            return (
              <g key={`a-${d.id}`} opacity={op(d.id)}>
                <Ghost at={d.pre} />
                <Arrow from={d.pre} to={d.post} kind="drop" />
              </g>
            )
          }
          if (d.kind === 'man' && d.manTargetId) {
            const target = offenseById.get(d.manTargetId)
            return target ? (
              <g key={`m-${d.id}`} opacity={op(d.id)}>
                <ManLine from={d.pre} to={target.pos} />
              </g>
            ) : null
          }
          if (d.kind === 'rush' || d.kind === 'blitz') {
            return (
              <g key={`r-${d.id}`} opacity={op(d.id)}>
                <Arrow from={d.pre} to={d.post} kind={d.kind} />
              </g>
            )
          }
          return null
        })}

      {post &&
        zones.map((d) => (
          <g key={`l-${d.id}`} opacity={op(d.id)}>
            <ZoneLabel zone={d.zone!} />
          </g>
        ))}

      {snap.defense.map((d) => (
        <Defender
          key={d.id}
          d={d}
          at={post && d.kind === 'zone' ? d.post : d.pre}
          selected={d.id === selectedId}
          dimmed={dimmed(d.id)}
          marked={Boolean(highlight?.has(d.id))}
          onSelect={onSelect}
          onMove={post ? undefined : onMove}
        />
      ))}
    </Field>
  )
}
