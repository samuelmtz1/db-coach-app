import type { Front } from '../../engine/types'
import { onHash, onReceiver, tech } from '../roles'

// 4-3 Over: 4 DL, 3 LB, 2 CB + 2 S. Alineación base (2-high).
// Cada cover puede mover a cualquier jugador en assignments.ts.
export const front434: Front = {
  id: '4-3-4',
  name: '4-3-4',
  personnel: '4 DL · 3 LB · 4 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(5, 'S') },
    { id: 'DT', pos: 'DT', group: 'DL', align: tech(3, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(1, 'W') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(5, 'W') },
    { id: 'SAM', pos: 'SAM', group: 'LB', align: tech(4, 'S', 5) },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(0, 'S', 5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(4, 'W', 5) },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'SS', pos: 'SS', group: 'DB', align: onHash('S', 0, 12) },
    { id: 'FS', pos: 'FS', group: 'DB', align: onHash('W', 0, 12) },
  ],
}
