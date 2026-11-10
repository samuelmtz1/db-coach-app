// Las 12 rutas del menú del whiteboard. Son conceptos, no profundidades exactas.
//
// Cada punto es [dx, y]:
//   dx = yardas hacia el sideline del receptor (negativo = hacia adentro, hacia el balón).
//   y  = depende de `from`:
//        'los'   → profundidad desde la LOS (la ruta cruza a la misma altura venga de donde venga).
//        'start' → yardas desde donde está el jugador (para screens, que van detrás de la línea).
// `backfield` es la versión para un RB/FB, si es distinta.
export interface RouteShape {
  from: 'los' | 'start'
  points: [number, number][]
}

export interface RouteTemplate extends RouteShape {
  id: string
  name: string
  backfield?: RouteShape
}

export const ROUTES: RouteTemplate[] = [
  { id: 'slant', name: 'Slant', from: 'los', points: [[0, 2], [-6, 7]] },
  { id: 'out', name: 'Out', from: 'los', points: [[0, 10], [7, 10]] },
  { id: 'go', name: 'Go', from: 'los', points: [[0, 21]] },
  { id: 'fade', name: 'Fade', from: 'los', points: [[1, 4], [4, 21]] },
  { id: 'post', name: 'Post', from: 'los', points: [[0, 10], [-7, 20]] },
  { id: 'curl', name: 'Curl', from: 'los', points: [[0, 11], [-1.5, 9]] },
  {
    id: 'flat',
    name: 'Flat',
    from: 'los',
    points: [[2, 1], [8, 3]],
    backfield: { from: 'los', points: [[4, -2], [9, 1]] },
  },
  {
    id: 'wheel',
    name: 'Wheel',
    from: 'los',
    points: [[3, 1], [6, 4], [7, 20]],
    backfield: { from: 'los', points: [[6, -2.5], [10, 1], [11, 18]] },
  },
  {
    id: 'screen',
    name: 'Screen',
    from: 'start',
    points: [[-2.5, -1.5]],
    backfield: { from: 'start', points: [[3, -0.5], [6, -1]] },
  },
  {
    id: 'checkdown',
    name: 'Checkdown',
    from: 'los',
    points: [[0, 3], [-2, 4]],
    backfield: { from: 'los', points: [[0.5, 2], [0, 3.5]] },
  },
  { id: 'dig', name: 'Dig', from: 'los', points: [[0, 12], [-10, 12]] },
  { id: 'comeback', name: 'Comeback', from: 'los', points: [[0, 14], [2.5, 11]] },
]
