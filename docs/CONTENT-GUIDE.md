# Guía de contenido

Cómo agregar o corregir frentes, covers y formaciones. Todo vive en `src/data/`.

## Lados: strong y weak
Las asignaciones usan `'S'` (strong) y `'W'` (weak), no izquierda/derecha. El motor decide qué lado es cuál según la formación, así una sola asignación sirve para cualquier formación y hash.

## Receptores
`S1` = #1 del lado strong (el más abierto), `S2` = #2, `W1` = #1 weak, `RB` = el corredor.

## Reglas de alineación (`src/data/roles.ts`)
| Atajo | Significado | Ejemplo |
|---|---|---|
| `tech(t, lado, prof)` | Técnica sobre la OL | `tech(5, 'S')` = 5-tech strong |
| `onReceiver(rec, leverage, prof)` | Sobre un receptor; leverage + = por fuera | `onReceiver('S1', 1, 7)` |
| `apex(lado, prof)` | Entre el #2 y el último hombre de la línea | `apex('S', 7)` |
| `overBall(dx, prof, lado?)` | Relativo al balón | `overBall(0, 13)` |
| `onHash(lado, dx, prof)` | Relativo al hash; dx + = hacia el sideline | `onHash('W', 0, 12)` |

## Roles
| Atajo | Significado |
|---|---|
| `zone('deepThird', 'S')` | Zona. Tipos: `deepThird`, `deepHalf`, `deepQuarter` (+ `'outside'`/`'inside'`), `flat`, `curlFlat`, `hookCurl`, `hole`. Lado: `'S'`, `'W'` o `'M'` (medio). |
| `man('S2')` | Man sobre ese receptor |
| `RUSH` | Rush |
| `BLITZ` | Blitz |

## Ejemplo: corregir un jugador
"En 4-3-4 Cover 3, el SS debe alinearse a 8 yardas":

```ts
// src/data/assignments.ts
SS: { role: zone('curlFlat', 'S'), align: apex('S', 8) },
```

## Agregar un cover a un frente
En `src/data/assignments.ts`, dentro del frente, agrega una entrada con **los 11 jugadores** del frente:

```ts
'4-3-4': {
  'cover-3': { ... },
  'cover-2': {
    DE_S: { role: RUSH },
    // ...los 11
  },
},
```

y marca el cover como `available: true` en `src/data/coverages/index.ts`. Si falta un jugador, la app muestra un aviso en lugar del diagrama, y `npm test` lo detecta.

## Jugadores híbridos (frentes con 3 DBs)
Agrega `hybrid: true` a la asignación del LB que toma un rol de DB. Se dibuja con un anillo punteado.

## Renombrar posiciones
`src/data/positions.ts`: `short` es lo que se ve dentro del círculo y `name` lo que se ve en el panel.

## Limitaciones conocidas (v1.0.0)
- Solo existe Shotgun 2x2; las reglas de apex y de receptores faltantes (sin #3) se validarán con 3x1 y Trips en v1.1.0.
- Sin TE en la formación actual: `emlosX` ya reconoce un TE pegado, pero no se ha probado con datos reales.
