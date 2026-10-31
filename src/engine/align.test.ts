import { describe, expect, it } from 'vitest'
import { alignDefense, MissingAssignmentError, separate } from './align'
import { FIELD_WIDTH, VIEW_BOTTOM, VIEW_TOP } from './geometry'
import { detectStrength, placeOffense } from './strength'
import { ASSIGNMENTS } from '../data/assignments'
import { COVERAGES } from '../data/coverages'
import { FORMATIONS } from '../data/formations'
import { FRONTS } from '../data/fronts'
import { POSITIONS } from '../data/positions'
import type { DefenseSnapshot, Hash } from './types'

const HASHES: Hash[] = ['L', 'M', 'R']
const formation = (id: string) => FORMATIONS.find((f) => f.id === id)!
const front = (id: string) => FRONTS.find((f) => f.id === id)!
const shotgun2x2 = formation('shotgun-2x2')

function snap(frontId: string, coverId: string, formationId = 'shotgun-2x2', hash: Hash = 'M'): DefenseSnapshot {
  return alignDefense(front(frontId), coverId, ASSIGNMENTS[frontId][coverId], formation(formationId), hash)
}

function strengthOf(formationId: string, hash: Hash) {
  const off = placeOffense(formation(formationId), hash)
  return detectStrength(off, off.find((p) => p.id === 'C')!.pos.x)
}

describe('formaciones', () => {
  it('las 6 formaciones están disponibles', () => {
    expect(FORMATIONS.map((f) => f.id)).toEqual(['shotgun-2x2', 'shotgun-3x1', 'trips', 'bunch', 'pro-i', 'empty'])
    expect(FORMATIONS.every((f) => f.available)).toBe(true)
  })

  for (const f of FORMATIONS) {
    for (const hash of HASHES) {
      it(`${f.name} (hash ${hash}): 11 jugadores dentro del campo, sin encimarse`, () => {
        const off = placeOffense(f, hash)
        expect(off).toHaveLength(11)
        expect(off.filter((p) => p.lineman)).toHaveLength(5)
        for (const p of off) {
          expect(p.pos.x).toBeGreaterThanOrEqual(1)
          expect(p.pos.x).toBeLessThanOrEqual(FIELD_WIDTH - 1)
          expect(p.pos.y).toBeGreaterThanOrEqual(VIEW_BOTTOM + 1)
        }
        // Receptores y backs (r = 1): sin taparse entre sí.
        const skill = off.filter((p) => !p.lineman)
        for (let i = 0; i < skill.length; i++) {
          for (let j = i + 1; j < skill.length; j++) {
            const d = Math.hypot(skill[i].pos.x - skill[j].pos.x, skill[i].pos.y - skill[j].pos.y)
            expect(d, `${skill[i].id}-${skill[j].id}`).toBeGreaterThanOrEqual(1.8)
          }
        }
      })
    }
  }
})

