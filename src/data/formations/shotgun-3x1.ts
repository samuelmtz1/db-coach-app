import { OL_SPACING as OL } from '../../engine/geometry'
import type { Formation } from '../../engine/types'

// Shotgun 3x1: tres receptores a la derecha con splits normales, X solo a la izquierda.
// Los slots se reparten entre Z y el tackle (`at`: 0 = sobre Z, 1 = sobre el tackle).
export const shotgun3x1: Formation = {
  id: 'shotgun-3x1',
  name: 'Shotgun 3x1',
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
    { id: 'H', label: 'H', x: { from: 'slot', side: 'R', outside: 'Z', at: 0.4 }, y: -2, eligible: true },
    { id: 'Y', label: 'Y', x: { from: 'slot', side: 'R', outside: 'Z', at: 0.75 }, y: -2, eligible: true },
    { id: 'Z', label: 'Z', x: { from: 'sideline', side: 'R', d: 6 }, y: -1, eligible: true },
  ],
}
