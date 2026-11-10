import { create } from 'zustand'
import type { Hash, Phase } from '../engine/types'

/** Lo que cambia entre los dos campos. Todo lo demás es igual en los dos. */
export type CompareDim = 'coverage' | 'formation' | 'front' | 'hash'

interface CompareState {
  dim: CompareDim
  frontId: string
  coverageId: string
  formationId: string
  hash: Hash
  /** Valor de la dimensión que cambia en el campo A y en el B (id de cover, formación, frente o hash). */
  a: string
  b: string
  phase: Phase
  selectedId: string | null
  /** Atenuar lo que no cambia. */
  highlight: boolean
  setDim: (dim: CompareDim, a: string, b: string) => void
  setBase: (patch: Partial<Pick<CompareState, 'frontId' | 'coverageId' | 'formationId' | 'hash'>>) => void
  setA: (value: string) => void
  setB: (value: string) => void
  swap: () => void
  setPhase: (phase: Phase) => void
  togglePhase: () => void
  select: (id: string | null) => void
  setHighlight: (on: boolean) => void
}

export const useCompareStore = create<CompareState>((set) => ({
  dim: 'coverage',
  frontId: '4-3-4',
  coverageId: 'cover-3',
  formationId: 'shotgun-2x2',
  hash: 'M',
  a: 'cover-3',
  b: 'cover-4',
  phase: 'post',
  selectedId: null,
  highlight: true,
  setDim: (dim, a, b) => set({ dim, a, b, selectedId: null }),
  setBase: (patch) => set(patch),
  setA: (a) => set({ a }),
  setB: (b) => set({ b }),
  swap: () => set((s) => ({ a: s.b, b: s.a })),
  setPhase: (phase) => set({ phase }),
  togglePhase: () => set((s) => ({ phase: s.phase === 'pre' ? 'post' : 'pre' })),
  select: (selectedId) => set({ selectedId }),
  setHighlight: (highlight) => set({ highlight }),
}))
