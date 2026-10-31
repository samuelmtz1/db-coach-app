import type { Front } from '../../engine/types'
import { apex, onHash, onReceiver, tech } from '../roles'

// 3-4 Okie: 3 DL (DEs en 4-tech, NT en 0), 4 LB, 2 CB + 2 S. Alineación base (2-high).
// Sam es el OLB del lado strong (en el apex); Jack, el OLB weak, en el borde de la línea.
export const front344: Front = {
  id: '3-4-4',
  name: '3-4-4',
  personnel: '3 DL · 4 LB · 4 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(4, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(0, 'S') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(4, 'W') },
    { id: 'SAM', pos: 'SAM', group: 'LB', align: apex('S', 4) },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(2, 'S', 5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(2, 'W', 5) },
    { id: 'JACK', pos: 'JACK', group: 'LB', align: tech(9, 'W') },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'SS', pos: 'SS', group: 'DB', align: onHash('S', 0, 12) },
    { id: 'FS', pos: 'FS', group: 'DB', align: onHash('W', 0, 12) },
  ],
}
