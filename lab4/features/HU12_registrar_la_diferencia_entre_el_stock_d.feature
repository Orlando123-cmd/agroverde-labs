# language: es
@HU12 @RF05 @CU05a
Característica: Registrar diferencia de conciliación
  Como encargado de almacén
  Quiero registrar la diferencia entre el stock del sistema y el stock físico con su motivo
  Para dejar constancia y corregir la conciliación

  Escenario: Diferencia registrada con motivo
    Dado que el lote "L-0401" tiene 800 kg en el sistema y 780 kg en el stock físico
    Cuando el encargado registra la diferencia con el motivo "Merma en cámara"
    Entonces el sistema guarda la diferencia de 20 kg con usuario, fecha y hora
    Y el lote queda "En conciliación"

  Escenario: Diferencia sin motivo
    Cuando el encargado intenta guardar la diferencia sin indicar el motivo
    Entonces el sistema rechaza el registro y solicita el motivo
