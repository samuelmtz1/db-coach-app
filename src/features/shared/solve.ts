import { alignDefense, MissingAssignmentError } from '../../engine/align'
import type { DefenseSnapshot, Hash, Overrides } from '../../engine/types'
import { ASSIGNMENTS } from '../../data/assignments'
import { COVERAGES } from '../../data/coverages'
import { FORMATIONS } from '../../data/formations'
import { FRONTS } from '../../data/fronts'

/** Frente + cover + formación + hash: todo lo que define un diagrama. */
export interface Situation {
  frontId: string
  coverageId: string
  formationId: string
  hash: Hash
}

export type SolveResult = { ok: true; snap: DefenseSnapshot } | { ok: false; message: string }

/** Une los datos con el motor. Si la combinación no está cargada, regresa el aviso para la UI. */
export function solve(s: Situation, overrides: Overrides = {}): SolveResult {
  const front = FRONTS.find((f) => f.id === s.frontId)!
  const coverage = COVERAGES.find((c) => c.id === s.coverageId)!
  const formation = FORMATIONS.find((f) => f.id === s.formationId)!
  try {
    const snap = alignDefense(front, coverage.id, ASSIGNMENTS[front.id]?.[coverage.id], formation, s.hash, overrides)
    return { ok: true, snap }
  } catch (e) {
    if (e instanceof MissingAssignmentError) {
      return { ok: false, message: `${front.name} + ${coverage.name} todavía no está cargado.` }
    }
    return { ok: false, message: e instanceof Error ? e.message : 'Error desconocido al alinear la defensa.' }
  }
}
