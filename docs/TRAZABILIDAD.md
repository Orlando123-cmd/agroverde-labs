# Trazabilidad de la app — AgroVerde S.A.C.

| ID | Requisito | Caso de uso | Módulo en la app | Evidencia funcional |
|---|---|---|---|---|
| RF01 | Registrar cierre de lote | CU01 | Registro de cierre | Formulario con línea, fecha, cantidad y turno; estado `Registrado` → `Validado` |
| RF02 | Registro offline y sincronización | CU02 | Modo offline + Sincronizar | Etiqueta «Pendiente de sincronización · fecha y hora» y botón que cierra el pendiente |
| RF03 | Consultar estado y ubicación | CU03 | Consulta y búsqueda | Tabla de lotes con estado y ubicación |
| RF04 | Ingreso a almacén y stock | CU04 | Ingreso y stock | Movimiento registrado y stock actualizado |
| RF05 | Conciliar stock y pedidos | CU05 / CU05a | Conciliación | Diferencia stock − pedidos y registro de diferencia física |
| RF06 | Datos personales con control de acceso | CU06 | Datos y consentimiento | Solo RRHH/Admin; legajo bloqueado sin vigencia |
| RF07 | Documentos de exportación | CU07 | Documentos | Factura y packing list imprimibles |
| RF08 | Buscar lote por código/línea/fecha | CU03 | Consulta y búsqueda | Filtros combinables |
| RF09 | Reportes de trazabilidad | CU08 | Trazabilidad | Reporte por lote con línea de tiempo de eventos |
| RF10 | Agua y mermas por lote | CU09 | Agua y mermas | Registro con lote, litros y kilogramos |
| RNF01 | Autenticación y roles | CU00 | Login | 6 usuarios, menú por rol |
| RNF02 | Protección de datos (Ley 29733) | CU06 | Datos y consentimiento | Consentimiento vigente obligatorio para operar el legajo |
| RNF03 | Operación offline | CU02 | Modo offline | Cache de credenciales (RN06) y captura local |
| RNF04 | Interfaz simple | — | Toda la app | Botones grandes, etiquetas claras, mensajes de confirmación |
| RNF03 / RNF04 | Experiencia móvil (nuevo) | — | Toda la app en ≤ 600 px | Barra inferior de navegación con módulos frecuentes y botón «Más» (panel de los 14 módulos), encabezado compacto con avatar, tablas convertidas en tarjetas con etiquetas, campos de 48 px y área segura para el notch |
| RNF05 | Consultas ≤ 3 s (p95) | CU03 | Consulta y búsqueda | Medición en pantalla con semáforo CUMPLE / NO CUMPLE |
| RF11 | Consentimiento informado (nuevo) | CU06 / HU13 | Datos y consentimiento | Alta con vigencia; sin vigencia = **BLOQUEADO** |
| Apoyo a RF01/RF03 | Lectura de código de lote | CU01 / CU03 | Escáner de lote | Cámara a pantalla completa (✕ Salir / Esc) con `BarcodeDetector` + captura manual; lleva el código a Consulta, Trazabilidad o cierre |
| Apoyo a RF01/RF03 | Código de barras de prueba | CU01 / CU03 | Escáner de lote | Code128-B generado en la app; SVG descargable/imprimible, `codigo_barras_prueba.svg` incluido y verificación con `BarcodeDetector` o decodificador interno con checksum |
| Apoyo a RF02/RF05/RF11 | Alertas del turno | CU02 / CU05 / CU06 | Inicio | Avisos de pendientes, stock insuficiente, legajos bloqueados y consentimientos por vencer |
| Apoyo a RF03/RF09 | Reportes descargables | CU03 / CU08 | Consulta, Trazabilidad, Auditoría | CSV con BOM y botón «Guardar PDF (imprimir)» |
| Apoyo a RNF01 | Respaldo y gestión de usuarios | CU00 | Auditoría y respaldos / Gestión de usuarios | Exportación e importación JSON; alta, baja y cambio de clave sin mostrar contraseñas |

## Reglas de negocio implementadas

- **RN01** Un lote debe tener línea, fecha, cantidad y turno.
- **RN02** El código de lote es único.
- **RN03** El estado `Validado` solo lo puede asignar el Jefe de producción o el Administrador.
- **RN04** Un lote sin validar no genera documento de exportación.
- **RN05** El stock nunca puede quedar negativo.
- **RN06** Sin red, la autenticación usa credenciales en caché.
- **RN07** Un operario solo puede cerrar lotes de su línea asignada.
- **RN08** La diferencia física requiere motivo y usuario responsable.
- **RN09** El legajo sin consentimiento vigente queda bloqueado.
- **RN10** Toda acción queda registrada en la auditoría con usuario y fecha.
