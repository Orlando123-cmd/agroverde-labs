# language: es
@HU06 @RF05 @CU05
Característica: Conciliar el stock con los pedidos de exportación
  Como coordinador de exportaciones
  Quiero conciliar el stock con los pedidos comprometidos
  Para evitar incumplimientos

  Escenario: Pedido cubierto por el stock
    Dado que existe un pedido con 800 kg comprometidos y el stock confirmado es 850 kg
    Cuando exportaciones consulta la conciliación
    Entonces el pedido se muestra como "Confirmado" con 50 kg disponibles

  Escenario: Pedido que supera el stock
    Dado que existe un pedido con 950 kg comprometidos y el stock confirmado es 800 kg
    Cuando exportaciones consulta la conciliación
    Entonces el pedido se muestra como "En conciliación"
    Y se indica una diferencia de 150 kg

  Escenario: Consulta sin conexión
    Dado que el equipo no tiene red
    Cuando el usuario consulta el stock
    Entonces el sistema muestra la fecha y hora de la última sincronización
