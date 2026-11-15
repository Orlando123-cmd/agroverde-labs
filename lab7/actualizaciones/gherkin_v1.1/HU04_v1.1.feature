# language: es
Característica: Consultar el estado y la ubicación de un lote (v1.1 · CR-02)

  Escenario: Consulta de un lote existente
    Dado que existe el lote "L-0001" en estado "En almacén"
    Cuando el jefe de producción consulta el lote "L-0001"
    Entonces ve su estado y su ubicación
    Y la respuesta tarda 3 segundos o menos desde el módulo administrativo

  Esquema del escenario: Búsqueda de lote
    Cuando busca por <criterio> con valor "<valor>"
    Entonces ve los lotes que coinciden

    Ejemplos:
      | criterio | valor      |
      | código   | L-0001     |
      | línea    | Espárrago  |
      | fecha    | 01/11/2026 |
