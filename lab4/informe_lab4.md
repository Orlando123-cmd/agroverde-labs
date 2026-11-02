UNIVERSIDAD PRIVADA DEL NORTE

Modelado y Desarrollo de Aplicaciones · CIIN1322P

  
  

# GUÍA DE LABORATORIO — TEMA N.° 4

**Backlog de historias de usuario + criterios de aceptación (Gherkin) y priorización**

Caso de estudio: AgroVerde S.A.C.

  

| Integrantes                       | Código UPN |
|-----------------------------------|------------|
| Pablo Marcelino Blas Campomanes   | N00493608  |
| David Ruiz Pérez                  | N00469228  |
| Dayron Michelle Yangali Machado   | N00470550  |
| Orlando Valentino Ravenna Soriano | N00488189  |

Docente: Jorge Luis Cordova Lopez

Versión del entregable: v1.0-lab4 · Fecha: 01/11/2026

Repositorio: <https://github.com/Orlando123-cmd/agroverde-labs> (tag v1.0-lab4)

# 1. Objetivo

Construir y priorizar el backlog de historias de usuario de AgroVerde S.A.C. validándolas con INVEST, definir sus criterios de aceptación en Gherkin con DoR y DoD, y organizar el trabajo en un tablero Scrum/Kanban con un sprint planificado, de modo que el equipo pueda coordinar responsabilidades y ver el flujo desde los requisitos del Laboratorio 2 hasta los casos de uso del Laboratorio 3.

# 2. Procedimiento

## Paso 1. Objetivo del sprint y alcance

**Objetivo del Sprint 1:** que un operario pueda cerrar un lote con o sin conexión de red, y que el almacén lo sincronice sin duplicados, con acceso controlado por rol. Cubre HU11, HU01, HU02 y HU03 (18 puntos), que son el núcleo de trazabilidad de la versión 1 (Must del Lab. 2: RF01, RF02, RNF01, RNF03, RNF04).

Duración propuesta: 2 semanas (10 días hábiles). Capacidad estimada: 20 puntos y 88 horas (4 integrantes × 22 h), a calibrar con el resultado del Sprint 1. Roles propuestos: Scrum Master, Pablo Blas; equipo de desarrollo, David Ruiz, Dayron Yangali y Orlando Ravenna.

## Paso 2. Historias de usuario (12) y validación INVEST

| ID       | Historia de usuario                                                                                                                                                     | RF/RNF      | CU         | WF    | Pts | Depende de |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|------------|-------|-----|------------|
| **HU01** | Como operario, quiero registrar el cierre de un lote con línea, fecha, turno y cantidad, para mantener la trazabilidad.                                                 | RF01, RNF04 | CU01       | WF-01 | 5   | —          |
| **HU02** | Como operario, quiero registrar un lote cuando no haya red, para no detener el proceso productivo.                                                                      | RF02, RNF03 | CU02       | WF-02 | 5   | —          |
| **HU03** | Como encargado de almacén, quiero sincronizar los registros pendientes, para incorporar los lotes al sistema sin duplicarlos.                                           | RF02        | CU02       | WF-02 | 5   | HU02       |
| **HU04** | Como jefe de producción, quiero consultar el estado y la ubicación de un lote, para verificar su recorrido.                                                             | RF03, RF08  | CU03       | —     | 3   | HU01       |
| **HU05** | Como encargado de almacén, quiero registrar el ingreso de un lote y actualizar el stock, para conocer las existencias reales.                                           | RF04        | CU04       | —     | 5   | HU01       |
| **HU06** | Como coordinador de exportaciones, quiero conciliar el stock con los pedidos comprometidos, para evitar incumplimientos.                                                | RF05        | CU05       | WF-03 | 8   | HU05       |
| **HU07** | Como especialista de RRHH, quiero gestionar los datos personales con acceso restringido, para cumplir la Ley N.° 29733.                                                 | RF06, RNF02 | CU06       | —     | 8   | HU11       |
| **HU08** | Como coordinador de exportaciones, quiero generar factura y packing list asociados al lote, para preparar el despacho.                                                  | RF07        | CU07       | —     | 5   | HU05       |
| **HU09** | Como gerencia, quiero obtener reportes de trazabilidad, para supervisar la operación y atender requerimientos documentarios.                                            | RF09        | CU08       | —     | 5   | HU01       |
| **HU10** | Como jefe de producción, quiero registrar el agua consumida y las mermas por lote, para controlar el impacto operativo y ambiental.                                     | RF10        | CU09       | —     | 3   | HU01       |
| **HU11** | Como usuario del sistema, quiero ingresar con mi usuario y que mis permisos dependan de mi rol, para proteger la información de cada área.                              | RNF01       | Autenticar | WF-00 | 3   | —          |
| **HU12** | Como encargado de almacén, quiero registrar la diferencia entre el stock del sistema y el stock físico con su motivo, para dejar constancia y corregir la conciliación. | RF05        | CU05a      | WF-04 | 3   | HU06       |

