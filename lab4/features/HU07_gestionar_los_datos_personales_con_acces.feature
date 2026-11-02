# language: es
@HU07 @RF06 @RNF02 @CU06
Característica: Gestionar datos personales con acceso restringido
  Como especialista de RRHH
  Quiero gestionar los datos personales con acceso restringido
  Para cumplir la Ley N.° 29733

  Escenario: Acceso denegado a usuarios fuera de RRHH
    Dado que un usuario con rol "Almacén" inició sesión
    Cuando intenta abrir un legajo personal
    Entonces el sistema deniega el acceso
    Y registra el intento en la auditoría de seguridad

  Escenario: Acceso permitido a RRHH
    Dado que un usuario con rol "RRHH" inició sesión
    Cuando abre el legajo de un trabajador
    Entonces el sistema muestra el legajo completo
    Y registra el acceso con usuario, fecha y hora

  Escenario: Reporte agregado para gerencia
    Dado que un usuario con rol "Gerencia" solicita el costo de mano de obra por lote
    Cuando el sistema genera el reporte
    Entonces el reporte muestra solo totales agregados sin datos personales identificables
