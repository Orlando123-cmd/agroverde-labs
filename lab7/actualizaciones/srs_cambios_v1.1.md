# SRS — cambios v1.0 → v1.1

## RF02 (CR-01)
- v1.0: El sistema debe permitir registrar el cierre de lote en modo offline cuando no haya cobertura de red, y sincronizarlo posteriormente.
- v1.1: ... y sincronizarlo posteriormente. **Mientras no se sincronice, el registro se muestra con el estado «Pendiente de sincronización» y la fecha y hora de captura.**
- Criterio de aceptación nuevo: PR-RF02-03 y PR-RF02-04.

## RNF05 (CR-02)
- v1.0: El sistema debe mostrar los resultados de las consultas en un tiempo de respuesta adecuado desde el módulo administrativo.
- v1.1: ... **Criterio medible (umbral propuesto a validar): consulta de un lote ≤ 3 s y reporte de trazabilidad ≤ 10 s.** Se traza a CU03, CU08, HU04, HU09.

## CU02 — flujo principal (CR-01)
- Se agrega el paso: «El sistema muestra la lista de registros pendientes con su etiqueta de estado y fecha/hora de captura, ordenados del más antiguo al más reciente».
