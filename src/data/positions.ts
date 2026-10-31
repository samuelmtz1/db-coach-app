// Etiquetas de las posiciones defensivas. Para renombrar una posición en toda la app,
// cambia `short` (lo que se ve dentro del círculo) o `name` (lo que se ve en el panel).
export interface Position {
  short: string
  name: string
}

export const POSITIONS: Record<string, Position> = {
  CB: { short: 'CB', name: 'Cornerback' },
  FS: { short: 'FS', name: 'Free Safety' },
  SS: { short: 'SS', name: 'Strong Safety' },
  NICKEL: { short: 'N', name: 'Nickel' },
  SPUR: { short: 'SP', name: 'Spur' },
  BANDIT: { short: 'B', name: 'Bandit' },
  SAM: { short: 'S', name: 'Sam' },
  MIKE: { short: 'M', name: 'Mike' },
  WILL: { short: 'W', name: 'Will' },
  JACK: { short: 'J', name: 'Jack' },
  DE: { short: 'DE', name: 'Defensive End' },
  DT: { short: 'DT', name: 'Defensive Tackle' },
  NT: { short: 'NT', name: 'Nose Tackle' },
}

export function position(id: string): Position {
  return POSITIONS[id] ?? { short: id, name: id }
}
