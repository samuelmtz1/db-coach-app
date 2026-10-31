# Guía de contenido

Cómo agregar o corregir frentes, covers y formaciones. Todo vive en `src/data/`.

## Lados: strong y weak
Las asignaciones usan `'S'` (strong) y `'W'` (weak), no izquierda/derecha. El motor decide qué lado es cuál según la formación, así una sola asignación sirve para cualquier formación y hash.

## Receptores
`S1` = #1 del lado strong (el más abierto), `S2` = #2, `W1` = #1 weak, `RB` = el corredor, `FB` = el segundo back (I-Form).

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
| `man('S2')` | Man sobre ese receptor. Si no existe en la formación, hace blitz. |
| `man('W2', 'FB')` | Man sobre el #2 weak; si no hay, sobre el FB; si tampoco, blitz. Se alinea sobre quien termine cubriendo. |
| `RUSH` | Rush |
| `BLITZ` | Blitz |

## Ejemplo: corregir un jugador
"En 4-3-4 Cover 3, el SS debe alinearse a 8 yardas":

```ts
// src/data/assignments/4-3-4.ts
SS: { role: zone('curlFlat', 'S'), align: apex('S', 8) },
```

## Agregar un cover a un frente
En `src/data/assignments/<frente>.ts` (un archivo por frente) agrega una entrada con **los 11 jugadores** del frente:

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
Agrega `hybrid: true` a la asignación del LB que toma un rol de DB. Se dibuja con la letra en rojo y el borde del círculo punteado.
Hoy: Spur (3-5-3) y Bandit (5-3-3) en Cover 2, 4 y 6.

## Formaciones
Un archivo por formación en `src/data/formations/`. Posición de cada jugador (`x`):
| Regla | Significado |
|---|---|
| `{ from: 'ball', dx }` | A `dx` yardas del balón (+ = derecha). OL, QB, backs, TE, y receptores pegados (Trips, Bunch). |
| `{ from: 'sideline', side, d }` | A `d` yardas del sideline. Receptores abiertos. |
| `{ from: 'slot', side, outside, at? }` | Entre el receptor `outside` y el tackle. `at` = fracción desde el receptor (0.5 si falta). |

Las formaciones están fijas: los 3 receptores de 3x1, Trips, Bunch y Empty van siempre a la derecha, y el TE de Pro/I también. Con balón en el hash derecho quedan hacia el boundary.

## Convenciones de esta versión (estándar, pendientes de revisar con el coach)
- 4º rusher: Jack en 3-4-4 (en Cover 3 se invierte: Sam rushea y Jack cae al curl/flat weak), Sam en 3-3-5, Jack en 3-5-3. En 5-3-3 rushean los 5 DL.
- Cover 3 con Nickel (4-2-5, 3-3-5): el Nickel toma el curl/flat strong y el SS baja al hook/curl strong.
- Cover 0: el #2 strong lo toma el SS / Nickel / Spur / Bandit; el #2 weak, el Will (Jack en 3-5-3, con el FB como alterno); el RB, el Mike; el #3 strong, el FS. El resto, blitz.

## Renombrar posiciones
`src/data/positions.ts`: `short` es lo que se ve dentro del círculo y `name` lo que se ve en el panel.

## Limitaciones conocidas (v1.1.0)
- Las zonas no se ajustan a la formación (sin pattern match): un Cover 4 contra Trips se ve igual que contra 2x2.
- Un receptor cuenta como pegado (TE) si está a menos de 1.25 espacios de OL por fuera del tackle.
