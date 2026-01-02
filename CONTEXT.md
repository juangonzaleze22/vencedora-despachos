# Contexto del Proyecto - Vencedora Despachos

## 📋 Resumen del Proyecto

Aplicación web desarrollada con tecnologías modernas siguiendo estándares de calidad y buenas prácticas.

## 🛠️ Stack Tecnológico

### Frontend
- **Astro v4+**: Framework web moderno para construir sitios rápidos
  - Documentación: https://docs.astro.build/en/getting-started/
  - Arquitectura de islas para máximo rendimiento
  - Generación estática para PWA offline
- **HTML5**: Estructura semántica y accesible (generada por Astro)
- **CSS**: Solo para configuraciones personalizadas (Tailwind maneja los estilos)
- **JavaScript (Vanilla)**: Para interactividad y lógica de negocio (islas de Astro)

### Frameworks y Librerías
- **Tailwind CSS v3.4+**: Framework utility-first para todos los estilos
- **Flowbite v2.2+**: Librería de componentes UI basada en Tailwind CSS
  - Documentación: https://flowbite.com/docs/getting-started/quickstart/
  - **REGLA CRÍTICA**: Todos los componentes UI deben ser de Flowbite para mantener consistencia

### Almacenamiento Local
- **IndexedDB**: Base de datos del lado del cliente para almacenamiento local persistente

### Recursos Locales (Sin Dependencia de Internet)
- **Flowbite**: Copiado desde `node_modules` a `public/src/js/vendor/` para uso local
- **Fuentes**: Montserrat y Roboto almacenadas localmente en `src/fonts/`
- **Sin CDN**: Todas las dependencias están en `node_modules` y se copian localmente
- **Aplicación local**: Funciona completamente en local sin necesidad de conexión a internet
- **Astro**: Genera sitio estático que funciona en local

## 🎨 Diseño y Estilos

### Tema
- **Dark Theme**: Siempre activo por defecto
- Configurado mediante `darkMode: 'class'` en Tailwind
- Clase `dark` aplicada al elemento `<html>`

### Tipografía
- **Títulos (h1-h6)**: Fuente **Montserrat**
  - Clase Tailwind: `font-title`
  - Pesos disponibles: 300, 400, 500, 600, 700, 800, 900
  
- **Texto/Contenido**: Fuente **Roboto**
  - Clase Tailwind: `font-body`
  - Pesos disponibles: 300, 400, 500, 700

