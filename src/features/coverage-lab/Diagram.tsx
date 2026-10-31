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
}

/** Dibuja ofensiva + defensa. Pre-snap: solo alineación. Post-snap: zonas, drops, man y rush. */
export function Diagram({ snap, phase, selectedId, onSelect, label, onMove }: Props) {
  const post = phase === 'post'
  const offenseById = new Map(snap.offense.map((p) => [p.id, p]))
  const zones = snap.defense.filter((d) => d.zone)

  return (
    <Field label={label}>
      {post &&
        zones.map((d) => <ZoneShape key={`z-${d.id}`} zone={d.zone!} highlighted={d.id === selectedId} />)}

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
              <g key={`a-${d.id}`}>
                <Ghost at={d.pre} />
                <Arrow from={d.pre} to={d.post} kind="drop" />
              </g>
            )
          }
          if (d.kind === 'man' && d.manTargetId) {
            const target = offenseById.get(d.manTargetId)
            return target ? <ManLine key={`m-${d.id}`} from={d.pre} to={target.pos} /> : null
          }
          if (d.kind === 'rush' || d.kind === 'blitz') {
            return <Arrow key={`r-${d.id}`} from={d.pre} to={d.post} kind={d.kind} />
          }
          return null
        })}

      {post && zones.map((d) => <ZoneLabel key={`l-${d.id}`} zone={d.zone!} />)}

      {snap.defense.map((d) => (
        <Defender
          key={d.id}
          d={d}
          at={post && d.kind === 'zone' ? d.post : d.pre}
          selected={d.id === selectedId}
          onSelect={onSelect}
          onMove={post ? undefined : onMove}
        />
      ))}
    </Field>
  )
}
