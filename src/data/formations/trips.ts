import { OL_SPACING as OL } from '../../engine/geometry'
import type { Formation } from '../../engine/types'

// Trips cerrado: los tres receptores de la derecha pegados entre sí (a 3.5 yd),
// con el #3 (Y) en split reducido, cerca del tackle. Se miden desde el balón, no desde el sideline.
export const trips: Formation = {
  id: 'trips',
  name: 'Trips',
  available: true,
  players: [
    { id: 'LT', label: '', x: { from: 'ball', dx: -2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'LG', label: '', x: { from: 'ball', dx: -OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'C', label: '', x: { from: 'ball', dx: 0 }, y: -0.9, eligible: false, lineman: true },
    { id: 'RG', label: '', x: { from: 'ball', dx: OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'RT', label: '', x: { from: 'ball', dx: 2 * OL }, y: -0.9, eligible: false, lineman: true },
    { id: 'QB', label: 'QB', x: { from: 'ball', dx: 0 }, y: -5, eligible: false, backfield: true },
    { id: 'RB', label: 'RB', x: { from: 'ball', dx: -2.3 }, y: -5, eligible: true, backfield: true },
    { id: 'X', label: 'X', x: { from: 'sideline', side: 'L', d: 6 }, y: -1, eligible: true },
    { id: 'Y', label: 'Y', x: { from: 'ball', dx: 7.5 }, y: -2, eligible: true },
    { id: 'H', label: 'H', x: { from: 'ball', dx: 11 }, y: -2, eligible: true },
    { id: 'Z', label: 'Z', x: { from: 'ball', dx: 14.5 }, y: -1, eligible: true },
  ],
}
