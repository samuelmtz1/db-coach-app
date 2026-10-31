# Arquitectura

Principio: **el contenido de football son datos, no código.**

```
src/data/  ──►  src/engine/alignDefense()  ──►  src/components/field/  (SVG)
 (qué)            (cómo, función pura)            (dibujo)
```

| Carpeta | Qué contiene |
|---|---|
| `src/data/` | Frentes, covers, formaciones, asignaciones, nombres de posiciones, colores. Es lo que más se edita. |
| `src/engine/` | Lógica pura y con tests: geometría del campo, strength, zonas, alineación. No importa React. |
| `src/components/field/` | El campo y sus piezas en SVG (jugadores, zonas, flechas, leyenda). |
| `src/components/ui/` | Controles reutilizables. |
| `src/features/` | Un folder por tab (`coverage-lab/`, y luego `compare/`, `whiteboard/`, `verify/`). |
| `src/store/` | Estado de la app (Zustand). |
| `src/app/` | Layout, header y navegación. |

## Coordenadas
Todo se mide en yardas.
- `x`: 0 = sideline izquierdo, 53.3 = sideline derecho (vista con la ofensiva abajo).
- `y`: 0 = LOS, positivo hacia la defensa.

Los hashes de high school están a 17.78 yd (53'4") de cada sideline. La línea ofensiva se dibuja más abierta que la real (`OL_SPACING`) para que los círculos no se encimen.

## Flujo de `alignDefense`
1. `placeOffense`: ubica a la ofensiva según el hash.
2. `detectStrength`: lado con más receptores (si empatan, el lado del field) y numeración #1, #2, #3 de afuera hacia adentro.
3. Para cada defensor del frente: toma su asignación del cover y calcula la alineación pre-snap (`AlignRule`), con su etiqueta en palabras (`alignLabel`).
4. `separate`: si dos alineaciones caen encimadas (Bunch, Trips), las abre lo justo (`MIN_GAP`).
5. Aplica los `overrides` (defensores arrastrados a mano): cambian `pre`, no el rol. `auto` guarda la posición de regla.
6. Destino post-snap: zona, man, rush o blitz. Un man sin receptor prueba su `fallback` y, si no hay nadie, hace blitz.

## Estado
- `store/labStore.ts`: tab Coberturas (frente, cover, formación, hash, fase, overrides). No se guarda.
- `store/verifyStore.ts`: tab Verificar. Se guarda en `localStorage` (`db-coach:verify`, versión 1) con `persist` de Zustand.
  Cada marca guarda un `snapshot` (rol | alineación | profundidad); si el contenido cambia, la marca queda como "cambió, revísalo otra vez".
- `features/verify/checklist.ts`: lógica pura de Verificar (tabla, progreso, resumen), con tests.

## Tabs
`app/App.tsx` lee el tab de la URL (`#coberturas`, `#verificar`).

Versión de la app: `package.json` → `__APP_VERSION__` (definido en `vite.config.ts`) → pie de página.
