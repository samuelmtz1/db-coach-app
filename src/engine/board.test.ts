import { describe, expect, it } from 'vitest'
import { alignAgainst, alignDefense } from './align'
import { distToPolyline, outwardSign, resolveBoardOffense, routeOffsets } from './board'
import { ballX } from './geometry'
import { placeOffense } from './strength'
import { ASSIGNMENTS } from '../data/assignments'
import { FORMATIONS } from '../data/formations'
import { FRONTS } from '../data/fronts'
import { ROUTES } from '../data/routes'
import type { Hash } from './types'

const HASHES: Hash[] = ['L', 'M', 'R']
const toBoard = (formationId: string, hash: Hash) =>
  placeOffense(FORMATIONS.find((f) => f.id === formationId)!, hash).map((p) => ({
    id: p.id,
    label: p.label,
    pos: p.pos,
    eligible: p.eligible,
    lineman: p.lineman,
  }))

describe('resolveBoardOffense', () => {
  for (const f of FORMATIONS) {
    for (const hash of HASHES) {
      it(`${f.name} (hash ${hash}): reconoce a los mismos backs que la plantilla`, () => {
        const placed = placeOffense(f, hash)
        const board = resolveBoardOffense(toBoard(f.id, hash), ballX(hash))
        expect(board.map((p) => [p.id, p.backfield])).toEqual(placed.map((p) => [p.id, p.backfield]))
      })
    }
  }

  it('sin mover a nadie, la defensa sale igual que en Coberturas', () => {
    const front = FRONTS.find((f) => f.id === '4-3-4')!
    const formation = FORMATIONS.find((f) => f.id === 'shotgun-3x1')!
    const a = alignDefense(front, 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], formation, 'L')
    const b = alignAgainst(front, 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], resolveBoardOffense(toBoard('shotgun-3x1', 'L'), ballX('L')), ballX('L'))
    expect(b.defense.map((d) => d.pre)).toEqual(a.defense.map((d) => d.pre))
  })

  it('abrir al RB lo vuelve receptor y la strength cambia', () => {
    const ball = ballX('M')
    const players = toBoard('shotgun-2x2', 'M').map((p) => (p.id === 'RB' ? { ...p, pos: { x: 8, y: -1 } } : p))
    const off = resolveBoardOffense(players, ball)
    expect(off.find((p) => p.id === 'RB')!.backfield).toBe(false)
    const front = FRONTS.find((f) => f.id === '4-3-4')!
    const snap = alignAgainst(front, 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], off, ball)
    expect(snap.strength).toBe('L')
  })
})

describe('rutas', () => {
  it('son 12, con ids únicos', () => {
    expect(ROUTES).toHaveLength(12)
    expect(new Set(ROUTES.map((r) => r.id)).size).toBe(12)
  })

  it('un Out abre hacia el sideline del receptor en los dos lados', () => {
    const out = ROUTES.find((r) => r.id === 'out')!
    const ball = ballX('M')
    const left = routeOffsets(out, { x: 6, y: -1 }, ball)
    const right = routeOffsets(out, { x: 47, y: -1 }, ball)
    expect(left.at(-1)!.x).toBeLessThan(0)
    expect(right.at(-1)!.x).toBeGreaterThan(0)
    // Cruza a 10 yd de la LOS sin importar dónde arranca.
    expect(-1 + left.at(-1)!.y).toBeCloseTo(10)
  })

  it('las rutas nunca salen del campo', () => {
    const ball = ballX('L')
    for (const r of ROUTES) {
      for (const start of [{ x: 1, y: -1 }, { x: 52, y: -1 }]) {
        for (const o of routeOffsets(r, start, ball)) {
          expect(start.x + o.x).toBeGreaterThanOrEqual(0.5)
          expect(start.x + o.x).toBeLessThanOrEqual(52.9)
        }
      }
    }
  })

  it('outwardSign y distToPolyline', () => {
    expect(outwardSign({ x: 30, y: 0 }, 26.6)).toBe(1)
    expect(outwardSign({ x: 10, y: 0 }, 26.6)).toBe(-1)
    expect(distToPolyline({ x: 1, y: 1 }, [{ x: 0, y: 0 }, { x: 2, y: 0 }])).toBeCloseTo(1)
    expect(distToPolyline({ x: 0, y: 0 }, [])).toBe(Infinity)
  })
})
