import { OL_SPACING as OL } from '../../engine/geometry'
import type { Formation } from '../../engine/types'

// Empty 3x2: cinco receptores y nadie en el backfield con el QB.
// Tres a la derecha (Z, Y, F) y dos a la izquierda (X, H). F es el corredor abierto como receptor.
export const empty: Formation = {
  id: 'empty',
  name: 'Empty 3x2',
  available: true,
  players: [
    { id: 'LT', label: '', x: { from: 'ball', dx: -2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'LG', label: '', x: { from: 'ball', dx: -OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'C', label: '', x: { from: 'ball', dx: 0 }, y: -0.9, eligible: false, lineman: true },
    { id: 'RG', label: '', x: { from: 'ball', dx: OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'RT', label: '', x: { from: 'ball', dx: 2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'QB', label: 'QB', x: { from: 'ball', dx: 0 }, y: -5, eligible: false, backfield: true },
    { id: 'X', label: 'X', x: { from: 'sideline', side: 'L', d: 6 }, y: -1, eligible: true },
    { id: 'H', label: 'H', x: { from: 'slot', side: 'L', outside: 'X' }, y: -2, eligible: true },
    { id: 'Y', label: 'Y', x: { from: 'slot', side: 'R', outside: 'Z', at: 0.4 }, y: -2, eligible: true },
    { id: 'F', label: 'F', x: { from: 'slot', side: 'R', outside: 'Z', at: 0.75 }, y: -2, eligible: true },
    { id: 'Z', label: 'Z', x: { from: 'sideline', side: 'R', d: 6 }, y: -1, eligible: true },
  ],
}
