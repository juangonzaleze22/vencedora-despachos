# Fuentes Locales

Este directorio contiene las fuentes Montserrat y Roboto almacenadas localmente.

## Instalación de Fuentes

### Opción 1: Descargar manualmente (Recomendado)

1. Visita [Google Web Fonts Helper](https://gwfh.mranftl.com/fonts/montserrat) para Montserrat
2. Visita [Google Web Fonts Helper](https://gwfh.mranftl.com/fonts/roboto) para Roboto
3. Selecciona los pesos necesarios:
   - **Montserrat**: 300, 400, 500, 600, 700, 800, 900
   - **Roboto**: 300, 400, 500, 700
4. Descarga los archivos `.woff2` y guárdalos en este directorio con los nombres:
   - `Montserrat-Light.woff2`
   - `Montserrat-Regular.woff2`
   - `Montserrat-Medium.woff2`
   - `Montserrat-SemiBold.woff2`
   - `Montserrat-Bold.woff2`
   - `Montserrat-ExtraBold.woff2`
   - `Montserrat-Black.woff2`
   - `Roboto-Light.woff2`
   - `Roboto-Regular.woff2`
   - `Roboto-Medium.woff2`
   - `Roboto-Bold.woff2`

### Opción 2: Usar el script (requiere conexión inicial)

```bash
node scripts/download-fonts.js
```

Nota: El script solo muestra instrucciones. Las fuentes deben descargarse manualmente.

## Estructura

```
public/fonts/
├── Montserrat-*.woff2 # Archivos de fuente Montserrat
└── Roboto-*.woff2     # Archivos de fuente Roboto

src/fonts/
└── fonts.css          # Definiciones @font-face (rutas apuntan a /fonts/)
```

**IMPORTANTE**: Las fuentes deben guardarse en `public/fonts/` (no en `src/fonts/`) porque son archivos estáticos que Astro sirve directamente.

Las fuentes se cargan automáticamente mediante `fonts.css` que se importa en `input.css`.

