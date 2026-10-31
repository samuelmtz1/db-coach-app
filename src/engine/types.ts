// Tipos compartidos del motor. Todo se mide en yardas.
// x: desde el sideline izquierdo (0) hasta el derecho (53.3), visto con la ofensiva abajo.
// y: desde la LOS (0). Positivo = hacia la defensa (arriba en pantalla), negativo = backfield ofensivo.

export type Side = 'L' | 'R'
/** Lado relativo a la strength de la ofensiva. */
export type RelSide = 'S' | 'W'
export type Hash = 'L' | 'M' | 'R'
export type Phase = 'pre' | 'post'

export interface Point {
  x: number
  y: number
}

// ---------- Ofensiva ----------

export type OffXRef =
  /** Relativo al balón (dx positivo = derecha). Para OL, QB, RB y TE. */
  | { from: 'ball'; dx: number }
  /** A `d` yardas del sideline. Para receptores abiertos. */
  | { from: 'sideline'; side: Side; d: number }
  /** A medio camino entre el receptor `outside` y el tackle de ese lado. Para slots. */
  | { from: 'slot'; side: Side; outside: string }

export interface OffensivePlayer {
  id: string
  label: string
  x: OffXRef
  y: number
  /** Receptor elegible que cuenta para strength y numeración. */
  eligible: boolean
  /** QB/RB en el backfield: no se numeran. */
  backfield?: boolean
  /** Línea ofensiva: se dibuja más chica y sin etiqueta. */
  lineman?: boolean
}

export interface Formation {
  id: string
  name: string
  available: boolean
  players: OffensivePlayer[]
}

// ---------- Defensa ----------

export type Group = 'DL' | 'LB' | 'DB'

/** Receptor por lado y número de afuera hacia adentro: S1 = #1 del lado strong. */
export type ReceiverRef = 'S1' | 'S2' | 'S3' | 'W1' | 'W2' | 'W3' | 'RB'

export type AlignRule =
  /** Técnica de DL/LB relativa a la OL (0 = cabeza del centro, 5 = hombro externo del tackle...). */
  | { ref: 'tech'; tech: number; side: RelSide; depth: number }
  /** Sobre un receptor. leverage > 0 = por fuera, < 0 = por dentro (yardas). */
  | { ref: 'receiver'; rec: ReceiverRef; leverage: number; depth: number }
  /** Apex: a medio camino entre el #2 (o #1) y el último hombre de la línea. */
  | { ref: 'apex'; side: RelSide; depth: number }
  /** Relativo al balón. dx positivo = hacia `side` (o derecha si no hay side). */
  | { ref: 'ball'; dx: number; side?: RelSide; depth: number }
  /** Relativo al hash de ese lado. dx positivo = hacia el sideline. */
  | { ref: 'hash'; side: RelSide; dx: number; depth: number }

export interface FrontPlayer {
  id: string
  /** Clave en data/positions.ts (CB, FS, MIKE...). */
  pos: string
  group: Group
  /** Alineación base del frente. Un cover puede sobrescribirla. */
  align: AlignRule
}

export interface Front {
  id: string
  name: string
  /** DL-LB-DB */
  personnel: string
  available: boolean
  players: FrontPlayer[]
}

export type ZoneType =
  | 'deepThird'
  | 'deepHalf'
  | 'deepQuarter'
  | 'flat'
  | 'curlFlat'
  | 'hookCurl'
  | 'hole'

/** Familia = color en el diagrama. */
export type ZoneFamily = 'deep' | 'hook' | 'flat'

export interface ZoneSpec {
  type: ZoneType
  side: RelSide | 'M'
  /** Solo para deepQuarter: cuarto de afuera o de adentro. */
  slot?: 'outside' | 'inside'
}

export type Role =
  | { kind: 'zone'; zone: ZoneSpec }
  | { kind: 'man'; target: ReceiverRef }
  | { kind: 'rush' }
  | { kind: 'blitz' }

export interface Assignment {
  role: Role
  /** Si falta, se usa la alineación base del frente. */
  align?: AlignRule
  /** LB que toma un rol de DB (frentes con 3 DBs). */
  hybrid?: boolean
}

export interface Coverage {
  id: string
  name: string
  /** Descripción corta en español. */
  summary: string
  available: boolean
}

/** frente → cover → id del jugador del frente → asignación */
export type AssignmentMatrix = Record<string, Record<string, Record<string, Assignment>>>

// ---------- Resultado del motor ----------

export interface ResolvedOffense {
  id: string
  label: string
  pos: Point
  eligible: boolean
  backfield: boolean
  lineman: boolean
}

export interface ResolvedZone {
  id: string
  family: ZoneFamily
  label: string
  center: Point
  rx: number
  ry: number
  drop: Point
}

export type RoleKind = Role['kind']

export interface ResolvedDefender {
  id: string
  pos: string
  group: Group
  pre: Point
  post: Point
  kind: RoleKind
  roleLabel: string
  zone?: ResolvedZone
  /** id del jugador ofensivo cubierto en man. */
  manTargetId?: string
  hybrid: boolean
}

export interface DefenseSnapshot {
  ball: Point
  strength: Side
  strengthReason: string
  offense: ResolvedOffense[]
  defense: ResolvedDefender[]
}
