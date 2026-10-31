import { create } from 'zustand'
import type { Hash, Phase } from '../engine/types'

interface LabState {
  frontId: string
  coverageId: string
  formationId: string
  hash: Hash
  phase: Phase
  selectedId: string | null
  setFront: (id: string) => void
  setCoverage: (id: string) => void
  setFormation: (id: string) => void
  setHash: (hash: Hash) => void
  setPhase: (phase: Phase) => void
  togglePhase: () => void
  select: (id: string | null) => void
}

export const useLabStore = create<LabState>((set) => ({
  frontId: '4-3-4',
  coverageId: 'cover-3',
  formationId: 'shotgun-2x2',
  hash: 'M',
  phase: 'pre',
  selectedId: null,
  setFront: (frontId) => set({ frontId, selectedId: null }),
  setCoverage: (coverageId) => set({ coverageId, selectedId: null }),
  setFormation: (formationId) => set({ formationId, selectedId: null }),
  setHash: (hash) => set({ hash }),
  setPhase: (phase) => set({ phase }),
  togglePhase: () => set((s) => ({ phase: s.phase === 'pre' ? 'post' : 'pre' })),
  select: (selectedId) => set({ selectedId }),
}))
