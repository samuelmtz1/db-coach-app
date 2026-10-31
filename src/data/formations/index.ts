import type { Formation } from '../../engine/types'
import { shotgun2x2 } from './shotgun-2x2'

const upcoming = (id: string, name: string): Formation => ({ id, name, available: false, players: [] })

export const FORMATIONS: Formation[] = [
  shotgun2x2,
  upcoming('shotgun-3x1', 'Shotgun 3x1'),
  upcoming('trips', 'Trips'),
  upcoming('bunch', 'Bunch'),
  upcoming('pro-i', 'Pro / I-Form'),
  upcoming('empty', 'Empty 3x2'),
]
