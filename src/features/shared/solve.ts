import { alignAgainst, alignDefense, MissingAssignmentError } from '../../engine/align'
import type { DefenseSnapshot, Hash, Overrides, ResolvedOffense } from '../../engine/types'
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
  const formation = FORMATIONS.find((f) => f.id === s.formationId)!
  return guarded(s.frontId, s.coverageId, (front, coverageId) =>
    alignDefense(front, coverageId, ASSIGNMENTS[front.id]?.[coverageId], formation, s.hash, overrides),
  )
}

/** Defensa contra una ofensiva ya colocada (whiteboard). */
export function solveAgainst(frontId: string, coverageId: string, offense: ResolvedOffense[], ball: number): SolveResult {
  return guarded(frontId, coverageId, (front, cid) => alignAgainst(front, cid, ASSIGNMENTS[front.id]?.[cid], offense, ball))
}

function guarded(
  frontId: string,
  coverageId: string,
  run: (front: (typeof FRONTS)[number], coverageId: string) => DefenseSnapshot,
): SolveResult {
  const front = FRONTS.find((f) => f.id === frontId)!
  const coverage = COVERAGES.find((c) => c.id === coverageId)!
  try {
    return { ok: true, snap: run(front, coverage.id) }
  } catch (e) {
    if (e instanceof MissingAssignmentError) {
      return { ok: false, message: `${front.name} + ${coverage.name} todavía no está cargado.` }
    }
    return { ok: false, message: e instanceof Error ? e.message : 'Error desconocido al alinear la defensa.' }
  }
}
