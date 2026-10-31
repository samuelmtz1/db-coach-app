import { OL_SPACING as OL } from '../../engine/geometry'
import type { Formation } from '../../engine/types'

// Pro / I-Form: TE pegado a la derecha, QB bajo center, FB y RB en I.
// Z es flanker (fuera de la línea) porque el TE cierra la línea de ese lado. Strength = lado del TE.
export const proI: Formation = {
  id: 'pro-i',
  name: 'Pro / I-Form',
  available: true,
  players: [
    { id: 'LT', label: '', x: { from: 'ball', dx: -2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'LG', label: '', x: { from: 'ball', dx: -OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'C', label: '', x: { from: 'ball', dx: 0 }, y: -0.9, eligible: false, lineman: true },
    { id: 'RG', label: '', x: { from: 'ball', dx: OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'RT', label: '', x: { from: 'ball', dx: 2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'TE', label: 'TE', x: { from: 'ball', dx: 3 * OL }, y: -0.9, eligible: true },
    { id: 'QB', label: 'QB', x: { from: 'ball', dx: 0 }, y: -2.6, eligible: false, backfield: true },
    { id: 'FB', label: 'FB', x: { from: 'ball', dx: 0 }, y: -4.7, eligible: true, backfield: true },
    { id: 'RB', label: 'RB', x: { from: 'ball', dx: 0 }, y: -6.9, eligible: true, backfield: true },
    { id: 'X', label: 'X', x: { from: 'sideline', side: 'L', d: 6 }, y: -1, eligible: true },
    { id: 'Z', label: 'Z', x: { from: 'sideline', side: 'R', d: 6 }, y: -2, eligible: true },
  ],
}
