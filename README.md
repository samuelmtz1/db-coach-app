# DB Coach

> **English summary:** DB Coach teaches cornerbacks and safeties to read and adjust to coverages. Choose a front, a coverage and an offensive formation to see alignments, zones and assignments. I use it to teach my players. I built it with Claude Code: I defined the product and the football rules and reviewed the results. [Open the app](https://samuelmtz1.github.io/db-coach-app/). The interface is in Spanish.

Herramienta para enseñar a corners y safeties a leer, identificar y ajustar coberturas.
Eliges un frente, un cover y una formación ofensiva, y ves la alineación, las zonas y las asignaciones estilo Madden.

**App:** https://samuelmtz1.github.io/db-coach-app/

## Qué hay hoy (v1.1.0)
- Tab **Coberturas**: 6 frentes × 5 covers contra 6 formaciones, con balón en hash izquierdo, centro o hash derecho.
- Toggle **Pre-snap / Post-snap** (también con la barra espaciadora en teclado).
- Toca un defensor para ver su responsabilidad. En pre-snap lo puedes arrastrar; **Reset** lo regresa.
- Tab **Verificar**: revisa las 30 combinaciones defensor por defensor y copia un resumen para pedir correcciones.

Lo que viene está en [CHANGELOG.md](CHANGELOG.md) y en el plan de versiones de [docs/SOP.md](docs/SOP.md).

## Correr en local
Requiere Node 22.

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests del motor
npm run build    # build de producción en dist/
```

## Documentación
- [CLAUDE.md](CLAUDE.md): contexto completo del proyecto para sesiones de Claude.
- [docs/SOP.md](docs/SOP.md): procedimientos de contenido, desarrollo, release y uso en práctica.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): cómo está organizado el código.
- [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md): cómo agregar o corregir frentes, covers y formaciones.
