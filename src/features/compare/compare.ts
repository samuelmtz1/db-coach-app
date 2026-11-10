import type { Option } from '../../components/ui/OptionGroup'
import type { Hash } from '../../engine/types'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS } from '../../data/formations'
import { FRONTS } from '../../data/fronts'
import type { CompareDim } from '../../store/compareStore'
import type { Situation } from '../shared/solve'

export const HASH_LABELS: Record<Hash, string> = { L: 'Hash izq.', M: 'Centro', R: 'Hash der.' }

interface DimInfo {
  label: string
  key: keyof Situation
  options: Option<string>[]
  /** Etiquetas cortas para los botones de A y B, que tienen menos ancho. */
  short?: (label: string) => string
}

export const DIMS: Record<CompareDim, DimInfo> = {
  coverage: {
    label: 'Cover',
    key: 'coverageId',
    options: COVERAGES.map((c) => ({ value: c.id, label: c.name, disabled: !c.available, hint: c.summary })),
    short: (label) => label.replace('Cover ', 'C'),
  },
  formation: {
    label: 'Formación',
    key: 'formationId',
    options: FORMATIONS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available })),
    short: (label) => label.replace('Shotgun ', '').replace(' / I-Form', ' / I'),
  },
  front: {
    label: 'Frente',
    key: 'frontId',
    options: FRONTS.map((f) => ({ value: f.id, label: f.name, disabled: !f.available, hint: f.personnel })),
  },
  hash: {
    label: 'Hash',
    key: 'hash',
    options: (['L', 'M', 'R'] as const).map((h) => ({ value: h, label: HASH_LABELS[h] })),
  },
}

export const DIM_ORDER: CompareDim[] = ['coverage', 'formation', 'front', 'hash']

/** Situación de un campo: la base, con la dimensión que cambia puesta en `value`. */
export function sideSituation(base: Situation, dim: CompareDim, value: string): Situation {
  return { ...base, [DIMS[dim].key]: value }
}

/** El siguiente valor disponible después de `value`, para que A y B arranquen distintos. */
export function nextOption(dim: CompareDim, value: string): string {
  const opts = DIMS[dim].options.filter((o) => !o.disabled)
  const i = opts.findIndex((o) => o.value === value)
  return opts[(i + 1) % opts.length].value
}

/** Opciones para los botones de A y B, con la etiqueta corta si la dimensión tiene una. */
export function paneOptions(dim: CompareDim): Option<string>[] {
  const short = DIMS[dim].short
  return short ? DIMS[dim].options.map((o) => ({ ...o, label: short(o.label), hint: o.hint ?? o.label })) : DIMS[dim].options
}

export function optionLabel(dim: CompareDim, value: string): string {
  return DIMS[dim].options.find((o) => o.value === value)?.label ?? value
}
