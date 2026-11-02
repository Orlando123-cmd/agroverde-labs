# language: es
@HU02 @RF02 @RNF03 @CU02
Característica: Registrar un lote sin conexión de red
  Como operario
  Quiero registrar un lote cuando no haya red
  Para no detener el proceso productivo

  Escenario: Registro sin cobertura
    Dado que el operario está cerrando un lote y no hay conexión de red
    Cuando guarda los datos obligatorios
    Entonces el sistema guarda el registro en el equipo con estado "Pendiente"
    Y le asigna un código provisional con el prefijo del equipo
    Y permite continuar la operación

  Escenario: Equipo no disponible para guardar
    Dado que no hay red y el equipo no puede guardar el registro
    Cuando el operario anota los datos en la ficha de papel y la entrega al almacén
    Entonces el encargado de almacén transcribe el registro con estado "Pendiente"