Puntos de historia en escala Fibonacci acordada para el equipo: 3 (pequeña), 5 (mediana), 8 (grande). HU01–HU10 mantienen los IDs del Avance 3; HU11 y HU12 son nuevas y cubren RNF01 y el caso de uso CU05a del Laboratorio 3.

### Validación INVEST

| HU       | I   | N   | V   | E   | S   | T   | Observación                                                                                        |
|----------|-----|-----|-----|-----|-----|-----|----------------------------------------------------------------------------------------------------|
| **HU01** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU02** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU03** | ⚠   | ✓   | ✓   | ✓   | ✓   | ✓   | Se apoya en HU02; se separan por actor y valor, pero se planifican en el mismo sprint.             |
| **HU04** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU05** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | Puede probarse con lotes de prueba sin esperar a HU01.                                             |
| **HU06** | ⚠   | ✓   | ✓   | ✓   | ⚠   | ✓   | Depende de HU05 y es grande (8 pts): candidata a dividirse en consulta y registro de conciliación. |
| **HU07** | ✓   | ✓   | ✓   | ✓   | ⚠   | ✓   | Es grande (8 pts): candidata a dividirse en registro de legajo y auditoría de accesos.             |
| **HU08** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU09** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU10** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | —                                                                                                  |
| **HU11** | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | Base de seguridad para las demás HU.                                                               |
| **HU12** | ⚠   | ✓   | ✓   | ✓   | ✓   | ✓   | Es una extensión de HU06 (CU05a); se prueba junto con ella.                                        |

✓ cumple · ⚠ cumple con reservas. I = Independiente, N = Negociable, V = Valiosa, E = Estimable, S = Pequeña, T = Testeable.

## Paso 3. Criterios de aceptación en Gherkin (8 historias clave)

Se escriben escenarios para HU01, HU02, HU03, HU05, HU06, HU07, HU11 y HU12, en español (`# language: es`), con etiquetas de trazabilidad (@HU, @RF/@RNF, @CU). Los archivos `.feature` están en el repositorio, en `lab4/features/`.

### HU01 — Registrar el cierre de un lote con línea, fecha, turno y cantidad

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

### HU02 — Registrar un lote cuando no haya red

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

### HU03 — Sincronizar los registros pendientes

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

### HU05 — Registrar el ingreso de un lote y actualizar el stock

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

### HU06 — Conciliar el stock con los pedidos comprometidos

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

### HU07 — Gestionar los datos personales con acceso restringido

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

### HU11 — Ingresar con mi usuario y que mis permisos dependan de mi rol

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

### HU12 — Registrar la diferencia entre el stock del sistema y el stock físico con su motivo

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

## Paso 4. Definition of Ready (DoR) y Definition of Done (DoD)

### Definition of Ready

