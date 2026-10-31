import type { Front } from '../../engine/types'
import { onHash, onReceiver, tech } from '../roles'

// 4-2-5: 4 DL, 2 LB, 5 DB. El Nickel juega del lado de la strength, sobre el slot fuerte (#2 strong).
export const front425: Front = {
  id: '4-2-5',
  name: '4-2-5',
  personnel: '4 DL · 2 LB · 5 DB',
  available: true,
  players: [
    { id: 'DE_S', pos: 'DE', group: 'DL', align: tech(5, 'S') },
    { id: 'DT', pos: 'DT', group: 'DL', align: tech(3, 'S') },
    { id: 'NT', pos: 'NT', group: 'DL', align: tech(1, 'W') },
    { id: 'DE_W', pos: 'DE', group: 'DL', align: tech(5, 'W') },
    { id: 'MIKE', pos: 'MIKE', group: 'LB', align: tech(2, 'S', 5) },
    { id: 'WILL', pos: 'WILL', group: 'LB', align: tech(2, 'W', 5) },
    { id: 'NICKEL', pos: 'NICKEL', group: 'DB', align: onReceiver('S2', 0, 5) },
    { id: 'CB_S', pos: 'CB', group: 'DB', align: onReceiver('S1', 0, 7) },
    { id: 'CB_W', pos: 'CB', group: 'DB', align: onReceiver('W1', 0, 7) },
    { id: 'SS', pos: 'SS', group: 'DB', align: onHash('S', 0, 12) },
    { id: 'FS', pos: 'FS', group: 'DB', align: onHash('W', 0, 12) },
  ],
}
