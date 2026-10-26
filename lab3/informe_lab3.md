UNIVERSIDAD PRIVADA DEL NORTE

Modelado y Desarrollo de Aplicaciones · CIIN1322P

  
  

# GUÍA DE LABORATORIO — TEMA N.° 3

**Modelado y especificación de casos de uso + prototipado de flujos**

Caso de estudio: AgroVerde S.A.C.

  

| Integrantes                       | Código UPN |
|-----------------------------------|------------|
| Pablo Marcelino Blas Campomanes   | N00493608  |
| David Ruiz Pérez                  | N00469228  |
| Dayron Michelle Yangali Machado   | N00470550  |
| Orlando Valentino Ravenna Soriano | N00488189  |

Docente: Jorge Luis Cordova Lopez

Versión del entregable: v1.0-lab3 · Fecha: 25/10/2026

# 1. Objetivo

Delimitar el sistema de trazabilidad de AgroVerde S.A.C. mediante un modelo UML de casos de uso, especificar tres casos clave con sus flujos principal, alternos y excepciones, y comprobar su comportamiento con diagramas de actividad y prototipos de pantallas coherentes entre sí y con los requisitos del Laboratorio 2.

# 2. Procedimiento

## Paso 1. Módulo y alcance modelado

Se modela el **Sistema Integrado de Trazabilidad** completo (9 casos de uso del expediente más la extensión CU05a), con especificación detallada del módulo crítico **registro, sincronización y conciliación de lotes** (CU01, CU02 y CU05). Se eligió porque concentra los requisitos de prioridad Must (RF01, RF02, RF04, RF05, RNF03, RNF04) definidos en el Laboratorio 2. Quedan fuera la integración directa con SENASA/SUNAT y la contabilidad de costos.

## Paso 2. Actores y objetivos

| Actor                   | Tipo                 | Objetivos                                                 | Casos de uso     |
|-------------------------|----------------------|-----------------------------------------------------------|------------------|
| Operario de producción  | Primario             | Cerrar su lote rápido y sin errores, con o sin red.       | CU01, CU02       |
| Jefe de producción      | Primario             | Validar el cierre de lote y seguir su estado.             | CU01, CU03       |
| Encargado de almacén    | Primario             | Recibir lotes, mantener stock y conciliarlo con pedidos.  | CU02, CU04, CU05 |
| Coord. de exportaciones | Primario             | Confirmar disponibilidad y emitir documentos de despacho. | CU05, CU07       |
| Especialista de RRHH    | Primario             | Gestionar legajos con acceso restringido.                 | CU06             |
| Gerencia general        | Primario             | Obtener reportes de trazabilidad y de agua/mermas.        | CU08, CU09       |
| SENASA / SUNAT          | Secundario (externo) | Recibir documentos y reportes de trazabilidad.            | CU07, CU08       |

### Inventario de casos de uso

| ID    | Caso de uso                                          | Actor principal               | RF/RNF             | Prioridad | Especificado   |
|-------|------------------------------------------------------|-------------------------------|--------------------|-----------|----------------|
| CU01  | Registrar cierre de lote                             | Operario / Jefe de producción | RF01, RNF01, RNF04 | Must      | Sí             |
| CU02  | Registrar lote offline y sincronizar                 | Operario / Almacén            | RF02, RNF03        | Must      | Sí             |
| CU03  | Consultar trazabilidad                               | Jefe de producción            | RF03, RF08         | Should    | No             |
| CU04  | Registrar ingreso y stock                            | Encargado de almacén          | RF04               | Must      | No             |
| CU05  | Conciliar stock y pedidos                            | Almacén / Exportaciones       | RF05               | Must      | Sí             |
| CU05a | Registrar diferencia de conciliación (extiende CU05) | Almacén                       | RF05               | Must      | Dentro de CU05 |
| CU06  | Gestionar datos de trabajadores                      | Especialista de RRHH          | RF06, RNF02        | Must      | No             |
| CU07  | Generar documentos de exportación                    | Coord. de exportaciones       | RF07               | Should    | No             |
| CU08  | Generar reportes de trazabilidad                     | Gerencia                      | RF09               | Could     | No             |
| CU09  | Registrar agua y mermas                              | Gerencia / Producción         | RF10               | Could     | No             |

