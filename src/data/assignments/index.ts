import type { AssignmentMatrix } from '../../engine/types'
import { a335 } from './3-3-5'
import { a344 } from './3-4-4'
import { a353 } from './3-5-3'
import { a425 } from './4-2-5'
import { a434 } from './4-3-4'
import { a533 } from './5-3-3'

// Quién hace qué en cada frente + cover: un archivo por frente.
// Si un jugador no trae `align`, usa la alineación base de su frente (data/fronts/).
// Lados: 'S' = strong, 'W' = weak (se resuelven solos según la formación).
export const ASSIGNMENTS: AssignmentMatrix = {
  '4-3-4': a434,
  '3-4-4': a344,
  '4-2-5': a425,
  '3-3-5': a335,
  '3-5-3': a353,
  '5-3-3': a533,
}