| Criterio          | Una HU está lista para entrar a un sprint cuando…                         |
|-------------------|---------------------------------------------------------------------------|
| Formato           | Está redactada como «Como / Quiero / Para» con un actor real del sistema. |
| Trazabilidad      | Está vinculada a un RF/RNF y a un caso de uso (CU).                       |
| INVEST            | Pasó la validación INVEST; si es grande (8 pts) se acordó cómo dividirla. |
| Criterios         | Tiene al menos 2 escenarios Gherkin acordados por el equipo.              |
| Estimación        | Está estimada en puntos de historia por el equipo.                        |
| Dependencias      | Sus dependencias están identificadas y no la bloquean.                    |
| Interfaz          | Tiene un wireframe (WF) asociado, si implica pantallas.                   |
| Reglas de negocio | Sus reglas de negocio (RN) y excepciones están identificadas.             |

### Definition of Done

| Criterio                 | Una HU está terminada cuando…                                                                            |
|--------------------------|----------------------------------------------------------------------------------------------------------|
| Funcionalidad            | Cumple la historia y todos sus criterios de aceptación.                                                  |
| Validación               | Los escenarios Gherkin pasan sin errores conocidos de severidad alta, con evidencia de la ejecución.     |
| Seguridad                | Los permisos respetan el rol y no exponen datos personales fuera de RRHH.                                |
| Offline / sincronización | Cuando aplica, opera sin cobertura y sincroniza sin duplicidad.                                          |
| Trazabilidad             | El RF/RNF, el CU, el escenario y la tarea quedan vinculados por ID.                                      |
| Usabilidad               | La interfaz es simple y comprensible para el perfil de alfabetización digital básica.                    |
| Código y repositorio     | El cambio está integrado en el repositorio con un commit descriptivo y fue revisado por otro integrante. |
| Documentación            | Se actualiza la descripción funcional y el registro de cambios.                                          |

Regla del equipo: si no se cumple una condición del DoD, la historia permanece en proceso y no pasa a Done.

## Paso 5. Priorización del backlog: WSJF + MoSCoW

**WSJF** = Costo de la demora ÷ Tamaño. El costo de la demora suma tres factores (escala 1, 2, 3, 5, 8, 13): **valor de negocio (VN)**, **urgencia/tiempo (UT)** y **reducción de riesgo/oportunidad (RR)**; el tamaño son los puntos de historia. Luego se aplica **MoSCoW**: Must si WSJF ≥ 4,0 (o si es obligación legal); Should entre 2,5 y 4,0; Could por debajo de 2,5.

| \#  | HU       | RF/RNF      | VN  | UT  | RR  | CD  | Pts | WSJF     | MoSCoW   | Sprint |
|-----|----------|-------------|-----|-----|-----|-----|-----|----------|----------|--------|
| 1   | **HU11** | RNF01       | 8   | 8   | 8   | 24  | 3   | **8.00** |  Must    | 1      |
| 2   | **HU02** | RF02, RNF03 | 13  | 13  | 8   | 34  | 5   | **6.80** |  Must    | 1      |
| 3   | **HU01** | RF01, RNF04 | 13  | 8   | 5   | 26  | 5   | **5.20** |  Must    | 1      |
| 4   | **HU05** | RF04        | 13  | 8   | 5   | 26  | 5   | **5.20** |  Must    | 2      |
| 5   | **HU12** | RF05        | 5   | 5   | 5   | 15  | 3   | **5.00** |  Must    | 2      |
| 6   | **HU03** | RF02        | 8   | 8   | 8   | 24  | 5   | **4.80** |  Must    | 1      |
| 7   | **HU06** | RF05        | 13  | 8   | 13  | 34  | 8   | **4.25** |  Must    | 2      |
| 8   | **HU07** | RF06, RNF02 | 8   | 13  | 13  | 34  | 8   | **4.25** |  Must    | 3      |
| 9   | **HU04** | RF03, RF08  | 5   | 3   | 2   | 10  | 3   | **3.33** |  Should  | 3      |
| 10  | **HU08** | RF07        | 5   | 5   | 3   | 13  | 5   | **2.60** |  Should  | 3      |
| 11  | **HU09** | RF09        | 5   | 2   | 2   | 9   | 5   | **1.80** |  Could   | —      |
| 12  | **HU10** | RF10        | 2   | 1   | 2   | 5   | 3   | **1.67** |  Could   | —      |

