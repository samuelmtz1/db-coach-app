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
3. Para cada defensor del frente: toma su asignación del cover, calcula la alineación pre-snap (`AlignRule`) y su destino post-snap (zona, man, rush o blitz).

Versión de la app: `package.json` → `__APP_VERSION__` (definido en `vite.config.ts`) → pie de página.