## Paso 3. Diagrama UML de casos de uso (EV-01)

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 1. Diagrama de casos de uso del sistema (UML). CU02 extiende a CU01 cuando no hay red; CU05a extiende a CU05 cuando hay diferencia.

## Paso 4. Especificaciones completas de casos de uso (EV-02)

### CU01 — Registrar cierre de lote

<table class="spec">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Elemento</th>
<th>Especificación</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>ID / Prioridad</td>
<td>CU01 · Must · RF01, RNF01, RNF04</td>
</tr>
<tr class="even">
<td>Actor primario</td>
<td>Operario de producción. Secundario: Jefe de producción (valida el cierre).</td>
</tr>
<tr class="odd">
<td>Objetivo</td>
<td>Registrar el cierre de un lote con línea, fecha, turno y cantidad, generando un código trazable.</td>
</tr>
<tr class="even">
<td>Disparador</td>
<td>El operario termina lavado, selección y empaque del lote.</td>
</tr>
<tr class="odd">
<td>Precondiciones</td>
<td>El usuario tiene cuenta activa con rol Operario o Jefe de producción. El equipo tiene la aplicación instalada.</td>
</tr>
<tr class="even">
<td>Postcondición (éxito)</td>
<td>El lote queda guardado con código único y estado «Registrado», disponible para consulta (CU03) y para ingreso a almacén (CU04). Queda registro de auditoría.</td>
</tr>
<tr class="odd">
<td>Flujo principal</td>
<td>1. El usuario inicia sesión.<br />
2. El sistema valida credenciales y rol.<br />
3. El usuario elige la línea.<br />
4. Ingresa fecha, turno y cantidad (kg).<br />
5. El sistema valida los campos (RN01, RN03).<br />
6. El sistema verifica que haya conexión.<br />
7. Genera el código de lote único (RN02).<br />
8. Guarda el lote y registra auditoría.<br />
9. Muestra la confirmación con el código de lote.</td>
</tr>
<tr class="even">
<td>Flujos alternos</td>
<td><strong>A1 (paso 6) Sin conexión:</strong> el sistema deriva a CU02 y el lote se guarda localmente.<br />
<strong>A2 (paso 5) Dato inválido:</strong> muestra el error y regresa al paso 4.</td>
</tr>
<tr class="odd">
<td>Excepciones</td>
<td><strong>E1</strong> credenciales o rol inválidos: se rechaza el acceso (RN04).<br />
<strong>E2</strong> campos obligatorios incompletos o cantidad ≤ 0.<br />
<strong>E3</strong> código de lote duplicado: se rechaza y se notifica (RN02).<br />
<strong>E4</strong> usuario sin permiso para la línea.</td>
</tr>
<tr class="even">
<td>Reglas de negocio</td>
<td>RN01, RN02, RN03, RN04</td>
</tr>
<tr class="odd">
<td>Evidencias asociadas</td>
<td>AD-01 · WF-00, WF-01</td>
</tr>
</tbody>
</table>

### CU02 — Registrar lote offline y sincronizar

