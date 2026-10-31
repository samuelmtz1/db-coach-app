# CLAUDE.md: DB Coach

Contexto para cualquier sesión nueva de Claude en este repo. Léelo completo antes de tocar código.

## Qué es
App web para que Samuel, coach de Defensive Backs de high school, enseñe a corners y safeties a leer, identificar y ajustar coberturas. Elige un **frente** y un **cover**, y la app dibuja la alineación, las zonas y las asignaciones estilo Madden, ajustadas a la formación ofensiva y al hash. Se usa en un iPad conectado a una TV, frente a los jugadores.

- App: https://samuelmtz1.github.io/db-coach-app/
- Repo: https://github.com/samuelmtz1/db-coach-app

## Cómo trabajar con Samuel
- Habla en **español**. La UI va en español, con la **terminología de football en inglés** (Cover 3, Deep 1/3, Hook/Curl, Mike, Will...).
- **Claude es el gatekeeper del contenido**: Samuel describe correcciones de football en la conversación y Claude edita `src/data/`. Nunca le pidas que edite archivos TypeScript.
- Cuando falte información de football, propón la versión estándar y deja que él corrija. Su sistema (documento o PDF) va a `docs/source/` y es la fuente de verdad.
- Los cambios se agrupan en lotes semanales o mensuales; una corrección urgente puede salir como parche.
- Antes de mover algo grande, pregunta. Cada milestone termina con una revisión suya en iPad/TV.

## Estado actual
- **v1.0.0 publicada** (2026-10-30): tab Coberturas con 4-3-4 + Cover 3 (Sky) vs Shotgun 2x2, selector de hash, toggle pre/post-snap y panel de responsabilidad.
- **Revisión de Samuel a v1.0.0:** aprobó el menú (espaciado, colores, tipografía), el campo, el pre/post-snap y los cambios de hash.
- **v1.0.1 publicada** (2026-10-30): `CLAUDE.md` y ramas `release/`. Merge en `main` vía PR #1. Falta el tag `v1.0.1`.
- **En curso: v1.1.0** en la rama `release/1.1.0`. Las decisiones quedaron cerradas con Samuel el 2026-10-30 (ver "v1.1.0: decisiones cerradas").
- **Pendiente de Samuel:**
  - Revisar las 30 combinaciones en el modo Verificar cuando salga v1.1.0, incluida la Cover 3 de v1.0.0.
  - Su documento o PDF con frentes y covers, si lo consigue. No bloquea nada: entra como parches 1.1.x.

## Roadmap (SemVer, una versión menor por milestone)
| Versión | Contenido | Estado |
|---|---|---|
| v1.0.0 | Setup, deploy, 4-3-4 + Cover 3 vs 2x2 | ✅ |
| v1.0.1 | CLAUDE.md, convención de ramas `release/` | ✅ |
| v1.1.0 | 6 frentes × 5 covers, 6 formaciones, arrastrar defensores con override y reset, modo **Verificar** | en curso |
| v1.1.x | Correcciones de Samuel desde el modo Verificar | |
| v1.2.0 | **Comparar**: dos campos lado a lado con los cambios de rol resaltados (`engine/diff.ts`) | |
| v1.3.0 | **Whiteboard** | |
| v1.4.0 | Biblioteca de jugadas (guardado manual, `localStorage`, `schemaVersion`), exportar PNG con Web Share, PWA offline | |
| v2.0.0 | Animación snap → rutas → drops | |

**v1.1.0: decisiones cerradas (2026-10-30)**
- **Fuente:** se cargan las 30 combinaciones con la versión **estándar** de football, sin esperar el PDF. Samuel las revisa en el modo Verificar y sus correcciones salen como parches 1.1.x.
- **Criterio de lanzamiento:** v1.1.0 sale cuando el contenido está cargado, los tests pasan y la app se ve bien en iPad. **No** se espera a que Samuel revise las 30 combinaciones.
- **Frentes:** 4-3-4, 3-4-4, 4-2-5, 3-3-5, 3-5-3, 5-3-3.
- **Nickel** (4-2-5 y 3-3-5): del lado de la **strength**, sobre el slot fuerte.
- **Híbrido** (3-5-3 y 5-3-3): el **OLB del lado de la strength** (Spur/Bandit) toma el rol del DB faltante en Cover 2, 4 y 6, con `hybrid: true`. En Cover 3 sigue como LB en el curl/flat.
- **Covers** (solo la versión base):
  - **Cover 0:** CBs en man sobre los #1. El defensor más cercano a cada uno cubre en man al #2 strong, al #2 weak y al RB. FS sobre el #3 si existe. Todos los demás hacen blitz o rush. Sin safety profundo.
  - **Cover 2:** zona. CBs en el flat, safeties en las dos mitades profundas, LBs en hook/curl y hole.
  - **Cover 3:** Sky (como v1.0.0).
  - **Cover 4:** quarters. Los 4 DBs en cuartos profundos, sin pattern match.
  - **Cover 6:** quarters hacia la **strength**, Cover 2 (half + CB en el flat) hacia el lado débil.
  - Tampa 2, Sky/Buzz/Cloud y pattern match quedan para la fase 2.
