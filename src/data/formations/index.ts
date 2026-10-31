import type { Formation } from '../../engine/types'
import { bunch } from './bunch'
import { empty } from './empty'
import { proI } from './pro-i'
import { shotgun2x2 } from './shotgun-2x2'
import { shotgun3x1 } from './shotgun-3x1'
import { trips } from './trips'

/** Orden en el que aparecen en el selector. */
export const FORMATIONS: Formation[] = [shotgun2x2, shotgun3x1, trips, bunch, proI, empty]

/** Formación contra la que se verifica el contenido (modo Verificar). */
export const VERIFY_FORMATION_ID = 'shotgun-2x2'
