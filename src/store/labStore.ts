import { create } from 'zustand'
import type { Hash, Overrides, Phase, Point } from '../engine/types'

interface LabState {
  frontId: string
  coverageId: string
  formationId: string
  hash: Hash
  phase: Phase
  selectedId: string | null
  /** Defensores arrastrados a mano (solo alineación pre-snap). Se borran al cambiar la situación. */
  overrides: Overrides
  setFront: (id: string) => void
  setCoverage: (id: string) => void
  setFormation: (id: string) => void
  setHash: (hash: Hash) => void
  setPhase: (phase: Phase) => void
  togglePhase: () => void
  select: (id: string | null) => void
  moveDefender: (id: string, to: Point) => void
  resetOverrides: () => void
}

export const useLabStore = create<LabState>((set) => ({
  frontId: '4-3-4',
  coverageId: 'cover-3',
  formationId: 'shotgun-2x2',
  hash: 'M',
  phase: 'pre',
  selectedId: null,
  overrides: {},
  setFront: (frontId) => set({ frontId, selectedId: null, overrides: {} }),
  setCoverage: (coverageId) => set({ coverageId, selectedId: null, overrides: {} }),
  setFormation: (formationId) => set({ formationId, selectedId: null, overrides: {} }),
  setHash: (hash) => set({ hash, overrides: {} }),
  setPhase: (phase) => set({ phase }),
  togglePhase: () => set((s) => ({ phase: s.phase === 'pre' ? 'post' : 'pre' })),
  select: (selectedId) => set({ selectedId }),
  moveDefender: (id, to) => set((s) => ({ overrides: { ...s.overrides, [id]: to } })),
  resetOverrides: () => set({ overrides: {} }),
}))
