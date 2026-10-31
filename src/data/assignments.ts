import type { AssignmentMatrix } from '../engine/types'
import { RUSH, apex, onReceiver, overBall, zone } from './roles'

// Quién hace qué en cada frente + cover.
// Si un jugador no trae `align`, usa la alineación base de su frente (data/fronts/).
// Lados: 'S' = strong, 'W' = weak (se resuelven solos según la formación).
export const ASSIGNMENTS: AssignmentMatrix = {
  '4-3-4': {
    'cover-3': {
      DE_S: { role: RUSH },
      DT: { role: RUSH },
      NT: { role: RUSH },
      DE_W: { role: RUSH },
      SAM: { role: zone('hookCurl', 'S') },
      MIKE: { role: zone('hookCurl', 'W') },
      WILL: { role: zone('curlFlat', 'W'), align: apex('W', 5) },
      SS: { role: zone('curlFlat', 'S'), align: apex('S', 7) },
      CB_S: { role: zone('deepThird', 'S'), align: onReceiver('S1', 1, 7) },
      CB_W: { role: zone('deepThird', 'W'), align: onReceiver('W1', 1, 7) },
      FS: { role: zone('deepThird', 'M'), align: overBall(0, 13) },
    },
  },
}
