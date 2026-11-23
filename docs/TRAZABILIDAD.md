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
| RNF05 | Consultas ≤ 3 s (p95) | CU03 | Consulta y búsqueda | Medición en pantalla con semáforo CUMPLE / NO CUMPLE |
| RF11 | Consentimiento informado (nuevo) | CU06 / HU13 | Datos y consentimiento | Alta con vigencia; sin vigencia = **BLOQUEADO** |

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