### Justificación de las decisiones

- **HU11 sube al primer lugar** (WSJF 8,0): es pequeña y habilita la seguridad del resto de historias (RNF01).
- **HU02 supera a HU01:** resuelve la restricción real de conectividad de la planta (RF02, RNF03), con la mayor urgencia y reducción de riesgo.
- **HU07 es Must** por su WSJF (4,25) y por obligación legal (Ley N.° 29733). Se programa en el Sprint 3 porque depende de HU11 y, con 8 pts, no cabe junto a HU05, HU06 y HU12 en un sprint de 20 pts; debe estar lista antes de la puesta en marcha.
- **HU09 y HU10 quedan como Could**, coherente con el Laboratorio 2 (RF09 y RF10 de prioridad baja).
- El orden de entrega respeta las dependencias: HU11 → HU01 → HU02 → HU03 y HU05 → HU06 → HU12.

## Paso 6. Tablero Scrum/Kanban

Tablero con 5 columnas y límites de trabajo en curso (WIP): **Backlog** (ordenado por WSJF) → **Listo** (cumple el DoR y está en el sprint) → **En desarrollo** (WIP 2) → **En pruebas** (WIP 2) → **Done** (cumple el DoD). Una HU bloqueada se marca con una etiqueta roja «Bloqueado» y se trata en la reunión diaria. Cada tarjeta muestra ID, MoSCoW, puntos y responsable.

\*(ver carpeta tablero/)\*

Figura 1. Configuración del tablero al iniciar el Sprint 1.

### Responsables por historia

| HU   | Responsable | MoSCoW | Sprint |
|------|-------------|--------|--------|
| HU01 | Orlando     | Must   | 1      |
| HU02 | David       | Must   | 1      |
| HU03 | Pablo       | Must   | 1      |
| HU04 | Dayron      | Should | 3      |
| HU05 | Dayron      | Must   | 2      |
| HU06 | David       | Must   | 2      |
| HU07 | Pablo       | Must   | 3      |
| HU08 | Orlando     | Should | 3      |
| HU09 | Dayron      | Could  | —      |
| HU10 | Orlando     | Could  | —      |
| HU11 | Pablo       | Must   | 1      |
| HU12 | David       | Must   | 2      |

## Paso 7. Planificación del Sprint 1

Se seleccionan HU11, HU01, HU02 y HU03 (18 pts, ≤ 20 de capacidad), se descomponen en 15 tareas y se estiman en horas (81 h de 88 h disponibles).

| Tarea | HU   | Descripción                                           | Responsable | Horas |
|-------|------|-------------------------------------------------------|-------------|-------|
| T01   | HU11 | Diseñar el modelo de usuarios y roles                 | Dayron      | 4     |
| T02   | HU11 | Implementar el ingreso y el control por rol (WF-00)   | David       | 6     |
| T03   | HU11 | Pruebas de acceso (escenarios HU11)                   | Dayron      | 3     |
| T04   | HU01 | Formulario Cerrar lote (WF-01)                        | Orlando     | 6     |
| T05   | HU01 | Validaciones RN01–RN03                                | Pablo       | 5     |
| T06   | HU01 | Generación de código de lote único (RN02)             | Dayron      | 5     |
| T07   | HU01 | Pruebas de escenarios HU01                            | Orlando     | 4     |
| T08   | HU02 | Almacenamiento local y estado Pendiente (RN05)        | David       | 8     |
| T09   | HU02 | Pantalla Sin conexión (WF-02)                         | Orlando     | 6     |
| T10   | HU02 | Contingencia con ficha de papel                       | Dayron      | 4     |
| T11   | HU02 | Pruebas de escenarios HU02                            | Pablo       | 4     |
| T12   | HU03 | Servicio de sincronización idempotente (RN06)         | Pablo       | 10    |
| T13   | HU03 | Detección de duplicado o diferencia → En conciliación | David       | 6     |
| T14   | HU03 | Acción Sincronizar en la interfaz                     | Orlando     | 5     |
| T15   | HU03 | Pruebas de escenarios HU03                            | Dayron      | 5     |

