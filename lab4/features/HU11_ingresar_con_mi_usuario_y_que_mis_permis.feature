# language: es
@HU11 @RNF01
Característica: Autenticación y permisos por rol
  Como usuario del sistema
  Quiero ingresar con mi usuario y que mis permisos dependan de mi rol
  Para proteger la información de cada área

  Escenario: Ingreso con credenciales válidas
    Dado que el usuario "operario01" tiene el rol "Operario"
    Cuando ingresa su usuario y contraseña correctos
    Entonces el sistema abre la pantalla "Cerrar lote"

  Escenario: Credenciales inválidas
    Cuando ingresa una contraseña incorrecta
    Entonces el sistema rechaza el acceso y muestra "Usuario o contraseña incorrectos"

  Escenario: Opción no permitida para el rol
    Dado que el usuario tiene el rol "Operario"
    Cuando intenta abrir la conciliación de stock
    Entonces el sistema deniega el acceso
