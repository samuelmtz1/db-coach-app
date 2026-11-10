import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { clampOffense, type BoardPlayer } from '../engine/board'
import { ballX } from '../engine/geometry'
import { placeOffense } from '../engine/strength'
import type { Hash, Phase, Point } from '../engine/types'
import { FORMATIONS } from '../data/formations'

export type Tool = 'move' | 'route' | 'pen' | 'erase'
export type PenColor = 'white' | 'yellow' | 'red'

/** Ruta de un jugador. Los puntos son offsets desde el jugador: si lo mueven, la ruta lo sigue. */
export interface BoardRoute {
  points: Point[]
  dashed: boolean
  /** id de la ruta del menú (data/routes.ts) o null si se dibujó punto por punto. */
  templateId: string | null
}

export interface Stroke {
  id: string
  points: Point[]
  dashed: boolean
  color: PenColor
}

export interface BoardPlayerState extends BoardPlayer {
  /** Posición antes del snap (círculo punteado). Si existe, una línea punteada marca el motion. */
  presnap?: Point
}

/** Lo que se guarda y se deshace. `schemaVersion` sube si cambia el formato (ver CHANGELOG). */
export interface BoardDoc {
  schemaVersion: 1
  formationId: string
  hash: Hash
  players: BoardPlayerState[]
  routes: Record<string, BoardRoute>
  strokes: Stroke[]
}

export interface BoardUi {
  tool: Tool
  dashed: boolean
  color: PenColor
  showDefense: boolean
  frontId: string
  coverageId: string
  phase: Phase
}

const HISTORY_LIMIT = 100

/** id único para un trazo a mano. */
export const newStrokeId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function templatePlayers(formationId: string, hash: Hash): BoardPlayerState[] {
  const formation = FORMATIONS.find((f) => f.id === formationId) ?? FORMATIONS[0]
  return placeOffense(formation, hash).map((p) => ({
    id: p.id,
    label: p.label,
    pos: p.pos,
    eligible: p.eligible,
    lineman: p.lineman,
  }))
}

export function emptyDoc(formationId = 'shotgun-2x2', hash: Hash = 'M'): BoardDoc {
  return { schemaVersion: 1, formationId, hash, players: templatePlayers(formationId, hash), routes: {}, strokes: [] }
}

interface BoardState {
  doc: BoardDoc
  past: BoardDoc[]
  future: BoardDoc[]
  ui: BoardUi
  selectedId: string | null

  setUi: (patch: Partial<BoardUi>) => void
  select: (id: string | null) => void

  /** Cambio con historial (un paso de deshacer). */
  commit: (next: (doc: BoardDoc) => BoardDoc) => void
  /** Inicio de un gesto largo (arrastre, trazo): guarda un paso de deshacer. */
  beginGesture: () => void
  /** Cambio en vivo durante el gesto, sin historial. */
  live: (next: (doc: BoardDoc) => BoardDoc) => void
  undo: () => void
  redo: () => void

  loadFormation: (formationId: string) => void
  setHash: (hash: Hash) => void
  clearDrawings: () => void
  resetBoard: () => void
}

const DEFAULT_UI: BoardUi = {
  tool: 'move',
  dashed: false,
  color: 'yellow',
  showDefense: true,
  frontId: '4-3-4',
  coverageId: 'cover-3',
  phase: 'pre',
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => {
      const push = (doc: BoardDoc) => ({ past: [...get().past, get().doc].slice(-HISTORY_LIMIT), future: [], doc })
      return {
        doc: emptyDoc(),
        past: [],
        future: [],
        ui: DEFAULT_UI,
        selectedId: null,

        setUi: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),
        select: (selectedId) => set({ selectedId }),

        commit: (next) => set(push(next(get().doc))),
        beginGesture: () => set((s) => ({ past: [...s.past, s.doc].slice(-HISTORY_LIMIT), future: [] })),
        live: (next) => set((s) => ({ doc: next(s.doc) })),
        undo: () =>
          set((s) => {
            const prev = s.past.at(-1)
            if (!prev) return {}
            return { past: s.past.slice(0, -1), future: [s.doc, ...s.future], doc: prev }
          }),
        redo: () =>
          set((s) => {
            const next = s.future[0]
            if (!next) return {}
            return { past: [...s.past, s.doc], future: s.future.slice(1), doc: next }
          }),

        // Una plantilla nueva reacomoda a la ofensiva y borra rutas y motion. Los dibujos a mano se quedan.
        loadFormation: (formationId) =>
          set((s) => ({
            ...push({ ...s.doc, formationId, players: templatePlayers(formationId, s.doc.hash), routes: {} }),
            selectedId: null,
          })),
        // Cambiar el hash recorre todo con el balón: se conservan los jugadores movidos, rutas y dibujos.
        setHash: (hash) =>
          set((s) => {
            const dx = ballX(hash) - ballX(s.doc.hash)
            const shift = (p: Point) => ({ x: p.x + dx, y: p.y })
            return push({
              ...s.doc,
              hash,
              players: s.doc.players.map((p) => ({
                ...p,
                pos: clampOffense(shift(p.pos)),
                presnap: p.presnap && clampOffense(shift(p.presnap)),
              })),
              strokes: s.doc.strokes.map((st) => ({ ...st, points: st.points.map(shift) })),
            })
          }),
        clearDrawings: () =>
          set((s) => push({ ...s.doc, routes: {}, strokes: [], players: s.doc.players.map((p) => ({ ...p, presnap: undefined })) })),
        resetBoard: () => set((s) => ({ ...push(emptyDoc(s.doc.formationId, s.doc.hash)), selectedId: null })),
      }
    },
    {
      // La pizarra actual se guarda en este dispositivo. La biblioteca de jugadas llega en v1.4.0.
      name: 'db-coach:whiteboard',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ doc: s.doc, ui: s.ui }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Pick<BoardState, 'doc' | 'ui'>> | undefined
        const doc = p?.doc?.schemaVersion === 1 && Array.isArray(p.doc.players) ? p.doc : current.doc
        return { ...current, doc, ui: { ...current.ui, ...p?.ui } }
      },
    },
  ),
)
