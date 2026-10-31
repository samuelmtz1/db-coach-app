# DB Coach

Herramienta para enseñar a corners y safeties a leer, identificar y ajustar coberturas.
Eliges un frente, un cover y una formación ofensiva, y ves la alineación, las zonas y las asignaciones estilo Madden.

**App:** https://samuelmtz1.github.io/db-coach-app/

## Qué hay hoy (v1.0.0)
- Tab **Coberturas**: 4-3-4 + Cover 3 vs Shotgun 2x2, con balón en hash izquierdo, centro o hash derecho.
- Toggle **Pre-snap / Post-snap** (también con la barra espaciadora en teclado).
- Toca un defensor para ver su responsabilidad.

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
- [docs/SOP.md](docs/SOP.md): procedimientos de contenido, desarrollo, release y uso en práctica.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): cómo está organizado el código.
- [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md): cómo agregar o corregir frentes, covers y formaciones.
