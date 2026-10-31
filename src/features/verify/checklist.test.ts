import { describe, expect, it } from 'vitest'
import { buildChecklist, buildSummary, comboProgress, rowState } from './checklist'
import type { RowCheck } from '../../store/verifyStore'

const combos = buildChecklist()
const c434 = combos.find((c) => c.key === '4-3-4|cover-3')!
const ss = c434.rows.find((r) => r.id === 'SS')!
const view = { formationId: 'shotgun-2x2', hash: 'M' as const }
const check = (status: 'ok' | 'fix', snapshot: string, note = ''): RowCheck => ({ status, note, snapshot, view })

describe('modo Verificar', () => {
  it('30 combinaciones con 11 filas cada una y sin errores', () => {
    expect(combos).toHaveLength(30)
    for (const c of combos) {
      expect(c.error, c.key).toBeUndefined()
      expect(c.rows, c.key).toHaveLength(11)
    }
  })

  it('cada fila trae rol, alineación y profundidad', () => {
    expect(ss.roleLabel).toBe('Curl/Flat Strong')
    expect(ss.alignLabel).toBe('Apex strong')
    expect(ss.depth).toBe(7)
    expect(ss.snapshot).toBe('Curl/Flat Strong | Apex strong | 7 yd')
  })

  it('una marca hecha antes de un cambio de contenido queda como "changed"', () => {
    expect(rowState(ss, undefined)).toBe('pending')
    expect(rowState(ss, check('ok', ss.snapshot))).toBe('ok')
    expect(rowState(ss, check('ok', 'Curl/Flat Strong | Apex strong | 8 yd'))).toBe('changed')
  })

  it('progreso por combinación', () => {
    const p = comboProgress(c434, { SS: check('fix', ss.snapshot), FS: check('ok', 'viejo') })
    expect(p).toEqual({ ok: 0, fix: 1, pending: 10, changed: 1, total: 11 })
  })

  it('el resumen lista las correcciones con su nota y la formación que estaba viendo', () => {
    const text = buildSummary(
      combos,
      { '4-3-4|cover-3': { SS: { ...check('fix', ss.snapshot, 'Debe ir a 8 yd'), view: { formationId: 'trips', hash: 'L' } } } },
      { '4-3-4|cover-3': { text: 'Revisar el Will', view } },
      '1.1.0',
    )
    expect(text).toContain('DB Coach v1.1.0 · Verificación (Shotgun 2x2, balón al centro)')
    expect(text).toContain('Revisadas: 0/30 combinaciones · 0 OK · 1 por corregir')
    expect(text).toContain('4-3-4 + Cover 3')
    expect(text).toContain('  ✘ SS (Strong Safety) · Curl/Flat Strong | Apex strong | 7 yd')
    expect(text).toContain('    Nota: Debe ir a 8 yd (viendo Trips, hash izq.)')
    expect(text).toContain('  Nota general: Revisar el Will')
    expect(text).toContain('Sin terminar (30)')
  })
})
