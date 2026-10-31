import { describe, expect, it } from 'vitest'
import { alignDefense, MissingAssignmentError } from './align'
import { FIELD_WIDTH, VIEW_TOP } from './geometry'
import { detectStrength, placeOffense } from './strength'
import { ASSIGNMENTS } from '../data/assignments'
import { COVERAGES } from '../data/coverages'
import { FORMATIONS } from '../data/formations'
import { FRONTS } from '../data/fronts'
import type { Hash } from './types'

const HASHES: Hash[] = ['L', 'M', 'R']
const shotgun2x2 = FORMATIONS.find((f) => f.id === 'shotgun-2x2')!

describe('strength', () => {
  it('2x2 en hash izquierdo: strength al field (derecha)', () => {
    const off = placeOffense(shotgun2x2, 'L')
    const r = detectStrength(off, off.find((p) => p.id === 'C')!.pos.x)
    expect(r.strength).toBe('R')
    expect(r.receivers.R.map((p) => p.id)).toEqual(['Z', 'Y'])
    expect(r.receivers.L.map((p) => p.id)).toEqual(['X', 'H'])
  })

  it('2x2 en hash derecho: strength a la izquierda', () => {
    const off = placeOffense(shotgun2x2, 'R')
    const r = detectStrength(off, off.find((p) => p.id === 'C')!.pos.x)
    expect(r.strength).toBe('L')
  })

  it('el slot queda entre el receptor abierto y el tackle', () => {
    for (const hash of HASHES) {
      const off = placeOffense(shotgun2x2, hash)
      const x = (id: string) => off.find((p) => p.id === id)!.pos.x
      expect(x('X')).toBeLessThan(x('H'))
      expect(x('H')).toBeLessThan(x('LT'))
      expect(x('RT')).toBeLessThan(x('Y'))
      expect(x('Y')).toBeLessThan(x('Z'))
    }
  })
})

describe('alignDefense', () => {
  const combos = FRONTS.filter((f) => f.available).flatMap((front) =>
    COVERAGES.filter((c) => c.available && ASSIGNMENTS[front.id]?.[c.id]).map((c) => ({ front, c })),
  )

  it('hay al menos una combinación disponible', () => {
    expect(combos.length).toBeGreaterThan(0)
  })

  for (const { front, c } of combos) {
    for (const hash of HASHES) {
      it(`${front.name} + ${c.name} (hash ${hash}): 11 defensores dentro del campo`, () => {
        const snap = alignDefense(front, c.id, ASSIGNMENTS[front.id][c.id], shotgun2x2, hash)
        expect(snap.defense).toHaveLength(11)
        expect(snap.offense).toHaveLength(11)
        for (const d of snap.defense) {
          for (const p of [d.pre, d.post]) {
            expect(p.x).toBeGreaterThanOrEqual(0)
            expect(p.x).toBeLessThanOrEqual(FIELD_WIDTH)
            expect(p.y).toBeLessThanOrEqual(VIEW_TOP)
          }
          expect(d.pre.y).toBeGreaterThan(0)
        }
      })
    }
  }

  it('Cover 3: 3 deep thirds, 4 underneath, 4 rush', () => {
    const front = FRONTS.find((f) => f.id === '4-3-4')!
    const snap = alignDefense(front, 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], shotgun2x2, 'L')
    const deep = snap.defense.filter((d) => d.zone?.family === 'deep')
    const under = snap.defense.filter((d) => d.kind === 'zone' && d.zone?.family !== 'deep')
    const rush = snap.defense.filter((d) => d.kind === 'rush')
    expect(deep.map((d) => d.zone!.label).sort()).toEqual(['Deep 1/3', 'Deep 1/3 Strong', 'Deep 1/3 Weak'])
    expect(under).toHaveLength(4)
    expect(rush).toHaveLength(4)
    // Con strength a la derecha, el CB strong cubre el tercio derecho.
    const cbs = snap.defense.find((d) => d.id === 'CB_S')!
    expect(cbs.zone!.center.x).toBeGreaterThan(FIELD_WIDTH / 2)
  })

  it('combinación sin asignaciones lanza MissingAssignmentError', () => {
    const front = FRONTS.find((f) => f.id === '4-3-4')!
    expect(() => alignDefense(front, 'cover-9', undefined, shotgun2x2, 'M')).toThrow(MissingAssignmentError)
  })
})
