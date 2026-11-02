# language: es
@HU01 @RF01 @CU01
Característica: Registrar el cierre de un lote
  Como operario
  Quiero registrar el cierre de un lote con línea, fecha, turno y cantidad
  Para mantener la trazabilidad

  Antecedentes:
    Dado que el operario inició sesión
    Y está en una línea de producción activa

  Escenario: Cierre de lote exitoso con datos válidos
    Cuando registra la línea "Espárrago", la fecha "25/10/2026", el turno "Mañana" y la cantidad "1250" kg
    Entonces el sistema genera un código de lote único
    Y muestra la confirmación con el código del lote

  Esquema del escenario: Rechazo de datos inválidos
    Cuando intenta guardar el cierre con cantidad "<cantidad>" y turno "<turno>"
    Entonces el sistema muestra el mensaje "<mensaje>"
    Y no guarda el lote

    Ejemplos:
      | cantidad | turno  | mensaje                          |
      | 0        | Mañana | La cantidad debe ser mayor a 0   |
      | 1250     |        | Seleccione un turno              |

  Escenario: Código de lote duplicado
    Dado que ya existe un lote con el mismo código
    Cuando el sistema genera el código del nuevo cierre
    Entonces rechaza el registro y notifica el duplicado