### Componentes UI
- **Usar exclusivamente componentes de Flowbite**
- No crear componentes UI personalizados sin antes revisar Flowbite
- Mantener consistencia visual usando el sistema de diseño de Flowbite

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── js/
│   │   ├── components/        # Componentes JavaScript reutilizables
│   │   ├── utils/             # Funciones utilitarias compartidas
│   │   │   ├── indexedDB.js   # Utilidades para IndexedDB
│   │   │   └── serviceWorker.js # Utilidades para Service Worker
│   │   └── main.js            # Scripts principales (si es necesario)
│   ├── types/                 # Interfaces y tipos TypeScript
│   │   └── index.ts           # Interfaces compartidas del proyecto
│   ├── css/
│   │   ├── input.css          # CSS fuente con directivas Tailwind
│   │   └── output.css         # CSS compilado (generado automáticamente)
│   ├── fonts/                 # Fuentes locales (Montserrat, Roboto)
│   │   ├── fonts.css          # Definiciones @font-face
│   │   └── *.woff2            # Archivos de fuente (descargar manualmente)
│   └── assets/                # Recursos estáticos (imágenes, etc.)
├── scripts/
│   ├── copy-assets.js         # Script para copiar recursos locales
│   └── download-fonts.js      # Script para descargar fuentes
├── sw.js                      # Service Worker
├── manifest.json              # Manifest para PWA
├── offline.html               # Página offline
├── index.html                 # Página principal
├── package.json               # Dependencias del proyecto
├── tailwind.config.js         # Configuración de Tailwind CSS
├── postcss.config.js          # Configuración de PostCSS
├── vite.config.js             # Configuración de Vite
├── .cursorrules               # Reglas para el asistente de código
└── README.md                  # Documentación del proyecto
```

## ✅ Reglas de Desarrollo

### 1. Componentes UI
- ✅ **SIEMPRE** usar componentes de Flowbite
- ❌ **NUNCA** crear componentes UI desde cero sin revisar Flowbite primero
- ✅ Revisar documentación: https://flowbite.com/docs/components/

### 2. Estilos
- ✅ Usar clases de Tailwind CSS
- ✅ Seguir el sistema de diseño de Flowbite
- ❌ Evitar CSS personalizado (solo cuando sea absolutamente necesario)
- ✅ Mantener consistencia en espaciados, colores y tamaños

### 3. Código
- ✅ **DRY (Don't Repeat Yourself)**: Evitar duplicidad
- ✅ Crear funciones reutilizables en `src/js/utils/`
- ✅ Crear componentes reutilizables en `src/js/components/`
- ✅ Código limpio y bien documentado
- ✅ Nombres descriptivos para variables y funciones
- ✅ **Código en inglés**: Variables, funciones, tipos, interfaces, propiedades
- ✅ **Textos en español**: Mensajes al usuario, contenido visible, labels

### 4. HTML
- ✅ Estructura semántica
- ✅ Accesibilidad (ARIA cuando sea necesario)
- ✅ Validar HTML

### 5. JavaScript y TypeScript
- ✅ Funciones puras cuando sea posible
- ✅ Manejo eficiente de eventos
- ✅ Inicialización correcta de componentes Flowbite
- ✅ Usar data-attributes de Flowbite cuando sea posible
- ✅ **Siempre usar interfaces** para tipado coherente
- ✅ Definir interfaces para todos los objetos y estructuras de datos
- ✅ Mantener tipado consistente en todo el proyecto
- ✅ Preferir interfaces sobre tipos cuando sea posible

### 6. Dark Theme
- ✅ Siempre configurado y activo
- ✅ Probar todos los componentes en modo oscuro
- ✅ Usar `dark:` de Tailwind para variaciones si es necesario

### 7. Tipografía
- ✅ `font-title` (Montserrat) para todos los títulos
- ✅ `font-body` (Roboto) para todo el texto/contenido
- ✅ Aplicar consistentemente en todo el proyecto

### 8. IndexedDB
- ✅ Usar IndexedDB para almacenamiento local persistente
- ✅ Utilizar las funciones de `src/js/utils/indexedDB.js`
- ✅ Configurar object stores según necesidades del proyecto
- ✅ Manejar errores de IndexedDB apropiadamente
- ✅ Los datos se guardan localmente en el navegador

### 9. Recursos Locales
- ✅ Todas las dependencias están en `node_modules`
- ✅ Flowbite se copia automáticamente a `public/src/js/vendor/`
- ✅ Fuentes almacenadas localmente en `src/fonts/`
- ✅ La aplicación funciona completamente en local sin conexión a internet

## 🚀 Comandos Disponibles

```bash
# Instalar dependencias (esto también copia Flowbite automáticamente)
npm install

# Copiar recursos locales (Flowbite desde node_modules)
npm run copy:assets

# Servidor de desarrollo con Astro
npm run dev
# o
npm start

# Build de producción (genera sitio estático)
npm run build

# Preview de producción local
npm run preview

# Comandos de Astro directamente
npm run astro dev      # Servidor de desarrollo
npm run astro build    # Build de producción
npm run astro preview  # Preview de build
```

## 📦 Configuración de Recursos Locales

### Flowbite
Flowbite se importa directamente desde `node_modules` usando Astro:
- **No requiere scripts de copia**: Astro maneja automáticamente los módulos de node_modules
- **Importación**: `<script>import 'flowbite';</script>` en componentes Astro
- **Siempre disponible**: Está en `node_modules` y Astro lo procesa automáticamente

### Fuentes
Las fuentes Montserrat y Roboto deben descargarse manualmente:

1. Visita [Google Web Fonts Helper - Montserrat](https://gwfh.mranftl.com/fonts/montserrat)
2. Visita [Google Web Fonts Helper - Roboto](https://gwfh.mranftl.com/fonts/roboto)
3. Descarga los archivos `.woff2` y guárdalos en `src/fonts/`
4. Los nombres de archivo deben coincidir con los definidos en `src/fonts/fonts.css`

Ver `src/fonts/README.md` para más detalles.

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Flowbite Docs](https://flowbite.com/docs/getting-started/quickstart/)
- [Flowbite Components](https://flowbite.com/docs/components/)
- [Google Fonts - Montserrat](https://fonts.google.com/specimen/Montserrat)
- [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)

## 🔍 Checklist de Desarrollo

Antes de crear cualquier componente o funcionalidad:

- [ ] ¿Existe un componente similar en Flowbite?
- [ ] ¿Estoy usando las clases de fuente correctas (font-title/font-body)?
- [ ] ¿Funciona correctamente en dark theme?
- [ ] ¿Estoy evitando código duplicado?
- [ ] ¿Sigo las buenas prácticas establecidas?
- [ ] ¿El código (variables, funciones, tipos) está en inglés?
- [ ] ¿Los textos visibles al usuario están en español?
- [ ] ¿He definido interfaces para estructuras de datos complejas?

## 🔷 TypeScript e Interfaces

### Regla de Tipado
**SIEMPRE usar interfaces** para definir tipos y estructuras de datos en el proyecto.

### Regla de Idioma
**IMPORTANTE**: 
- ✅ **Código en inglés**: Variables, funciones, tipos, interfaces, propiedades, nombres de archivos
- ✅ **Textos en español**: Mensajes al usuario, contenido visible, labels, placeholders, títulos
- ✅ **Comentarios**: Pueden estar en español o inglés según el contexto

### Estructura Recomendada
Crear archivos de tipos en `src/types/`:

```typescript
// src/types/index.ts
/**
 * Usuario del sistema
 */
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

