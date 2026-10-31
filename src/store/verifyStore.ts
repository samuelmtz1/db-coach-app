import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Hash } from '../engine/types'

export type Mark = 'ok' | 'fix'

/** Formación y hash que el coach estaba viendo cuando escribió la nota. */
export interface ViewRef {
  formationId: string
  hash: Hash
}

export interface RowCheck {
  status: Mark
  note: string
  /** Rol + alineación + profundidad al momento de marcar. Si el contenido cambia, la marca queda vieja. */
  snapshot: string
  view: ViewRef
}

export interface ComboNote {
  text: string
  view: ViewRef
}

/** "4-3-4|cover-3" */
export const comboKey = (frontId: string, coverageId: string) => `${frontId}|${coverageId}`

interface VerifyState {
  frontId: string
  coverageId: string
  view: ViewRef
  rows: Record<string, Record<string, RowCheck>>
  notes: Record<string, ComboNote>
  selectCombo: (frontId: string, coverageId: string) => void
  setView: (view: Partial<ViewRef>) => void
  /** Marca una fila. Tocar otra vez la misma marca la quita. */
  mark: (key: string, defenderId: string, status: Mark, snapshot: string) => void
  setRowNote: (key: string, defenderId: string, note: string) => void
  setComboNote: (key: string, text: string) => void
  clearAll: () => void
}

const DEFAULT_VIEW: ViewRef = { formationId: 'shotgun-2x2', hash: 'M' }

export const useVerifyStore = create<VerifyState>()(
  persist(
    (set) => ({
      frontId: '4-3-4',
      coverageId: 'cover-3',
      view: DEFAULT_VIEW,
      rows: {},
      notes: {},
      selectCombo: (frontId, coverageId) => set({ frontId, coverageId }),
      setView: (view) => set((s) => ({ view: { ...s.view, ...view } })),
      mark: (key, defenderId, status, snapshot) =>
        set((s) => {
          const combo = { ...s.rows[key] }
          const prev = combo[defenderId]
          if (prev && prev.status === status && prev.snapshot === snapshot) delete combo[defenderId]
          else combo[defenderId] = { status, note: prev?.note ?? '', snapshot, view: prev?.view ?? s.view }
          return { rows: { ...s.rows, [key]: combo } }
        }),
      setRowNote: (key, defenderId, note) =>
        set((s) => {
          const prev = s.rows[key]?.[defenderId]
          if (!prev) return {}
          return { rows: { ...s.rows, [key]: { ...s.rows[key], [defenderId]: { ...prev, note, view: s.view } } } }
        }),
      setComboNote: (key, text) => set((s) => ({ notes: { ...s.notes, [key]: { text, view: s.view } } })),
      clearAll: () => set({ rows: {}, notes: {} }),
    }),
    {
      // Se guarda en este dispositivo. Si el navegador bloquea localStorage, funciona igual sin guardar.
      name: 'db-coach:verify',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ frontId: s.frontId, coverageId: s.coverageId, rows: s.rows, notes: s.notes }),
    },
  ),
)
