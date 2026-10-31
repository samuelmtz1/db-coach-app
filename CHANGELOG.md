# Changelog

Todas las versiones siguen [SemVer](https://semver.org/lang/es/): `MAYOR.MENOR.PARCHE`.
- **PARCHE**: correcciones de contenido o bugs.
- **MENOR**: funcionalidad nueva compatible (tab, frente, cover, formación).
- **MAYOR**: cambios que rompen lo anterior (p. ej. formato de jugadas guardadas).

## [1.1.0] - 2026-10-31
### Agregado
- Los 6 frentes (4-3-4, 3-4-4, 4-2-5, 3-3-5, 3-5-3, 5-3-3) con los 5 covers base (0, 2, 3, 4, 6): 30 combinaciones cargadas con la versión estándar, para revisar en el modo Verificar.
- Nickel del lado de la strength, sobre el slot fuerte (4-2-5 y 3-3-5).
- Híbridos: en 3-5-3 y 5-3-3, el OLB strong (Spur / Bandit) hace el trabajo del safety que falta en Cover 2, 4 y 6.
- 5 formaciones nuevas: Shotgun 3x1, Trips, Bunch, Pro / I-Form (TE, FB y RB) y Empty 3x2.
- Arrastrar defensores en pre-snap (dedo, mouse o flechas del teclado). El rol no cambia; una silueta marca la alineación de regla. Botón **Reset**, y los movimientos se borran solos al cambiar frente, cover, formación o hash.
- Tab **Verificar**: matriz de las 30 combinaciones, lista de los 11 defensores con rol, alineación y profundidad (Shotgun 2x2, balón al centro), marcas ✔ OK / ✘ Corregir con nota, diagrama de la combinación y botón **Copiar resumen** para pegar en el chat. Se guarda en el dispositivo.
- Cada defensor muestra su regla de alineación en palabras ("Apex strong", "Sobre el #1 weak, 1 yd por fuera").
### Cambiado
- Híbrido: letra en rojo y borde del círculo punteado en el color de su responsabilidad (antes, anillo blanco extra).
- Cover 0: si el receptor de un defensor no existe en la formación, toma su alterno (p. ej. el Will toma al FB en I-Form) o se suma al blitz.
- El apex ignora a un TE pegado y se ancla entre el TE y el #1.
- Si dos alineaciones caen encimadas (Bunch, Trips), el motor las separa lo justo para que no se tapen los círculos.
- Los tabs usan la URL (`#coberturas`, `#verificar`): recargar abre el mismo tab.

## [1.0.1] - 2026-10-30
### Agregado
- `CLAUDE.md`: overview, layout, decisiones, roadmap y entorno del proyecto, para continuar en sesiones nuevas sin perder contexto.
### Cambiado
- SOP: ramas `release/X.Y.Z` para agrupar el trabajo de cada versión.

## [1.0.0] - 2026-10-30
### Agregado
- Campo vertical estilo transmisión: hashes de high school (NFHS), números, LOS.
- Motor de alineación: detección de strength, numeración de receptores (#1, #2, #3), alineación por técnica, apex, receptor, balón y hash.
- Zonas Deep 1/3, 1/2, 1/4, Flat, Curl/Flat, Hook/Curl y Hole, ancladas al campo o al balón.
- Tab Coberturas con 4-3-4 + Cover 3 (Sky) vs Shotgun 2x2.
- Selector de hash (izquierdo, centro, derecho): la defensa se reajusta sola.
- Toggle Pre-snap / Post-snap con recorrido de cada defensor a su zona. Barra espaciadora como atajo.
- Panel de responsabilidad al tocar un defensor.
- Deploy automático a GitHub Pages.

[1.1.0]: https://github.com/samuelmtz1/db-coach-app/releases/tag/v1.1.0
[1.0.1]: https://github.com/samuelmtz1/db-coach-app/releases/tag/v1.0.1
[1.0.0]: https://github.com/samuelmtz1/db-coach-app/releases/tag/v1.0.0
