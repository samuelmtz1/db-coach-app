import type { Hash, RelSide, Side } from './types'

/** Ancho del campo: 160 pies. */
export const FIELD_WIDTH = 160 / 3
/** Hashes NFHS (high school): 53'4" desde cada sideline, dividen el campo en tercios. */
export const HASH_FROM_SIDELINE = 160 / 9
/** Centro de los números (high school, aprox.). */
export const NUMBERS_FROM_SIDELINE = 8

/** Ventana visible del campo, en yardas desde la LOS. */
export const VIEW_TOP = 26
export const VIEW_BOTTOM = -8

/** Yarda en la que está la LOS, solo para pintar los números del campo. */
export const LOS_YARD_LINE = 35

/**
 * Separación entre linieros ofensivos (centro a centro). Es mayor que la real (~1.5 yd)
 * a propósito: igual que en Madden, el diagrama abre la línea para que no se encimen los círculos.
 */
export const OL_SPACING = 2.1

export function ballX(hash: Hash): number {
  if (hash === 'L') return HASH_FROM_SIDELINE
  if (hash === 'R') return FIELD_WIDTH - HASH_FROM_SIDELINE
  return FIELD_WIDTH / 2
}

export function hashX(side: Side): number {
  return side === 'L' ? HASH_FROM_SIDELINE : FIELD_WIDTH - HASH_FROM_SIDELINE
}

/** +1 si el lado está a la derecha de la pantalla, -1 si a la izquierda. */
export function sign(side: Side): number {
  return side === 'R' ? 1 : -1
}

export function resolveSide(rel: RelSide, strength: Side): Side {
  if (rel === 'S') return strength
  return strength === 'R' ? 'L' : 'R'
}

/** x del sideline de un lado. */
export function sidelineX(side: Side): number {
  return side === 'L' ? 0 : FIELD_WIDTH
}

/** Desplazamiento lateral de cada técnica respecto al balón (hacia afuera). */
const TECH_DX: Record<number, number> = {
  0: 0,
  1: OL_SPACING * 0.5,
  2: OL_SPACING,
  3: OL_SPACING * 1.5,
  4: OL_SPACING * 2,
  5: OL_SPACING * 2.5,
  6: OL_SPACING * 3,
  7: OL_SPACING * 2.75,
  9: OL_SPACING * 3.6,
}

export function techDx(tech: number): number {
  const dx = TECH_DX[tech]
  if (dx === undefined) throw new Error(`Técnica desconocida: ${tech}`)
  return dx
}

export function clampX(x: number, margin = 1): number {
  return Math.min(FIELD_WIDTH - margin, Math.max(margin, x))
}