<table class="spec">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Elemento</th>
<th>Especificación</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>ID / Prioridad</td>
<td>CU02 · Must · RF02, RNF03</td>
</tr>
<tr class="even">
<td>Actores</td>
<td>Primario: Operario. Secundario: Encargado de almacén.</td>
</tr>
<tr class="odd">
<td>Objetivo</td>
<td>Permitir cerrar un lote sin cobertura y sincronizarlo después desde un punto con conectividad, sin perder trazabilidad.</td>
</tr>
<tr class="even">
<td>Disparador</td>
<td>CU01 detecta que no hay conexión (extensión), o el operario cierra un lote sin red.</td>
</tr>
<tr class="odd">
<td>Precondiciones</td>
<td>El operario se autenticó en el equipo con anterioridad. Existe un punto de red estable en el módulo administrativo (supuesto del proyecto).</td>
</tr>
<tr class="even">
<td>Postcondición (éxito)</td>
<td>El registro queda en estado «Sincronizado» (trazabilidad completa) o «En conciliación» si hay diferencia; nunca se pierde ni se duplica.</td>
</tr>
<tr class="odd">
<td>Flujo principal</td>
<td>1. El operario captura los datos del lote.<br />
2. El sistema detecta la falta de red.<br />
3. Guarda el registro en el equipo y lo marca «Pendiente» (RN05).<br />
4. El encargado de almacén recibe el registro y valida los datos.<br />
5. Sincroniza el registro con el servidor (RN06).<br />
6. El sistema verifica que no haya duplicado ni diferencia.<br />
7. Marca la trazabilidad como completa («Sincronizado»).</td>
</tr>
<tr class="even">
<td>Flujos alternos</td>
<td><strong>A1 (paso 3) Equipo no disponible:</strong> el operario anota en ficha de papel y la entrega al almacén, que transcribe el registro.<br />
<strong>A2 (paso 6) Diferencia de cantidad o duplicado:</strong> el sistema marca «En conciliación» y registra la diferencia; continúa en CU05.</td>
</tr>
<tr class="odd">
<td>Excepciones</td>
<td><strong>E1</strong> sin cobertura al sincronizar: el registro sigue «Pendiente» y se reintenta.<br />
<strong>E2</strong> ficha o datos incompletos: se notifica al operario y el registro sigue «Pendiente».<br />
<strong>E3</strong> duplicidad al sincronizar: se resuelve con RN06.<br />
<strong>E4</strong> diferencia entre cantidad física y registrada.</td>
</tr>
<tr class="even">
<td>Reglas de negocio</td>
<td>RN05, RN06, RN07</td>
</tr>
<tr class="odd">
<td>Evidencias asociadas</td>
<td>AD-02 · WF-02</td>
</tr>
</tbody>
</table>

### CU05 — Conciliar stock y pedidos

<table class="spec">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Elemento</th>
<th>Especificación</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>ID / Prioridad</td>
<td>CU05 · Must · RF05, RF04</td>
</tr>
<tr class="even">
<td>Actores</td>
<td>Primarios: Encargado de almacén y Coordinador de exportaciones.</td>
</tr>
<tr class="odd">
<td>Objetivo</td>
<td>Comparar el stock disponible con las cantidades comprometidas en pedidos para evitar sobrecompromisos.</td>
</tr>
<tr class="even">
<td>Disparador</td>
<td>El usuario necesita confirmar disponibilidad para un pedido de exportación.</td>
</tr>
<tr class="odd">
<td>Precondiciones</td>
<td>Existen lotes ingresados a almacén (CU04) y al menos un pedido de exportación registrado. El usuario tiene rol Almacén o Exportaciones.</td>
</tr>
<tr class="even">
<td>Postcondición (éxito)</td>
<td>Cada pedido muestra su estado (Confirmado / En conciliación) y la cantidad disponible; la conciliación queda registrada con fecha de última sincronización (D04).</td>
</tr>
<tr class="odd">
<td>Flujo principal</td>
<td>1. El usuario consulta el stock.<br />
2. Selecciona un pedido.<br />
3. El sistema compara disponible vs. comprometido (RN08).<br />
4. Muestra el estado Confirmado o En conciliación.<br />
5. Si coincide con el stock físico, el usuario valida.<br />
6. El sistema registra la conciliación y actualiza el estado (RN09).</td>
</tr>
<tr class="even">
<td>Flujos alternos</td>
<td><strong>A1 (paso 4) Pedido supera el stock:</strong> estado «En conciliación»; el usuario revisa la diferencia.<br />
<strong>A2 (paso 5) No coincide con el stock físico:</strong> se ejecuta CU05a (registrar diferencia y motivo) y luego se registra la conciliación.</td>
</tr>
<tr class="odd">
<td>Excepciones</td>
<td><strong>E1</strong> stock físico distinto al del sistema.<br />
<strong>E2</strong> lote aún «En conciliación» o «Pendiente» (no cuenta como stock confirmado, RN07).<br />
<strong>E3</strong> pedido que supera el stock disponible.<br />
<strong>E4</strong> sin conexión: se muestra el stock con su última sincronización.</td>
</tr>
<tr class="even">
<td>Reglas de negocio</td>
<td>RN07, RN08, RN09</td>
</tr>
<tr class="odd">
<td>Evidencias asociadas</td>
<td>AD-03 · WF-03, WF-04</td>
</tr>
</tbody>
</table>

