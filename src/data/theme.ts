// Colores del diagrama. Cada responsabilidad tiene un color y el anillo del defensor
// usa ese mismo color, para que el jugador conecte "yo" con "mi zona" a simple vista.
import type { RoleKind, ZoneFamily } from '../engine/types'

export const ZONE_COLORS: Record<ZoneFamily, string> = {
  deep: '#2f80ed',
  hook: '#a259ff',
  flat: '#ffd23f',
}

export const ROLE_COLORS: Record<Exclude<RoleKind, 'zone'>, string> = {
  man: '#ff4d4d',
  rush: '#c9d1d9',
  blitz: '#ff8a00',
}

export const FIELD_COLORS = {
  grassA: '#2e6b3a',
  grassB: '#2a6235',
  outOfBounds: '#1f4a28',
  lines: '#f4f4f0',
  los: '#5aa9ff',
  defense: '#0f1724',
  offense: '#f5f5f2',
  offenseText: '#14171b',
  selected: '#ffd23f',
  /** Letra del híbrido (LB en rol de DB). El borde del círculo va punteado en el color de su responsabilidad. */
  hybridText: '#ff4d4d',
}

export function colorFor(kind: RoleKind, family?: ZoneFamily): string {
  if (kind === 'zone') return ZONE_COLORS[family ?? 'deep']
  return ROLE_COLORS[kind]
}
