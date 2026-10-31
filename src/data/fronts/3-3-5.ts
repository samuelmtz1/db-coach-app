import type { Front } from '../../engine/types'
import { onHash, onReceiver, tech } from '../roles'

// 3-3-5 Stack: 3 DL, 3 LB apilados detrás de la DL, 5 DB.
// El Nickel juega del lado de la strength, sobre el slot fuerte (#2 strong).
export const front335: Front = {
  id: '3-3-5',
  name: '3-3-5',
  personnel: '3 DL · 3 LB · 5 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(4, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(0, 'S') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(4, 'W') },
    { id: 'SAM', pos: 'SAM', group: 'LB', align: tech(4, 'S', 4.5) },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(0, 'S', 4.5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(4, 'W', 4.5) },
    { id: 'NICKEL', pos: 'NICKEL', group: 'DB', align: onReceiver('S2', 0, 5) },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'SS', pos: 'SS', group: 'DB', align: onHash('S', 0, 12) },
    { id: 'FS', pos: 'FS', group: 'DB', align: onHash('W', 0, 12) },
  ],
}
