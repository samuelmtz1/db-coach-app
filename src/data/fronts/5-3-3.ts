import type { Front } from '../../engine/types'
import { apex, onReceiver, overBall, tech } from '../roles'

// 5-3-3: 5 DL (NT en 0, DTs en 2-tech, DEs en 5-tech), 3 LB, 3 DB (2 CB + FS, 1-high).
// Bandit = OLB strong en el apex: en Cover 2, 4 y 6 toma el rol del safety que falta (híbrido).
export const front533: Front = {
  id: '5-3-3',
  name: '5-3-3',
  personnel: '5 DL · 3 LB · 3 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(5, 'S') },
    { id: 'DT_S', pos: 'DT', group: 'DL', align: tech(2, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(0, 'S') },
    { id: 'DT_W', pos: 'DT', group: 'DL', align: tech(2, 'W') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(5, 'W') },
    { id: 'BANDIT', pos: 'BANDIT', group: 'LB', align: apex('S', 5) },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(0, 'S', 5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(4, 'W', 5) },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'FS', pos: 'FS', group: 'DB', align: overBall(0, 12) },
  ],
}