- **Formaciones:**
  - **Shotgun 2x2:** la de v1.0.0.
  - **Shotgun 3x1:** 3 receptores abiertos con splits normales.
  - **Trips:** 3 receptores más pegados, con el slot reducido.
  - **Bunch:** 3 receptores apiñados.
  - **Pro/I-Form:** TE, FB y RB en I, QB bajo center.
  - **Empty 3x2:** 5 receptores, sin RB.
- **Arrastrar defensores:** mueve solo la alineación **pre-snap**; el rol (zona o man) no cambia. Los cambios se borran solos al cambiar frente, cover, formación o hash, y también con el botón **Reset**.
- **Modo Verificar** (`src/features/verify/`):
  - Una tabla por frente + cover con los 11 defensores: rol, zona y profundidad.
  - Se verifica contra **Shotgun 2x2 con balón al centro**; la nota guarda qué formación estaba viendo.
  - Cada fila se marca ✔ OK o ✘ Corregir, con nota. El estado se guarda en el dispositivo (`localStorage`).
  - Botón "Copiar resumen" genera texto para pegar en el chat.

**v1.3.0, Whiteboard:**
- Más uso en vivo que preparado.
- Plantillas de formación y jugadores ofensivos arrastrables.
- Menú con 12 rutas: slant, out, go, fade, post, curl, flat, wheel, screen, checkdown, dig, comeback. También se pueden dibujar punto por punto.
- Toggle de línea **sólida / punteada** para el motion y un **círculo punteado** para la posición antes del snap.
- Lápiz libre, borrador, deshacer/rehacer.
- Overlay de frente + cover que se recalcula al mover receptores. Toggle para mostrar u ocultar la defensa.
- Solo formación + concepto de ruta, sin profundidades exactas.

**Fuera de alcance por ahora:** motion animado, shifts, substituciones (Samuel los simula con líneas punteadas), login/nube, tarjetas de reglas por posición, variantes de cover (Sky/Buzz/Cloud, Tampa 2...), pattern match.

## Stack y comandos
Vite 8 + React 19 + TypeScript + Tailwind 4 + Zustand + Vitest. Sin backend. Fuentes autohospedadas con `@fontsource`.

```bash
export PATH="$HOME/.local/node/bin:$PATH"   # Node NO está en el PATH por defecto (ver Entorno)
npm run dev       # desarrollo
npm test          # tests del motor (Vitest)
npm run build     # tsc -b + vite build → dist/
npx eslint .      # lint
npm run preview   # sirve dist/ en /db-coach-app/
```

## Layout
```
CLAUDE.md, README.md, CHANGELOG.md
docs/SOP.md             procedimientos: contenido, desarrollo, release, uso en práctica
docs/ARCHITECTURE.md    capas y coordenadas
docs/CONTENT-GUIDE.md   cómo editar frentes/covers/formaciones (atajos de roles.ts)
docs/source/            documentos/PDFs del coach (fuente de verdad)
.github/workflows/deploy.yml   push a main → test + build + deploy a GitHub Pages
src/
  app/App.tsx           header, tabs (Comparar/Whiteboard marcadas "Próximamente"), footer con versión
  features/coverage-lab/  CoverageLab.tsx (controles + estados), Diagram.tsx (capas del campo)
  components/field/     Field.tsx (campo SVG), Players.tsx, Overlays.tsx (zonas, flechas, man), Legend.tsx
  components/ui/        OptionGroup.tsx (botones tipo radio, 44px mínimo)
  engine/               lógica pura, sin React
    types.ts            todos los tipos (AlignRule, Role, Assignment, DefenseSnapshot...)
    geometry.ts         medidas del campo, hashes NFHS, OL_SPACING, técnicas
    strength.ts         placeOffense, detectStrength, findReceiver
    zones.ts            resolveZone: elipses + punto de drop
    align.ts            alignDefense(): el corazón del motor
    align.test.ts       tests
  data/                 contenido de football (lo que más se edita)
    fronts/             un archivo por frente + index.ts (los no listos van con available:false)
    coverages/index.ts  catálogo de covers
    formations/         un archivo por formación + index.ts
    assignments.ts      matriz frente → cover → jugador → { role, align?, hybrid? }
    roles.ts            atajos: zone(), man(), RUSH, BLITZ, tech(), apex(), onReceiver(), overBall(), onHash()
    positions.ts        etiquetas editables (short dentro del círculo, name en el panel)
    theme.ts            colores de zonas/roles/campo
  store/labStore.ts     Zustand: frente, cover, formación, hash, fase, seleccionado
```

## Reglas de arquitectura
- **El contenido de football son datos.** Agregar un frente, un cover o una formación = editar `src/data/`, sin tocar componentes.
- `src/engine/` no importa React, y los componentes no contienen reglas de football.
- Flujo: `data/` → `alignDefense(front, coverageId, assignments, formation, hash)` → `DefenseSnapshot` → SVG.
- **Coordenadas en yardas:**
  - `x` va de 0 (sideline izquierdo) a 53.3, `y` desde la LOS (positivo hacia la defensa). En SVG, `sy(y) = -y`.
  - Vista estilo Madden: campo vertical, ofensiva abajo.
