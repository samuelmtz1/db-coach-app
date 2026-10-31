# SOP: DB Coach

## SOP-1: Agregar o corregir contenido de football
El coach pide, Claude edita.

1. El coach describe el cambio en la conversación con Claude (desde v1.1.0 también puede pegar el resumen del modo "Verificar"). Si tiene un documento o PDF con su sistema, va a `docs/source/`.
2. Claude edita `src/data/` siguiendo [CONTENT-GUIDE.md](CONTENT-GUIDE.md).
3. Claude corre `npm test` y `npm run dev` y lo revisa visualmente.
4. Rama → commit → PR → merge a `main` → deploy automático.

Los cambios se agrupan en lotes semanales o mensuales. Una corrección urgente puede salir sola como parche.

## SOP-2: Desarrollo
- Ramas: `release/X.Y.Z` agrupa el trabajo de una versión; dentro de ella, o para cambios sueltos, `feat/…` (funcionalidad), `fix/…` (bug), `content/…` (datos de football). No se trabaja directo en `main`.
  La única excepción fue el commit inicial de v1.0.0, que creó `main`.
- Cada PR: `npm test` en verde, `npm run build` sin errores y captura de pantalla si cambia algo visual.
- `src/engine/` no importa React. Los componentes no contienen reglas de football.

## SOP-3: Release y verificación
1. Subir la versión en `package.json` según SemVer:
   - PARCHE (1.1.**1**): corrección de contenido o bug.
   - MENOR (1.**2**.0): funcionalidad nueva.
   - MAYOR (**2**.0.0): cambio que rompe lo anterior.
2. Agregar la entrada en `CHANGELOG.md`.
3. Merge a `main` → `git tag vX.Y.Z` → `git push --tags` → crear el GitHub Release con las notas del changelog.
4. GitHub Actions corre tests, build y deploy a Pages (unos 2 minutos).
5. Checklist en iPad: abrir la URL, revisar la versión en el pie de página, probar cada tab y control.

### Plan de versiones
| Versión | Contenido |
|---|---|
| v1.0.0 | Setup, deploy y primer caso: 4-3-4 + Cover 3 vs 2x2 |
| v1.1.0 | 6 frentes × 5 covers, 6 formaciones, arrastrar defensores, modo Verificar |
| v1.2.0 | Comparar (lado a lado) |
| v1.3.0 | Whiteboard |
| v1.4.0 | Biblioteca de jugadas, exportar PNG, app instalable offline |
| v1.x.y | Lotes de correcciones |
| v2.0.0 | Animación |

## SOP-4: Uso en práctica
- **Antes:** revisa la combinación que vas a enseñar (y, desde v1.3.0, prepara jugadas en el whiteboard).
- **En la sesión:** iPad conectado a la TV (AirPlay o HDMI), en horizontal.
- **Flujo de enseñanza:**
  1. Muestra la formación en **Pre-snap**.
  2. Pregunta al DB qué cover cree que es y cuál es su responsabilidad.
  3. Cambia a **Post-snap** para revelar zonas y drops.
  4. Cambia el hash y repite: ¿qué se movió y por qué?
