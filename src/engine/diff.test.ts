import { describe, expect, it } from 'vitest'
import { alignDefense } from './align'
import { changedIds, diffSnapshots } from './diff'
import { ASSIGNMENTS } from '../data/assignments'
import { FORMATIONS } from '../data/formations'
import { FRONTS } from '../data/fronts'
import type { Hash } from './types'

const snap = (frontId: string, coverId: string, formationId = 'shotgun-2x2', hash: Hash = 'M') =>
  alignDefense(
    FRONTS.find((f) => f.id === frontId)!,
    coverId,
    ASSIGNMENTS[frontId][coverId],
    FORMATIONS.find((f) => f.id === formationId)!,
    hash,
  )

describe('diffSnapshots', () => {
  it('la misma situación no tiene cambios', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-3'), snap('4-3-4', 'cover-3'))
    expect(d).toHaveLength(11)
    expect(d.every((x) => x.status === 'same')).toBe(true)
    expect(changedIds(d).size).toBe(0)
  })

  it('Cover 3 vs Cover 4: los safeties cambian de rol, la DL no', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-3'), snap('4-3-4', 'cover-4'))
    const byId = new Map(d.map((x) => [x.id, x]))
    expect(byId.get('FS')!.status).toBe('role')
    expect(byId.get('SS')!.status).toBe('role')
    for (const id of ['DE_S', 'DT', 'NT', 'DE_W']) expect(byId.get(id)!.status, id).toBe('same')
  })

  it('Cover 0 vs Cover 3: la DL sigue en rush', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-0'), snap('4-3-4', 'cover-3'))
    const byId = new Map(d.map((x) => [x.id, x]))
    expect(byId.get('DE_S')!.roleChanged).toBe(false)
    expect(byId.get('CB_S')!.roleChanged).toBe(true)
  })

  it('4-3-4 vs 4-2-5: el Sam solo está en A y el Nickel solo en B', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-3'), snap('4-2-5', 'cover-3'))
    expect(d).toHaveLength(12)
    expect(d.find((x) => x.id === 'SAM')!.status).toBe('onlyA')
    const nickel = d.find((x) => x.id === 'NICKEL')!
    expect(nickel.status).toBe('onlyB')
    expect(d.at(-1)!.id).toBe('NICKEL')
  })

  it('2x2 vs 3x1: nadie cambia de rol pero la defensa se recorre', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-3', 'shotgun-2x2'), snap('4-3-4', 'cover-3', 'shotgun-3x1'))
    expect(d.some((x) => x.roleChanged)).toBe(false)
    expect(d.some((x) => x.status === 'moved' || x.status === 'align')).toBe(true)
    // La DL se alinea por técnica: no se mueve respecto al balón.
    for (const id of ['DE_S', 'DT', 'NT', 'DE_W']) expect(d.find((x) => x.id === id)!.status, id).toBe('same')
  })

  it('balón al centro vs hash izquierdo: la DL se mueve con el balón, no cuenta como cambio', () => {
    const d = diffSnapshots(snap('4-3-4', 'cover-3', 'shotgun-3x1', 'M'), snap('4-3-4', 'cover-3', 'shotgun-3x1', 'L'))
    const nt = d.find((x) => x.id === 'NT')!
    expect(nt.status).toBe('same')
    expect(nt.shift).toBeLessThan(0.01)
  })
})