- Las asignaciones usan **lados relativos** `'S'`/`'W'`, nunca izquierda/derecha. Strength = lado con más receptores; si empatan, el field; con balón al centro, la derecha.
- Receptores: `S1`/`S2`/`S3`/`W1`... de afuera hacia adentro, más `RB`. Si falta un receptor, la alineación cae al apex de su lado.
- Zonas profundas ancladas al campo (tercios, mitades, cuartos); zonas de abajo ancladas al sideline o al balón. El drop del curl/flat se recorre en el boundary.
- `OL_SPACING = 2.1` exagera la línea a propósito para que los círculos no se encimen. Las formaciones usan `OL_SPACING` para la OL.
- Si un frente + cover no tiene asignaciones, se lanza `MissingAssignmentError` y la UI muestra un aviso en vez del diagrama.
- Todo cover nuevo necesita los 11 jugadores del frente; el test recorre todas las combinaciones disponibles en los 3 hashes.

## Diseño (antislop en modo DURING)
Los skills `antislop`, `antislop-layoutmobile`, `frontend-design`, `web-interface-guidelines` y `webapp-testing` se aplican mientras se construye. Cada release se entrega con su reporte PASS/FAIL del Delivery Gate.
- **Design Read:** herramienta de enseñanza para DBs de high school en TV/iPad, lenguaje de transmisión deportiva / videojuego. Diales: ENERGY 2 / RHYTHM 1 / MOTION 2. El movimiento solo se usa para mostrar el recorrido pre → post snap y se apaga con `prefers-reduced-motion`.
- **Tema oscuro fijo**, a propósito: en la TV la atención va al campo y no deslumbra.
- **Colores** (tokens en `src/index.css`):
  - Fondo `#0d1117`, paneles `#161b22` / `#1f2630`, bordes `#2d3540`, texto `#e6edf3`, texto secundario `#9ba6b4`.
  - Acento `#ffd23f`: selección y botones activos.
- **Tipografía:** Barlow Condensed (títulos, etiquetas, campo; estilo gráfico de transmisión) y Barlow (texto).
- **Colores de responsabilidad** (`data/theme.ts`): Deep `#2f80ed`, Hook/Curl `#a259ff`, Flat y Curl/Flat `#ffd23f`, Man `#ff4d4d`, Rush `#c9d1d9`, Blitz `#ff8a00`.
  - El anillo del defensor usa el color de su responsabilidad: es el motivo de identidad de la app.
  - **Híbrido** (decisión de Samuel para v1.1.0): letra en **rojo** y el borde del propio círculo **punteado**, en el color de su responsabilidad. Sustituye al anillo blanco extra de v1.0.0. La leyenda debe reflejarlo.
- **No hay logo:** "DB Coach" va como texto. No crees logos, íconos ni imágenes sin preguntar.
- Botones de 44px mínimo, foco visible, controles navegables con teclado. La barra espaciadora alterna el snap.
- Controles que aún no existen: se ven deshabilitados con la nota de la versión en que llegan. Nada de botones muertos.

## Versiones, ramas y release
- **SemVer desde 1.0.0.** La versión está en `package.json` y se muestra en el footer vía `__APP_VERSION__`.
- **Ramas:**
  - `release/X.Y.Z` agrupa el trabajo de una versión.
  - Dentro, o para cambios sueltos: `feat/…`, `fix/…`, `content/…`.
  - Nunca trabajes directo en `main`.
- **Release:**
  1. Subir la versión en `package.json`.
  2. Agregar la entrada en `CHANGELOG.md` (en español, formato Keep a Changelog).
  3. Merge a `main`, que dispara el deploy automático.
  4. `git tag -a vX.Y.Z` y `git push origin vX.Y.Z`.
  5. Samuel crea el GitHub Release desde la web, porque no hay `gh`.
- Commits en español, con la línea de atribución que indique el system reminder.
- **Verificación antes de entregar:**
  - Correr `npm test`, `npm run build` y `npx eslint .`.
  - Correr `npm run preview` y revisar con Playwright usando Chrome: iPad horizontal 1180×820 y vertical, teléfono 390×844, escritorio.
  - Comprobar que no haya overflow horizontal ni errores de consola.
  - Hacer click-through de cada control.

## Entorno (Mac de Samuel)
- macOS 13 Intel: Homebrew no funciona aquí (Tier 3). **Node 22** está instalado desde nodejs.org en `~/.local/node` y **no está en el PATH** de los shells no interactivos: antepón `export PATH="$HOME/.local/node/bin:$PATH"`.
- No hay `gh`. `git push` funciona con la credencial de GitHub de VS Code. GitHub Pages ya está activado con el source "GitHub Actions".
- Verificación visual: instala `playwright-core` en el scratchpad (no en el proyecto) y lánzalo con `chromium.launch({ channel: 'chrome' })`.
