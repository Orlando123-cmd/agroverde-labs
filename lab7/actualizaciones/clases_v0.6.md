# Modelo de clases v0.5 → v0.6 (CR-01)
| Clase | Cambio |
|---|---|
| CL07 RegistroPendiente | + `etiquetaEstado(): String` (devuelve «Pendiente de sincronización · fecha y hora») |
| CL10 GestorSincronizacion | + `listarPendientes(): List` (ordenada por fechaHoraCaptura) |

Sin cambios en relaciones ni en paquetes; no se crean dependencias nuevas, por lo que el diagrama de paquetes (PKG-01) se mantiene.
Diagramas: `diagramas/01_diagrama_de_clases_v0.6.*` y `diagramas/04_secuencia_CU02_sincronizar_pendientes_v1.1.*`.