## Paso 5. Reglas de negocio, validaciones y excepciones

| ID   | Regla / validación                                                                                                                                                                                                        | CU          | Excepción | Req.        |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------|-------------|
| RN01 | Todo lote exige línea, fecha, turno y cantidad.                                                                                                                                                                           | CU01        | E2        | RF01        |
| RN02 | El código de lote es único, con formato LOT-línea-fecha-turno-correlativo; un duplicado se rechaza.                                                                                                                       | CU01        | E3        | RF01        |
| RN03 | La cantidad es un número positivo en kg, con un tope por línea definido por el Jefe de producción.                                                                                                                        | CU01        | E2        | RF01        |
| RN04 | Solo los roles Operario y Jefe de producción pueden cerrar lotes; todo acceso se autentica.                                                                                                                               | CU01        | E1, E4    | RNF01       |
| RN05 | Sin red, el lote se guarda en el equipo con estado «Pendiente» y un código provisional con prefijo del equipo; el código definitivo se asigna al sincronizar. Solo si el equipo no está disponible se usa ficha de papel. | CU02        | A1        | RF02, RNF03 |
| RN06 | La sincronización es idempotente: un registro con el mismo identificador local no se duplica.                                                                                                                             | CU02        | E3        | RF02        |
| RN07 | Un lote «Pendiente» o «En conciliación» no cuenta como stock Confirmado hasta que Almacén lo valida.                                                                                                                      | CU02, CU05  | E2        | RF04, RF05  |
| RN08 | Si lo comprometido supera lo disponible, el pedido queda «En conciliación».                                                                                                                                               | CU05        | E3        | RF05        |
| RN09 | Toda diferencia exige motivo; toda conciliación guarda usuario, fecha y hora en la auditoría.                                                                                                                             | CU05, CU05a | E1        | RF05, RNF02 |

## Paso 6. Diagramas de actividad (EV-03)

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 2. AD-01 — Actividad de CU01 Registrar cierre de lote (RF01, RN01–RN04).

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 3. AD-02 — Actividad de CU02 Registrar lote offline y sincronizar (RF02, RNF03, RN05–RN07).

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 4. AD-03 — Actividad de CU05 Conciliar stock y pedidos (RF05, RN07–RN09).

## Paso 7. Wireframes y flujo de navegación (EV-04)

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

| WF    | CU    | Pantalla                  |
|-------|-------|---------------------------|
| WF-00 | Todos | Ingreso (RNF01)           |
| WF-01 | CU01  | Cerrar lote               |
| WF-02 | CU02  | Sin conexión / pendientes |
| WF-03 | CU05  | Conciliar stock           |
| WF-04 | CU05a | Registrar diferencia      |

Figura 5. Wireframes de baja fidelidad (WF-00 a WF-04). WF-01 a WF-03 mantienen los IDs del Laboratorio 2.

### Flujo de navegación

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 6. Navegación entre pantallas según el rol y los casos de uso.

## Paso 8. Revisión de consistencia

| CU                    | Inventario | Diagrama UML    | Especificación            | Actividad | Wireframe    | Requisitos            |
|-----------------------|------------|-----------------|---------------------------|-----------|--------------|-----------------------|
| CU01                  | ✓          | ✓               | ✓                         | AD-01     | WF-00, WF-01 | RF01, RNF01, RNF04    |
| CU02                  | ✓          | ✓ (extend CU01) | ✓                         | AD-02     | WF-02        | RF02, RNF03           |
| CU05                  | ✓          | ✓               | ✓                         | AD-03     | WF-03        | RF05                  |
| CU05a                 | ✓          | ✓ (extend CU05) | Dentro de CU05            | AD-03     | WF-04        | RF05                  |
| CU03, CU04, CU06–CU09 | ✓          | ✓               | — (fuera del mínimo de 3) | —         | —            | RF03, RF04, RF06–RF10 |

### Inconsistencias detectadas y resueltas

