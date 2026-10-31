import type { Front } from '../../engine/types'
import { apex, onReceiver, overBall, tech } from '../roles'

// 3-5-3: 3 DL, 5 LB, 3 DB (2 CB + FS, 1-high).
// Spur = OLB strong en el apex: en Cover 2, 4 y 6 toma el rol del safety que falta (híbrido).
// Jack = OLB weak en el borde de la línea.
export const front353: Front = {
  id: '3-5-3',
  name: '3-5-3',
  personnel: '3 DL · 5 LB · 3 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(4, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(0, 'S') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(4, 'W') },
    { id: 'SPUR', pos: 'SPUR', group: 'LB', align: apex('S', 5) },
    { id: 'SAM', pos: 'SAM', group: 'LB', align: tech(3, 'S', 5) },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(0, 'S', 5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(3, 'W', 5) },
    { id: 'JACK', pos: 'JACK', group: 'LB', align: tech(9, 'W') },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'FS', pos: 'FS', group: 'DB', align: overBall(0, 12) },
  ],
}
