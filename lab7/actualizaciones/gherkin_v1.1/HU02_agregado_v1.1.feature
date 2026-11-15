# language: es
Característica: Registrar un lote sin conexión de red (adición v1.1 · CR-01)

  Escenario: Registro sin red muestra estado y hora
    Dado que el operario cierra el lote de la línea "Espárrago" sin cobertura de red
    Cuando guarda el registro en el equipo
    Entonces el registro se muestra como "Pendiente de sincronización"
    Y se muestra la fecha y hora de captura
