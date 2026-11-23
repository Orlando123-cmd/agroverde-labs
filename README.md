# AgroVerde S.A.C. — Sistema de Trazabilidad de Lotes (app funcional)

Aplicación web autocontenida y **responsive para celular**: no requiere instalación ni servidor para probarla. Además es una **PWA instalable**: publicada en HTTPS se agrega al inicio del celular y se abre como app, a pantalla completa y sin conexión. Cumple los requisitos RF01–RF10, RNF01–RNF05 y RF11 del caso de estudio de los Laboratorios 1–7 de CIIN1322P.

## Cómo ejecutar

1. Descomprimir el ZIP.
2. Hacer doble clic en `index.html` (se abre en Chrome/Edge).
3. Opcional: `python -m http.server 8000` dentro de la carpeta y entrar a `http://localhost:8000`.

Los datos se guardan en `localStorage` del navegador (`agroverde_db_v1`). El botón **Restablecer datos** devuelve la base a la semilla original.

## Instalar como app en el celular (PWA)

**Link ya publicado (GitHub Pages):** `https://orlando123-cmd.github.io/agroverde-labs/`
Ábrelo en el celular e instálalo (pasos abajo). No necesitas publicar nada más.

Para que el celular la instale con ícono propio y la abra como app (pantalla completa, sin barra del navegador y con caché offline), la app debe servirse por **HTTPS**. El ZIP ya incluye `manifest.webmanifest`, `sw.js` e íconos; solo falta publicarla:

1. **Publicar gratis** (elige una):
   - **Netlify Drop**: entra a `https://app.netlify.com/drop` y arrastra la carpeta descomprimida. Te da una URL `https://…netlify.app`.
   - **GitHub Pages**: sube la carpeta a un repositorio y activa *Settings → Pages*. URL `https://usuario.github.io/repo/`.
   - **Vercel / Cloudflare Pages**: importa la carpeta como sitio estático.
2. **Abrir esa URL en el celular** (Chrome en Android, Safari en iPhone).
3. **Instalar**:
   - Android/Chrome: menú `⋮` → **Instalar app** / **Agregar a pantalla de inicio**.
   - iPhone/Safari: botón **Compartir** → **Agregar a inicio**.
4. Se crea el ícono **AgroVerde** en el inicio; al tocarlo abre a pantalla completa como app nativa. Gracias al service worker, sigue funcionando **sin conexión** después de la primera carga.

> Nota: abrir `index.html` directamente como archivo local (`file://`) sirve para probar en PC, pero los navegadores móviles no permiten instalar PWA ni service worker desde `file://`; por eso el paso de publicación HTTPS es necesario para el modo “app instalada”.

## Usuarios (RNF01 — autenticación con roles)

| Usuario | Contraseña | Rol |
|---|---|---|
| operario1 | op123 | Operario de producción |
| jefe1 | jefe123 | Jefe de producción |
| almacen1 | alm123 | Encargado de almacén |
| rrhh1 | rrhh123 | Especialista de RRHH |
| gerencia1 | ger123 | Gerencia |
| admin1 | admin123 | Administrador (todos los módulos) |

> **Cierre automático:** la sesión se cierra sola tras **10 minutos sin actividad** (RNF01). Aparece un aviso a los 8 minutos con botones «Seguir trabajando» y «Cerrar ahora». Cualquier clic, tecla o toque reinicia el contador; si se recarga la página, se respeta el tiempo restante guardado en `localStorage`.

## Módulos

