# language: es
Característica: Sincronizar registros pendientes (adición v1.1 · CR-01)

  Escenario: Lista de pendientes ordenada
    Dado que existen tres registros "Pendiente de sincronización" capturados a distintas horas
    Cuando el encargado de almacén abre la lista de pendientes
    Entonces los registros aparecen del más antiguo al más reciente
    Y cada uno muestra su fecha y hora de captura