describe('strength', () => {
  it('2x2 en hash izquierdo: strength al field (derecha)', () => {
    const r = strengthOf('shotgun-2x2', 'L')
    expect(r.strength).toBe('R')
    expect(r.receivers.R.map((p) => p.id)).toEqual(['Z', 'Y'])
    expect(r.receivers.L.map((p) => p.id)).toEqual(['X', 'H'])
  })

  it('2x2 en hash derecho: strength a la izquierda', () => {
    expect(strengthOf('shotgun-2x2', 'R').strength).toBe('L')
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

  it('3x1, Trips, Bunch y Empty: strength al lado de los 3 receptores en cualquier hash', () => {
    for (const id of ['shotgun-3x1', 'trips', 'bunch', 'empty']) {
      for (const hash of HASHES) {
        const r = strengthOf(id, hash)
        expect(r.strength, `${id} ${hash}`).toBe('R')
        expect(r.receivers.R, `${id} ${hash}`).toHaveLength(3)
      }
    }
  })

  it('numeración de afuera hacia adentro en Trips y Bunch', () => {
    expect(strengthOf('trips', 'M').receivers.R.map((p) => p.id)).toEqual(['Z', 'H', 'Y'])
    expect(strengthOf('bunch', 'M').receivers.R.map((p) => p.id)).toEqual(['Z', 'H', 'Y'])
    expect(strengthOf('shotgun-3x1', 'M').receivers.R.map((p) => p.id)).toEqual(['Z', 'H', 'Y'])
  })

  it('Pro / I-Form: strength al lado del TE; el TE es el #2 strong', () => {
    for (const hash of HASHES) {
      const r = strengthOf('pro-i', hash)
      expect(r.strength).toBe('R')
      expect(r.receivers.R.map((p) => p.id)).toEqual(['Z', 'TE'])
    }
  })
})

describe('contenido', () => {
  it('6 frentes y 5 covers disponibles', () => {
    expect(FRONTS.map((f) => f.id)).toEqual(['4-3-4', '3-4-4', '4-2-5', '3-3-5', '3-5-3', '5-3-3'])
    expect(FRONTS.every((f) => f.available)).toBe(true)
    expect(COVERAGES.map((c) => c.id)).toEqual(['cover-0', 'cover-2', 'cover-3', 'cover-4', 'cover-6'])
    expect(COVERAGES.every((c) => c.available)).toBe(true)
  })

  for (const f of FRONTS) {
    it(`${f.name}: 11 jugadores con id único, personal correcto y posición conocida`, () => {
      expect(f.players).toHaveLength(11)
      expect(new Set(f.players.map((p) => p.id)).size).toBe(11)
      const count = (g: string) => f.players.filter((p) => p.group === g).length
      expect(`${count('DL')}-${count('LB')}-${count('DB')}`).toBe(f.id)
      for (const p of f.players) expect(POSITIONS[p.pos], p.pos).toBeDefined()
    })

    for (const c of COVERAGES) {
      it(`${f.name} + ${c.name}: asignación para cada jugador del frente y nada más`, () => {
        const a = ASSIGNMENTS[f.id]?.[c.id]
        expect(a).toBeDefined()
        expect(Object.keys(a).sort()).toEqual(f.players.map((p) => p.id).sort())
      })
    }
  }
})

describe('alignDefense: todas las combinaciones', () => {
  for (const f of FRONTS) {
    for (const c of COVERAGES) {
      it(`${f.name} + ${c.name}: 6 formaciones × 3 hashes, dentro del campo y sin encimarse`, () => {
        for (const form of FORMATIONS) {
          for (const hash of HASHES) {
            const where = `${form.name} hash ${hash}`
            const s = alignDefense(f, c.id, ASSIGNMENTS[f.id][c.id], form, hash)
            expect(s.defense).toHaveLength(11)
            for (const d of s.defense) {
              for (const p of [d.pre, d.post]) {
                expect(p.x, `${d.id} ${where}`).toBeGreaterThanOrEqual(0)
                expect(p.x, `${d.id} ${where}`).toBeLessThanOrEqual(FIELD_WIDTH)
                expect(p.y, `${d.id} ${where}`).toBeLessThanOrEqual(VIEW_TOP)
              }
              expect(d.pre.y, `${d.id} ${where}`).toBeGreaterThan(0)
              expect(d.alignLabel).not.toBe('')
            }
            // Pre-snap: ningún par de círculos encimado.
            const pre = s.defense.map((d) => d.pre)
            for (let i = 0; i < pre.length; i++) {
              for (let j = i + 1; j < pre.length; j++) {
                const dist = Math.hypot(pre[i].x - pre[j].x, pre[i].y - pre[j].y)
                expect(dist, `${s.defense[i].id}-${s.defense[j].id} ${where}`).toBeGreaterThanOrEqual(2.1)
              }
            }
            // Nadie repite zona y nadie repite receptor en man.
            const zones = s.defense.filter((d) => d.zone).map((d) => d.zone!.id)
            expect(new Set(zones).size, where).toBe(zones.length)
            const targets = s.defense.filter((d) => d.manTargetId).map((d) => d.manTargetId)
            expect(new Set(targets).size, where).toBe(targets.length)
          }
        }
      })
    }
  }
})

describe('estructura de cada cover (Shotgun 2x2)', () => {
  const deep = (s: DefenseSnapshot, type: string) => s.defense.filter((d) => d.zone?.id.startsWith(type))

  for (const f of FRONTS) {
    it(`${f.name}: Cover 0 sin zonas y los CBs en man sobre los #1`, () => {
      const s = snap(f.id, 'cover-0')
      expect(s.defense.filter((d) => d.kind === 'zone')).toHaveLength(0)
      expect(s.defense.find((d) => d.id === 'CB_S')!.roleLabel).toBe('Man #1 Strong')
      expect(s.defense.find((d) => d.id === 'CB_W')!.roleLabel).toBe('Man #1 Weak')
      // 2x2 + RB = 5 elegibles, todos cubiertos.
      expect(s.defense.filter((d) => d.kind === 'man')).toHaveLength(5)
    })

    it(`${f.name}: Cover 2 con 2 deep halves y CBs en el flat`, () => {
      const s = snap(f.id, 'cover-2')
      expect(deep(s, 'deepHalf')).toHaveLength(2)
      expect(s.defense.filter((d) => d.zone?.family === 'deep')).toHaveLength(2)
      expect(s.defense.find((d) => d.id === 'CB_S')!.zone!.id).toBe('flat-S')
      expect(s.defense.find((d) => d.id === 'CB_W')!.zone!.id).toBe('flat-W')
    })

    it(`${f.name}: Cover 3 con CBs y FS en 3 deep thirds`, () => {
      const s = snap(f.id, 'cover-3')
      const thirds = deep(s, 'deepThird')
      expect(thirds.map((d) => d.id).sort()).toEqual(['CB_S', 'CB_W', 'FS'])
      expect(s.defense.filter((d) => d.zone?.family === 'deep')).toHaveLength(3)
      expect(s.defense.filter((d) => d.zone?.id === 'curlFlat-S')).toHaveLength(1)
    })

    it(`${f.name}: Cover 4 con 4 deep quarters`, () => {
      const s = snap(f.id, 'cover-4')
      expect(deep(s, 'deepQuarter')).toHaveLength(4)
      expect(s.defense.filter((d) => d.zone?.family === 'deep')).toHaveLength(4)
    })

    it(`${f.name}: Cover 6 con 2 quarters strong, half weak y CB weak en el flat`, () => {
      const s = snap(f.id, 'cover-6')
      expect(deep(s, 'deepQuarter-S')).toHaveLength(2)
      expect(deep(s, 'deepHalf-W')).toHaveLength(1)
      expect(s.defense.filter((d) => d.zone?.family === 'deep')).toHaveLength(3)
      expect(s.defense.find((d) => d.id === 'CB_W')!.zone!.id).toBe('flat-W')
    })
  }

  it('Cover 3 en 4-3-4: 4 underneath, 4 rush, CB strong en el tercio del lado strong', () => {
    const s = snap('4-3-4', 'cover-3', 'shotgun-2x2', 'L')
    expect(s.defense.filter((d) => d.kind === 'zone' && d.zone?.family !== 'deep')).toHaveLength(4)
    expect(s.defense.filter((d) => d.kind === 'rush')).toHaveLength(4)
    expect(s.defense.find((d) => d.id === 'CB_S')!.zone!.center.x).toBeGreaterThan(FIELD_WIDTH / 2)
  })
})

describe('híbridos', () => {
  for (const f of FRONTS) {
    for (const c of COVERAGES) {
      const hybrids = snap(f.id, c.id).defense.filter((d) => d.hybrid).map((d) => d.id)
      const ols = { '3-5-3': 'SPUR', '5-3-3': 'BANDIT' } as Record<string, string>
      const expected = ols[f.id] && ['cover-2', 'cover-4', 'cover-6'].includes(c.id) ? [ols[f.id]] : []
      it(`${f.name} + ${c.name}: híbridos = [${expected.join(', ')}]`, () => {
        expect(hybrids).toEqual(expected)
      })
    }
  }

  it('en Cover 3 el OLB strong de un frente de 3 DB sigue en el curl/flat strong', () => {
    expect(snap('3-5-3', 'cover-3').defense.find((d) => d.id === 'SPUR')!.zone!.id).toBe('curlFlat-S')
    expect(snap('5-3-3', 'cover-3').defense.find((d) => d.id === 'BANDIT')!.zone!.id).toBe('curlFlat-S')
  })
})

describe('Cover 0: quién cubre a quién según la formación', () => {
  const role = (s: DefenseSnapshot, id: string) => s.defense.find((d) => d.id === id)!

  it('2x2: no hay #3, el FS se suma al blitz', () => {
    const fs = role(snap('4-3-4', 'cover-0'), 'FS')
    expect(fs.kind).toBe('blitz')
    expect(fs.roleLabel).toBe('Blitz (no hay #3 strong)')
  })

  it('Trips: el FS toma al #3; el del #2 weak no tiene a quién y blitzea', () => {
    const s = snap('4-3-4', 'cover-0', 'trips')
    expect(role(s, 'FS').roleLabel).toBe('Man #3 Strong')
    expect(role(s, 'WILL').kind).toBe('blitz')
  })

  it('Pro / I-Form: sin #2 weak, el Will toma al FB', () => {
    const s = snap('4-3-4', 'cover-0', 'pro-i')
    expect(role(s, 'WILL').roleLabel).toBe('Man FB')
    expect(role(s, 'WILL').manTargetId).toBe('FB')
    expect(role(s, 'MIKE').manTargetId).toBe('RB')
    expect(role(s, 'SS').manTargetId).toBe('TE')
    // Se alinea frente al FB, no afuera en el apex weak.
    const fb = s.offense.find((p) => p.id === 'FB')!
    expect(Math.abs(role(s, 'WILL').pre.x - fb.pos.x)).toBeLessThan(2)
    expect(role(s, 'WILL').alignLabel).toBe('Sobre el FB')
  })

  it('Empty: no hay RB, el Mike blitzea; los 5 receptores quedan cubiertos', () => {
    const s = snap('4-3-4', 'cover-0', 'empty')
    expect(role(s, 'MIKE').kind).toBe('blitz')
    expect(s.defense.filter((d) => d.kind === 'man')).toHaveLength(5)
  })
})

describe('alineación', () => {
  it('etiquetas de la regla de alineación', () => {
    const s = snap('4-3-4', 'cover-3')
    const label = (id: string) => s.defense.find((d) => d.id === id)!.alignLabel
    expect(label('CB_S')).toBe('Sobre el #1 strong, 1 yd por fuera')
    expect(label('SS')).toBe('Apex strong')
    expect(label('FS')).toBe('Sobre el balón')
    expect(label('DE_S')).toBe('5-tech strong')
  })

  it('con TE pegado, el apex queda entre el TE y el #1', () => {
    const s = snap('4-3-4', 'cover-3', 'pro-i')
    const te = s.offense.find((p) => p.id === 'TE')!.pos.x
    const z = s.offense.find((p) => p.id === 'Z')!.pos.x
    const ss = s.defense.find((d) => d.id === 'SS')!.pre.x
    expect(ss).toBeCloseTo((te + z) / 2, 5)
  })

  it('separate() abre dos defensores encimados', () => {
    const [a, b] = separate([
      { x: 20, y: 5 },
      { x: 20.5, y: 5 },
    ])
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(2.1)
  })
})

describe('overrides (arrastrar defensores)', () => {
  it('mueve la alineación pre-snap sin cambiar el rol', () => {
    const base = snap('4-3-4', 'cover-3')
    const moved = alignDefense(front('4-3-4'), 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], shotgun2x2, 'M', {
      SS: { x: 30, y: 10 },
    })
    const a = base.defense.find((d) => d.id === 'SS')!
    const b = moved.defense.find((d) => d.id === 'SS')!
    expect(b.pre).toEqual({ x: 30, y: 10 })
    expect(b.auto).toEqual(a.pre)
    expect(b.moved).toBe(true)
    expect(b.roleLabel).toBe(a.roleLabel)
    expect(b.post).toEqual(a.post)
    expect(moved.defense.filter((d) => d.moved).map((d) => d.id)).toEqual(['SS'])
  })

  it('un rusher movido rushea desde su nueva posición', () => {
    const moved = alignDefense(front('4-3-4'), 'cover-3', ASSIGNMENTS['4-3-4']['cover-3'], shotgun2x2, 'M', {
      DE_S: { x: 40, y: 3 },
    })
    const de = moved.defense.find((d) => d.id === 'DE_S')!
    expect(Math.hypot(de.post.x - 40, de.post.y - 3)).toBeCloseTo(3, 5)
  })
})

it('combinación sin asignaciones lanza MissingAssignmentError', () => {
  expect(() => alignDefense(front('4-3-4'), 'cover-9', undefined, shotgun2x2, 'M')).toThrow(MissingAssignmentError)
})