| Módulo | Requisitos | Qué hace |
|---|---|---|
| Registro de cierre | RF01, CU01, RN01–RN07 | Captura línea/fecha/cantidad/turno; el Jefe valida y cambia el estado a **Validado** |
| Modo offline + sincronización | RF02, CU02, RN06 | Guarda como **Pendiente de sincronización · fecha y hora**; las credenciales quedan en caché; el botón Sincronizar cierra el pendiente |
| Consulta y búsqueda | RF03, RF08, CU03, RNF05 | Busca por código, línea o fecha y mide el tiempo de respuesta frente al umbral de 3 s (p95) |
| Ingreso y stock | RF04, CU04 | Registra movimientos y actualiza el stock por lote |
| Conciliación | RF05, CU05, CU05a | Compara stock vs pedidos comprometidos y registra la diferencia física |
| Datos y consentimiento | RF06, RF11, RNF02, CU06 | Alta de trabajadores; bloquea el legajo si no hay consentimiento vigente |
| Documentos de exportación | RF07, CU07 | Genera factura y packing list imprimibles |
| Trazabilidad | RF09, CU08 | Reporte por lote con todos sus eventos, imprimible |
| Agua y mermas | RF10, CU09 | Registra consumo de agua y mermas por lote |
| Auditoría | CL06 | Registra cada acción con usuario, fecha y detalle |
| Diseño móvil | RNF03 / RNF04 | Barra inferior de navegación con los módulos más usados y botón «Más» para los 14 módulos, encabezado compacto con avatar de usuario, tablas que se convierten en tarjetas, campos táctiles grandes y respeto al área segura del celular |
| Asistente virtual | Apoyo a RNF04 | Chat flotante que guía al personal por puesto, responde dudas, busca lotes por código y abre módulos. Usa reglas locales: no necesita internet ni API externa |
| Escáner de lote | Apoyo a RF01 / RF03 | **En celular** activa la cámara a pantalla completa (botón ✕ Salir o tecla Esc). **En computadora** detecta las cámaras conectadas, permite elegir la webcam y escanea en la vista previa sin pantalla completa. Lee QR con `BarcodeDetector` cuando está disponible y siempre puede leer **Code128** con el decodificador interno. El código leído lleva a Consulta, Trazabilidad o Registro de cierre |
| Código de barras de prueba | Apoyo a RF01 / RF03 | Genera un **Code128-B** real de cualquier lote. Se puede ver, descargar en SVG, imprimir y verificar. El mismo decodificador interno lee el SVG o los cuadros de la cámara y valida el checksum; si el navegador tiene `BarcodeDetector`, se usa además para QR y otros formatos. También se incluye `codigo_barras_prueba.svg` listo para escanear desde otra pantalla |
| Alertas del inicio | Apoyo a RF02 / RF11 / RF05 | Avisos de lotes sin validar, pendientes de sincronización, legajos bloqueados, consentimientos por vencer y pedidos con stock insuficiente |
| Auditoría y respaldos | CL06 / RN10 | Exporta e importa la base en JSON y descarga la bitácora en CSV; permite pasar datos entre dispositivos sin backend |
| Reportes descargables | RF03 / RF09 | Consulta, trazabilidad y auditoría se descargan en CSV (con BOM para Excel) y se pueden guardar como PDF desde «Imprimir» |
| Gestión de usuarios | RNF01 | Solo Administrador: alta, baja/activación, cambio de contraseña, edición de puesto y línea. Las claves nunca se muestran en pantalla |

## Estructura del ZIP

```
index.html            Interfaz, login y registro de la PWA
styles.css            Estilos responsive (móvil primero — RNF03/RNF04)
app.js                Lógica, persistencia, reglas de negocio, Code128 y auditoría
codigo_barras_prueba.svg  Código Code128 de LOTE-2026-001 listo para imprimir/escanear
manifest.webmanifest  Manifiesto PWA (nombre, íconos, pantalla completa)
sw.js                 Service worker: caché offline de la app
icons/                Íconos 192, 512 y apple-touch-icon
README.md             Este archivo
docs/TRAZABILIDAD.md  Matriz Requisito → CU → Módulo → Evidencia en la app
```

> Prototipo funcional académico: usa almacenamiento local del navegador y sincronización simulada. No expone datos reales de AgroVerde S.A.C.
