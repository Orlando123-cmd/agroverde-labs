# language: es
@HU03 @RF02 @CU02
Característica: Sincronizar registros pendientes
  Como encargado de almacén
  Quiero sincronizar los registros pendientes
  Para incorporar los lotes al sistema sin duplicarlos

  Escenario: Sincronización exitosa
    Dado que existen 3 lotes en estado "Pendiente" y el módulo administrativo tiene red
    Cuando el encargado ejecuta "Sincronizar"
    Entonces el sistema incorpora los 3 lotes con su código definitivo
    Y los marca como "Sincronizado"

  Escenario: Reintento sin duplicados
    Dado que el lote "L-0412" ya fue sincronizado
    Cuando se vuelve a sincronizar el mismo registro
    Entonces el sistema no crea un lote duplicado

  Escenario: Diferencia de cantidad al sincronizar
    Dado que el almacén verificó 980 kg y el registro indica 1000 kg
    Cuando el encargado sincroniza el lote
    Entonces el sistema lo marca como "En conciliación" y registra la diferencia
