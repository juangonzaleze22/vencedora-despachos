# Guía de Configuración Rápida

## Pasos Iniciales

### 1. Instalar Dependencias
```bash
npm install
```
Esto instalará todas las dependencias. Flowbite se importa directamente desde `node_modules` (Astro lo maneja automáticamente).

### 2. Descargar Fuentes (Solo Primera Vez)

Las fuentes deben descargarse manualmente ya que son archivos grandes:

#### Opción A: Google Web Fonts Helper (Recomendado)

1. **Montserrat**: 
   - Visita: https://gwfh.mranftl.com/fonts/montserrat
   - Selecciona pesos: 300, 400, 500, 600, 700, 800, 900
   - Descarga formato: **woff2**
   - Guarda los archivos en `public/fonts/` (NO en `src/fonts/`) con estos nombres:
     - `Montserrat-Light.woff2` (300)
     - `Montserrat-Regular.woff2` (400)
     - `Montserrat-Medium.woff2` (500)
     - `Montserrat-SemiBold.woff2` (600)
     - `Montserrat-Bold.woff2` (700)
     - `Montserrat-ExtraBold.woff2` (800)
     - `Montserrat-Black.woff2` (900)

2. **Roboto**:
   - Visita: https://gwfh.mranftl.com/fonts/roboto
   - Selecciona pesos: 300, 400, 500, 700
   - Descarga formato: **woff2**
   - Guarda los archivos en `public/fonts/` (NO en `src/fonts/`) con estos nombres:
     - `Roboto-Light.woff2` (300)
     - `Roboto-Regular.woff2` (400)
     - `Roboto-Medium.woff2` (500)
     - `Roboto-Bold.woff2` (700)

#### Opción B: Google Fonts Directo

1. Visita: https://fonts.google.com/specimen/Montserrat
2. Click en "Download family"
3. Extrae los archivos `.woff2` y renómbralos según la lista anterior
4. Repite para Roboto: https://fonts.google.com/specimen/Roboto

### 3. Iniciar Desarrollo
```bash
npm run dev
```

## Verificación

Después de completar los pasos:

1. ✅ Flowbite está disponible desde `node_modules` (Astro lo importa automáticamente)
2. ✅ Las fuentes deben estar en `public/fonts/*.woff2` (archivos estáticos)
3. ✅ La aplicación debe funcionar completamente en local
4. ✅ Todas las dependencias están disponibles localmente

## Estructura de Archivos Esperada

```
public/
└── fonts/
    ├── Montserrat-Light.woff2
│   ├── Montserrat-Regular.woff2
│   ├── Montserrat-Medium.woff2
│   ├── Montserrat-SemiBold.woff2
│   ├── Montserrat-Bold.woff2
│   ├── Montserrat-ExtraBold.woff2
│   ├── Montserrat-Black.woff2
│   ├── Roboto-Light.woff2
│   ├── Roboto-Regular.woff2
│   ├── Roboto-Medium.woff2
│   └── Roboto-Bold.woff2
└── js/
    └── init-flowbite.ts  # Importa Flowbite desde node_modules
```

## Solución de Problemas

### Las fuentes no se cargan
- Verifica que los archivos `.woff2` estén en `public/fonts/` (NO en `src/fonts/`)
- Verifica que los nombres de archivo coincidan exactamente con `fonts.css`
- Verifica que `fonts.css` esté siendo importado en `input.css`

### Flowbite no funciona
- Verifica que Flowbite esté instalado: `npm list flowbite`
- Verifica que `src/js/init-flowbite.ts` exista
- Verifica que BaseLayout.astro importe init-flowbite correctamente

### La aplicación no carga recursos
- Verifica que Flowbite esté instalado: `npm list flowbite`
- Verifica que las fuentes estén en `public/fonts/` (archivos estáticos)
- Asegúrate de que `import 'flowbite'` esté en BaseLayout.astro

## Notas Importantes

- ⚠️ **Las fuentes NO están en el repositorio** (archivos grandes)
- ⚠️ **Deben descargarse manualmente** la primera vez
- ✅ **Después de la primera configuración, todo funciona en local**
- ✅ **No se requiere conexión a internet** para usar la aplicación
- ✅ **Todas las dependencias están en `node_modules`** - Astro las procesa automáticamente
- ✅ **Flowbite se importa directamente** desde node_modules, no requiere copia manual

