import type { Front } from '../../engine/types'
import { front434 } from './4-3-4'

const upcoming = (id: string, personnel: string): Front => ({
  id,
  name: id,
  personnel,
  available: false,
  players: [],
})

/** Orden en el que aparecen en el selector. */
export const FRONTS: Front[] = [
  front434,
  upcoming('3-4-4', '3 DL · 4 LB · 4 DB'),
  upcoming('4-2-5', '4 DL · 2 LB · 5 DB'),
  upcoming('3-3-5', '3 DL · 3 LB · 5 DB'),
  upcoming('3-5-3', '3 DL · 5 LB · 3 DB'),
  upcoming('5-3-3', '5 DL · 3 LB · 3 DB'),
]