/**
 * Despacho - Entidad principal del sistema
 */
export interface Despacho {
  id: number;
  fecha: Date;
  cliente: string;
  estado: 'pending' | 'completed' | 'cancelled'; // ✅ Valores en inglés
  items?: DespachoItem[];
}

export interface DespachoItem {
  id: number;
  descripcion: string;  // ✅ Propiedad en español si es término de dominio
  cantidad: number;
  precio: number;
}
```

### Buenas Prácticas
- ✅ Crear interfaces para todos los objetos complejos
- ✅ Usar interfaces compartidas en lugar de tipos inline
- ✅ Agrupar interfaces relacionadas en el mismo archivo
- ✅ Exportar interfaces desde archivos centralizados
- ✅ Usar tipos literales para valores constantes en inglés (`'pending' | 'completed'`)
- ✅ Documentar interfaces con comentarios JSDoc (pueden estar en español)
- ✅ Preferir `interface` sobre `type` cuando sea posible
- ✅ **Nombres de propiedades en inglés** (excepto términos de dominio específicos)
- ✅ **Nombres de funciones y variables en inglés**

### Ejemplo de Uso
```typescript
// ✅ CORRECTO - Código en inglés
import type { Despacho, Cliente } from '../types';

async function createDespacho(despacho: Despacho): Promise<Despacho> {
  // Implementación
}

function getUserById(id: number): User {
  // Lógica aquí
}

// ✅ CORRECTO - Textos en español (en componentes Astro)
---
import type { User } from '../types';

const user: User = {
  id: 1,
  email: 'user@example.com',
  name: 'Usuario',
  createdAt: new Date()
};
---

<h1>Bienvenido</h1>
<button>Iniciar Sesión</button>
<p>Este es un mensaje en español para el usuario</p>

// ❌ INCORRECTO
function crearDespacho(despacho: Despacho): Despacho {
  // Nombres de funciones en español
}

<h1>Welcome</h1>  // Textos en inglés cuando deberían estar en español
```

## 💾 IndexedDB

### Configuración
- **Base de datos**: `vencedora-despachos-db`
- **Versión**: 1
- **Object Stores**:
  - `despachos`: Almacena información de despachos
  - `clientes`: Almacena información de clientes
  - `cache`: Almacena datos en caché

### Uso
```javascript
import { db, initDB } from './utils/indexedDB.js';

// Inicializar (se hace automáticamente en main.js)
await initDB();

// Agregar datos
await db.add('despachos', { fecha: new Date(), cliente: 'Cliente 1' });

// Obtener todos
const despachos = await db.getAll('despachos');

// Obtener uno
const despacho = await db.get('despachos', 1);

// Actualizar
await db.update('despachos', { id: 1, fecha: new Date(), cliente: 'Cliente 2' });

// Eliminar
await db.delete('despachos', 1);
```

## 📦 Recursos Locales

### Estructura
- **Flowbite**: Se copia desde `node_modules/flowbite/dist/` a `public/src/js/vendor/flowbite.min.js`
- **Fuentes**: Almacenadas en `src/fonts/` con archivos `.woff2`
- **Sin CDN**: Todas las dependencias están disponibles localmente

### Ventajas
- ✅ No requiere conexión a internet para funcionar
- ✅ Carga más rápida (sin dependencias externas)
- ✅ Funciona completamente offline
- ✅ Control total sobre las versiones de las librerías

## 📝 Notas Importantes

1. El archivo `.cursorrules` contiene las reglas que el asistente de código debe seguir
2. El CSS compilado se genera automáticamente por Astro - no editar manualmente
3. Flowbite se inicializa automáticamente mediante data-attributes
4. Para inicialización manual, usar `initFlowbite()` desde el módulo flowbite
5. IndexedDB se inicializa automáticamente al cargar la aplicación
6. La aplicación funciona completamente en local sin necesidad de conexión a internet
7. Todas las dependencias están en `node_modules` y se copian localmente
8. **Siempre definir interfaces** para estructuras de datos complejas
9. Mantener tipado coherente usando TypeScript cuando sea posible
10. **Código en inglés**: Variables, funciones, tipos, interfaces, propiedades
11. **Textos en español**: Mensajes al usuario, contenido visible, labels, placeholders