| ID   | Inconsistencia                                                                                                                        | Resolución                                                                                                                                                  |
|------|---------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| I-01 | El diagrama del expediente (Avance 3) registra primero en **papel** sin red, pero los wireframes del Lab. 2 guardan **en el equipo**. | Se define RN05: primero se guarda en el equipo; el papel es solo contingencia si el equipo no está disponible (A1 de CU02).                                 |
| I-02 | La postcondición de CU02 decía «pendiente/conciliado», sin estados definidos.                                                         | Se fijan tres estados: Pendiente, Sincronizado y En conciliación (RN05–RN07).                                                                               |
| I-03 | CU01 exige «iniciar sesión», pero sin red el servidor no puede validar credenciales (RNF01 vs. RNF03).                                | WF-00 y la precondición de CU02 asumen validación con el último acceso del equipo. **Decisión técnica pendiente** de confirmar con el equipo de desarrollo. |
| I-04 | El expediente no tenía un caso para registrar diferencias, aunque CU05 las menciona.                                                  | Se agrega CU05a como extensión de CU05.                                                                                                                     |
| I-05 | CU01 genera el código en el sistema, pero offline no hay servidor.                                                                    | RN05: código provisional con prefijo del equipo y definitivo al sincronizar.                                                                                |

# 3. Análisis de resultados

**Coherencia.** Cada caso de uso especificado se traza a requisitos del Laboratorio 2 (RF01, RF02, RF05, RNF01, RNF03, RNF04), tiene un diagrama de actividad y al menos un wireframe, y las reglas RN01–RN09 cubren todas las excepciones listadas. Los tres casos elegidos son los de prioridad Must con mayor puntaje en la matriz de decisión.

### Brechas y riesgos

- **Autenticación offline (I-03):** sin una decisión técnica, RNF01 y RNF03 pueden contradecirse en planta.
- **Casos sin especificar:** CU03, CU04 y CU06–CU09 solo están en el inventario; CU04 y CU06 deberían especificarse a continuación por ser Must.
- **Tope de cantidad (RN03):** el valor por línea no está definido; debe fijarlo el Jefe de producción.
- **Validación con usuarios:** los wireframes aún no se probaron con operarios reales; es el principal riesgo frente a su alfabetización digital básica (RNF04).

### Mejoras propuestas

- Probar los wireframes con 3 a 5 operarios y registrar observaciones antes de pasar a diseño.
- Modelar el diagrama de estados del lote (Pendiente, Sincronizado, En conciliación) para reforzar RN05–RN07.
- Especificar CU04 para completar el ciclo producción → almacén → conciliación.

# 4. Conclusiones

1.  Especificar CU01, CU02 y CU05 con flujos alternos y excepciones sacó a la luz cinco inconsistencias (por ejemplo, papel vs. equipo y autenticación sin red) que no eran visibles en el inventario de requisitos.
2.  Pasar de la contingencia en papel a un registro local con estados explícitos hace que el lote no pierda trazabilidad al sincronizar, y la separación entre CU01, CU02 y CU05a mantiene cada caso simple y verificable.
3.  Mantener los mismos IDs en requisitos, casos de uso, actividades y pantallas permite verificar la coherencia entre artefactos; lo siguiente es validar los prototipos con usuarios y cerrar la decisión de autenticación offline.

# 5. Evidencias, versionado y referencias

| Versión   | Contenido                                        | Commit                                                                                  |
|-----------|--------------------------------------------------|-----------------------------------------------------------------------------------------|
| v0.1      | Inventario de actores y casos de uso             | docs(cu): inventario de actores y 10 casos de uso                                       |
| v0.2      | Diagrama UML y especificaciones CU01, CU02, CU05 | feat(cu): diagrama UML y especificaciones completas                                     |
| v1.0-lab3 | Actividad, wireframes y revisión de consistencia | docs(lab3): diagramas de actividad, wireframes y matriz de consistencia — tag v1.0-lab3 |

**Referencias:** OMG, *Unified Modeling Language Specification* v2.5.1 (2017). · Cockburn, A. (2001). *Writing Effective Use Cases*. Addison-Wesley. · ISO/IEC/IEEE 29148:2018. · Expediente de Modelado RUP-UML AgroVerde S.A.C. (Avances 1–6) y Laboratorio 2 (Tema 2). · Guía de laboratorio Tema 3, CIIN1322P.
