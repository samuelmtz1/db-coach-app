import { FIELD_WIDTH, HASH_FROM_SIDELINE, hashX, resolveSide, sign, sidelineX } from './geometry'
import type { ResolvedZone, Side, ZoneFamily, ZoneSpec, ZoneType } from './types'

// Las zonas se dibujan como elipses (center, rx, ry) y cada una tiene un punto de drop
// al que llega el defensor después del snap. Las profundas se anclan al campo
// (tercios, mitades, cuartos); las de abajo, al sideline o al balón.

const FAMILY: Record<ZoneType, ZoneFamily> = {
  deepThird: 'deep',
  deepHalf: 'deep',
  deepQuarter: 'deep',
  hookCurl: 'hook',
  hole: 'hook',
  flat: 'flat',
  curlFlat: 'flat',
}

const NAME: Record<ZoneType, string> = {
  deepThird: 'Deep 1/3',
  deepHalf: 'Deep 1/2',
  deepQuarter: 'Deep 1/4',
  hookCurl: 'Hook/Curl',
  hole: 'Hole',
  flat: 'Flat',
  curlFlat: 'Curl/Flat',
}

const DEEP_Y = 19
const DEEP_RY = 7
const DEEP_DROP_Y = 13

export function zoneLabel(spec: ZoneSpec): string {
  const side = spec.side === 'M' ? '' : spec.side === 'S' ? ' Strong' : ' Weak'
  const slot = spec.slot ? (spec.slot === 'outside' ? ' (afuera)' : ' (adentro)') : ''
  return `${NAME[spec.type]}${side}${slot}`
}

export function resolveZone(spec: ZoneSpec, strength: Side, ballX: number): ResolvedZone {
  const side: Side | null = spec.side === 'M' ? null : resolveSide(spec.side, strength)
  const s = side ? sign(side) : 0
  // Distancia medida desde el sideline de ese lado hacia adentro.
  const fromSideline = (d: number) => (side ? sidelineX(side) - s * d : FIELD_WIDTH / 2)

  let cx: number
  let cy: number
  let rx: number
  let ry: number
  let drop: { x: number; y: number }

  switch (spec.type) {
    case 'deepThird': {
      const third = FIELD_WIDTH / 3
      cx = side ? fromSideline(third / 2) : FIELD_WIDTH / 2
      ;[cy, rx, ry] = [DEEP_Y, third / 2, DEEP_RY]
      drop = { x: cx, y: DEEP_DROP_Y }
      break
    }
    case 'deepHalf': {
      const half = FIELD_WIDTH / 2
      cx = fromSideline(half / 2)
      ;[cy, rx, ry] = [DEEP_Y, half / 2, DEEP_RY]
      drop = { x: side ? hashX(side) : cx, y: DEEP_DROP_Y }
      break
    }
    case 'deepQuarter': {
      const q = FIELD_WIDTH / 4
      cx = fromSideline(spec.slot === 'inside' ? q * 1.5 : q / 2)
      ;[cy, rx, ry] = [DEEP_Y, q / 2, DEEP_RY]
      drop = { x: cx, y: DEEP_DROP_Y - 1 }
      break
    }
    case 'flat':
      cx = fromSideline(6)
      ;[cy, rx, ry] = [4, 6, 4]
      drop = { x: fromSideline(8), y: 5 }
      break
    case 'curlFlat': {
      // En el boundary hay menos espacio entre balón y sideline: el drop se recorre hacia afuera.
      const room = side ? Math.abs(ballX - sidelineX(side)) : FIELD_WIDTH / 2
      cx = fromSideline(HASH_FROM_SIDELINE / 2)
      ;[cy, rx, ry] = [6.5, HASH_FROM_SIDELINE / 2, 5.5]
      drop = { x: fromSideline(Math.min(12, room / 2)), y: 9 }
      break
    }
    case 'hookCurl':
      cx = ballX + s * 4.5
      ;[cy, rx, ry] = [9, 4, 4]
      drop = { x: ballX + s * 4.5, y: 10 }
      break
    case 'hole':
      cx = ballX
      ;[cy, rx, ry] = [11, 4, 4]
      drop = { x: ballX, y: 12 }
      break
  }

  return {
    id: `${spec.type}-${spec.side}${spec.slot ? `-${spec.slot}` : ''}`,
    family: FAMILY[spec.type],
    label: zoneLabel(spec),
    center: { x: cx, y: cy },
    rx,
    ry,
    drop,
  }
}
