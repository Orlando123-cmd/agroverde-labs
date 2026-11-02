# language: es
@HU05 @RF04 @CU04
Característica: Registrar el ingreso de un lote a almacén
  Como encargado de almacén
  Quiero registrar el ingreso de un lote y actualizar el stock
  Para conocer las existencias reales

  Escenario: Ingreso de un lote sincronizado
    Dado que el lote "L-0398" de 1000 kg está "Sincronizado" y el stock actual es 500 kg
    Cuando el encargado registra su ingreso a almacén
    Entonces el stock disponible pasa a 1500 kg

  Escenario: Lote pendiente no cuenta como stock confirmado
    Dado que el lote "L-0412" está en estado "Pendiente"
    Cuando el encargado consulta el stock confirmado
    Entonces el lote "L-0412" no se incluye en el stock confirmado