### Carga por integrante

| Integrante | Horas asignadas | Capacidad (h) |
|------------|-----------------|---------------|
| Pablo      | 19              | 22            |
| David      | 20              | 22            |
| Dayron     | 21              | 22            |
| Orlando    | 21              | 22            |

### Pronóstico de los siguientes sprints

| Sprint  | Objetivo                                         | Historias              | Pts |
|---------|--------------------------------------------------|------------------------|-----|
| 1       | Cierre de lote con y sin red, con acceso por rol | HU11, HU01, HU02, HU03 | 18  |
| 2       | Stock y conciliación con pedidos                 | HU05, HU06, HU12       | 16  |
| 3       | Datos personales y consulta/documentación        | HU07, HU04, HU08       | 16  |
| Backlog | Reportes y registro ambiental                    | HU09, HU10             | 8   |

## Paso 8. Monitoreo del flujo: métricas básicas

Se monitorean tres métricas, registradas a diario en el tablero:

- **Burndown del sprint:** puntos restantes por día frente a la línea ideal (Figura 2).
- **WIP:** número de tarjetas en cada columna, con tope de 2 en desarrollo y 2 en pruebas.
- **Tiempo de ciclo:** días entre «En desarrollo» y «Done» de cada HU.

\*(ver carpeta tablero/)\*

Figura 2. Burndown ideal del Sprint 1 (18 pts en 10 días hábiles). La línea real se completa con los puntos restantes de cada día.

Para el Sprint 1, sin datos reales de ejecución, solo se presenta la línea ideal.

## Paso 9. Versionado de artefactos

| Versión   | Contenido                                             | Commit                                                            |
|-----------|-------------------------------------------------------|-------------------------------------------------------------------|
| v0.1      | Backlog de 12 HU con INVEST y tamaños                 | feat(backlog): 12 historias de usuario con INVEST (HU01-HU12)     |
| v0.2      | Escenarios Gherkin, DoR y DoD                         | feat(gherkin): 8 features, DoR y DoD (HU01-HU12)                  |
| v1.0-lab4 | Priorización WSJF/MoSCoW, tablero y plan del Sprint 1 | docs(lab4): priorización, tablero y planificación — tag v1.0-lab4 |

# 3. Evidencias técnicas

## Matriz de trazabilidad RF/RNF → CU → HU → Gherkin → WF

| RF/RNF      | CU         | HU       | Gherkin | WF    | MoSCoW   | Sprint |
|-------------|------------|----------|---------|-------|----------|--------|
| RF01, RNF04 | CU01       | **HU01** | @HU01   | WF-01 |  Must    | 1      |
| RF02, RNF03 | CU02       | **HU02** | @HU02   | WF-02 |  Must    | 1      |
| RF02        | CU02       | **HU03** | @HU03   | WF-02 |  Must    | 1      |
| RF03, RF08  | CU03       | **HU04** | —       | —     |  Should  | 3      |
| RF04        | CU04       | **HU05** | @HU05   | —     |  Must    | 2      |
| RF05        | CU05       | **HU06** | @HU06   | WF-03 |  Must    | 2      |
| RF06, RNF02 | CU06       | **HU07** | @HU07   | —     |  Must    | 3      |
| RF07        | CU07       | **HU08** | —       | —     |  Should  | 3      |
| RF09        | CU08       | **HU09** | —       | —     |  Could   | —      |
| RF10        | CU09       | **HU10** | —       | —     |  Could   | —      |
| RNF01       | Autenticar | **HU11** | @HU11   | WF-00 |  Must    | 1      |
| RF05        | CU05a      | **HU12** | @HU12   | WF-04 |  Must    | 2      |

