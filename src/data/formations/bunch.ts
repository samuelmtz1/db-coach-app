import { OL_SPACING as OL } from '../../engine/geometry'
import type { Formation } from '../../engine/types'

// Bunch a la derecha: H en el punto (en la línea), Z y Y un paso atrás, por fuera y por dentro.
// Numeración de afuera hacia adentro: Z #1, H #2, Y #3.
export const bunch: Formation = {
  id: 'bunch',
  name: 'Bunch',
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
    { id: 'Y', label: 'Y', x: { from: 'ball', dx: 7.2 }, y: -2.6, eligible: true },
    { id: 'H', label: 'H', x: { from: 'ball', dx: 9 }, y: -1, eligible: true },
    { id: 'Z', label: 'Z', x: { from: 'ball', dx: 10.8 }, y: -2.6, eligible: true },
  ],
}