Evidencias: backlog priorizado (Paso 5), escenarios Gherkin con DoR/DoD (Pasos 3 y 4) y tablero Scrum/Kanban (Paso 6, Figura 1), junto con el plan del sprint (Paso 7) y el burndown (Figura 2).

# 4. Análisis de resultados

**Coherencia.** Todos los requisitos Must y Should del Laboratorio 2 tienen una HU trazada (RF08 va dentro de HU04), y las 8 HU Must tienen escenarios Gherkin; solo HU04, HU08, HU09 y HU10 aún no los tienen. La prioridad por WSJF coincide con MoSCoW: las 8 historias Must son exactamente las 8 de mayor WSJF.

### Brechas, inconsistencias y riesgos

- **HU nuevas respecto al Avance 3:** HU11 (RNF01) y HU12 (CU05a) no estaban en el backlog original; se agregaron para mantener la trazabilidad con el Laboratorio 3.
- **Tamaño:** HU06 y HU07 (8 pts) incumplen «Pequeña» de INVEST y ocupan casi la mitad de la capacidad de un sprint; se propone dividirlas.
- **Dependencias:** HU03 depende de HU02, HU06 de HU05 y HU12 de HU06; un retraso en HU02 bloquea la sincronización.
- **Autenticación sin red:** HU11 y HU01 asumen validar credenciales offline, decisión técnica que sigue abierta desde el Laboratorio 3.
- **Capacidad supuesta:** los 20 puntos y 88 horas son un supuesto; no hay velocidad histórica del equipo.
- **Validación:** backlog y escenarios aún no se validaron con los stakeholders en una Reunión 2.

### Mejoras propuestas

- Dividir HU06 en «consultar disponibilidad vs. pedido» y «registrar conciliación», y HU07 en «registrar legajo» y «auditar accesos», antes del Sprint 2.
- Calibrar la capacidad con la velocidad real del Sprint 1 y reordenar el Sprint 2 y 3 si cambia.
- Escribir escenarios Gherkin para HU04 y HU08 antes de que entren al sprint, como exige el DoR.
- Cerrar la decisión de autenticación offline en la planificación del Sprint 1.

# 5. Conclusiones

1.  Aplicar INVEST mostró que no todas las historias están listas: HU06 y HU07 son demasiado grandes y HU03, HU06 y HU12 dependen de otras, lo que obliga a dividirlas o a planificarlas juntas.
2.  Combinar WSJF con MoSCoW dio un orden de entrega defendible con números y no solo con opinión: la seguridad (HU11) y el registro sin red (HU02) pasan al frente, y la obligación legal de HU07 queda cubierta antes de la puesta en marcha.
3.  Escenarios Gherkin con etiquetas @HU, @RF y @CU, junto con el DoR y el DoD, dejan trazable la cadena requisito → historia → prueba → tarea; el siguiente paso es calibrar el plan con la velocidad real del Sprint 1.

**Referencias:** Cohn, M. (2004). *User Stories Applied*. Addison-Wesley. · Wake, B. (2003). «INVEST in Good Stories, and SMART Tasks». · Schwaber, K. y Sutherland, J. (2020). *The Scrum Guide*. · Cucumber, *Gherkin Reference*. · Leffingwell, D. (2011). *Agile Software Requirements* (WSJF). · Clegg, D. y Barker, R. (1994). *Case Method Fast-Track* (MoSCoW). · Expediente de Modelado RUP-UML AgroVerde S.A.C. (Avances 1–6), Laboratorio 2 (Tema 2) y Laboratorio 3 (Tema 3). · Guía de laboratorio Tema 4, CIIN1322P.
