UNIVERSIDAD PRIVADA DEL NORTE

Modelado y Desarrollo de Aplicaciones · CIIN1322P

  
  

# GUÍA DE LABORATORIO — TEMA N.° 2

**Elicitación, análisis y priorización de requisitos con stakeholders**

Caso de estudio: AgroVerde S.A.C.

  

| Integrantes                       | Código UPN |
|-----------------------------------|------------|
| Pablo Marcelino Blas Campomanes   | N00493608  |
| David Ruiz Pérez                  | N00469228  |
| Dayron Michelle Yangali Machado   | N00470550  |
| Orlando Valentino Ravenna Soriano | N00488189  |

Docente: Jorge Luis Cordova Lopez

Versión del entregable: v1.0-lab2 · Fecha: 25/10/2026

# 1. Objetivo

Levantar, analizar y priorizar los requisitos de un sistema de trazabilidad de lotes para AgroVerde S.A.C. aplicando entrevista, encuesta y prototipo de baja fidelidad; clasificar a los stakeholders, consolidar un SRS breve (IEEE 29148), registrar y resolver los conflictos detectados y acordar un alcance viable dentro de las restricciones del proyecto (presupuesto de S/ 80 000, conectividad limitada, Ley N.° 29733 y personal con alfabetización digital básica).

Las necesidades y conflictos provienen de la Reunión 1 y de la entrevista estructurada documentadas en el expediente (Avance 1–2).

# 2. Procedimiento

## Paso 1. Objetivo de elicitación y guion

**Objetivo de elicitación (OE-01):** conocer cómo se registra hoy el cierre de lote, dónde se pierde la trazabilidad entre producción, almacén y exportaciones, y qué datos personales deben protegerse, para derivar requisitos verificables.

| Técnica                         | Participantes                                                                   | Guion (preguntas clave)                                                                                                                                                                                                                              | Requisitos que alimenta      |
|---------------------------------|---------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| **T1 Entrevista estructurada**  | Jefe de producción, Encargado de almacén, Coord. de exportaciones, Esp. de RRHH | ¿Cómo se registra hoy el cierre de lote? · ¿Qué pasa sin red? · ¿Cómo concilia stock con pedidos? · ¿Qué datos personales maneja y cómo los protege? · ¿Qué reportes son indispensables? · ¿Qué información debe ser restringida?                    | RF01–RF06, RF09, RNF01–RNF03 |
| **T2 Encuesta**                 | Operarios de las 3 líneas (mín. 5)                                              | ¿Es rápido el registro actual (papel + Excel)? · ¿Ha tenido problemas para identificar un lote almacenado? · ¿Necesita registrar sin señal? · ¿Qué tan importante es la sencillez? · ¿Necesita capacitación breve? · ¿Qué función es más importante? | RF01, RF02, RNF03, RNF04     |
| **T3 Prototipo baja fidelidad** | Operario, Jefe de producción, Almacén, Exportaciones                            | Recorrido de 3 pantallas (WF-01, WF-02, WF-03) pidiendo observaciones sobre campos, mensajes y estados.                                                                                                                                              | RF01, RF02, RF05, RNF04      |

## Paso 2. Hallazgos levantados (≥ 2 técnicas: T1 entrevista + T3 prototipo, con T2 como apoyo)

| ID  | Hallazgo                                                                                                          | Técnica | Stakeholder                    | Requisito   |
|-----|-------------------------------------------------------------------------------------------------------------------|---------|--------------------------------|-------------|
| H01 | El cierre de lote se anota en ficha de papel y luego se pasa a Excel; hay reprocesos y fichas que se traspapelan. | T1, T2  | Jefe de producción / Operarios | RF01        |
| H02 | En planta no siempre hay red; el registro debe poder hacerse sin conexión y sincronizarse luego.                  | T1, T3  | Jefe de producción             | RF02, RNF03 |
| H03 | Almacén necesita el registro completo y exacto para conciliar; producción necesita cerrar rápido.                 | T1      | Jefe de producción, Almacén    | RF04, RF05  |
| H04 | Exportaciones necesita saber el stock disponible al instante para no incumplir pedidos.                           | T1, T3  | Coord. exportaciones           | RF05, RF03  |
| H05 | RRHH debe restringir el acceso a datos personales de los 47 trabajadores (Ley N.° 29733).                         | T1      | Esp. de RRHH                   | RF06, RNF02 |
| H06 | Gerencia requiere trazabilidad y costos por lote, pero sin exponer datos personales.                              | T1      | Gerencia general               | RF09, RF10  |
| H07 | ≈60 % del personal de planta tiene alfabetización digital básica: pantallas simples y capacitación breve.         | T2, T3  | Operarios                      | RNF04       |
| H08 | SENASA/SUNAT exigen documentación y reportes de trazabilidad.                                                     | T1      | SENASA/SUNAT, Exportaciones    | RF07, RF09  |

## Paso 3. Stakeholders — matriz poder/interés

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 1. Matriz poder/interés (EV-01)

| Stakeholder          | Poder | Interés | Estrategia          |
|----------------------|-------|---------|---------------------|
| Gerencia general     | Alto  | Alto    | Gestionar de cerca  |
| Jefe de producción   | Medio | Alto    | Mantener informado  |
| Encargado de almacén | Medio | Alto    | Mantener informado  |
| Coord. exportaciones | Medio | Alto    | Mantener informado  |
| Especialista de RRHH | Bajo  | Alto    | Mantener informado  |
| Operarios            | Bajo  | Medio   | Monitorear          |
| Proveedor de insumos | Bajo  | Bajo    | Monitorear          |
| SENASA / SUNAT       | Alto  | Bajo    | Mantener satisfecho |

## Paso 4. SRS breve (IEEE 29148) — versión 0.1

**4.1 Propósito.** Especificar los requisitos del Sistema de Trazabilidad de Lotes de AgroVerde S.A.C. **4.2 Alcance.** Registro de lotes, stock de almacén, conciliación con pedidos de exportación y resguardo de datos personales. Fuera de alcance de esta versión: integración directa con SENASA/SUNAT y automatización de contabilidad de costos. **4.3 Definiciones.** *Lote*: unidad de producción cerrada por línea/turno; *Conciliación*: contraste entre stock físico y cantidades comprometidas en pedidos; *Offline*: operación sin conexión con sincronización posterior. **4.4 Perspectiva.** Reemplaza el ERP artesanal en hojas de cálculo.

### 4.5 Requisitos funcionales

| ID   | Requisito (el sistema debe…)                                                 | Fuente                                     | Hallazgo |
|------|------------------------------------------------------------------------------|--------------------------------------------|----------|
| RF01 | Registrar el cierre de un lote (línea, fecha, turno y cantidad).             | Jefe de producción, Operario               | H01      |
| RF02 | Registrar el cierre de lote sin red y sincronizarlo después, sin duplicados. | Jefe de producción, Operario               | H02      |
| RF03 | Consultar estado y ubicación de un lote (producción, almacén, despacho).     | Gerencia, Coord. exportaciones             | H04      |
| RF04 | Registrar el ingreso de un lote al almacén y actualizar el stock.            | Encargado de almacén                       | H03      |
| RF05 | Conciliar el stock con los pedidos de exportación comprometidos.             | Encargado de almacén, Coord. exportaciones | H03, H04 |
| RF06 | Registrar planilla y legajo de los 47 trabajadores con control de acceso.    | Especialista de RRHH                       | H05      |
| RF07 | Generar la documentación de exportación de un lote (factura, packing list).  | Coord. exportaciones                       | H08      |
| RF08 | Buscar un lote por código, línea o fecha.                                    | Jefe de producción, Almacén                | H01      |
| RF09 | Generar reportes de trazabilidad de lote para gerencia y SENASA/SUNAT.       | Gerencia                                   | H06, H08 |
| RF10 | Registrar consumo de agua y mermas por lote.                                 | Gerencia                                   | H06      |

### 4.6 Requisitos no funcionales

| ID    | Requisito                                                                | Fuente                         | Hallazgo |
|-------|--------------------------------------------------------------------------|--------------------------------|----------|
| RNF01 | Autenticación con usuario/contraseña y permisos por rol.                 | Todos / RRHH                   | H05      |
| RNF02 | Proteger los datos personales conforme a la Ley N.° 29733.               | Especialista de RRHH           | H05      |
| RNF03 | Operar offline en líneas de producción y almacén.                        | Jefe de producción, Operario   | H02      |
| RNF04 | Interfaz simple para personal con alfabetización digital básica (≈60 %). | Operario                       | H07      |
| RNF05 | Respuesta de consultas dentro de un tiempo medible.                      | Gerencia, Coord. exportaciones | H04      |

**4.7 Restricciones:** presupuesto S/ 80 000 · conectividad básica con un punto de red estable en el módulo administrativo · Ley N.° 29733 · capacitación breve previa a la puesta en marcha.

## Paso 5. Log de conflictos e inconsistencias

| ID  | Tipo                         | Descripción                                                                                                              | Afecta            | Resolución propuesta                                                                                         | Estado            |
|-----|------------------------------|--------------------------------------------------------------------------------------------------------------------------|-------------------|--------------------------------------------------------------------------------------------------------------|-------------------|
| C01 | Conflicto entre stakeholders | Producción necesita cerrar el lote rápido; Almacén necesita el registro completo y exacto.                               | RF01, RF02, RF04  | Registro mínimo rápido (línea, fecha, turno, cantidad) en planta; Almacén completa y valida al sincronizar.  | Resuelto (D01)    |
| C02 | Conflicto entre stakeholders | Exportaciones quiere stock al instante; Almacén necesita tiempo para conciliar físicamente.                              | RF05, RF03        | Mostrar el stock con estado «Confirmado» o «En conciliación».                                                | Resuelto (D02)    |
| C03 | Conflicto entre stakeholders | RRHH restringe datos personales; Gerencia necesita costos de mano de obra por lote.                                      | RF06, RF09, RNF02 | Reportes agregados sin datos identificables para Gerencia; acceso completo solo a RRHH.                      | Resuelto (D03)    |
| C04 | Inconsistencia               | RF05/RF03 piden stock «en tiempo real», pero RNF03 permite operar offline: el stock mostrado puede estar desactualizado. | RF03, RF05, RNF03 | Mostrar fecha/hora de última sincronización junto al stock y reformular «tiempo real» como «al sincronizar». | Resuelto (D04)    |
| C05 | Ambigüedad                   | RNF05 («tiempo de respuesta adecuado») no es verificable.                                                                | RNF05             | Reescribir con umbral medible (ver paso 8).                                                                  | Resuelto (paso 8) |
| C06 | Restricción vs. alcance      | RF07 y RF09 piden documentos para SENASA/SUNAT, pero la integración directa está fuera de alcance.                       | RF07, RF09        | Generar los documentos para su presentación manual; la integración queda en una fase posterior.              | Resuelto (D05)    |

## Paso 6. Priorización — matriz de decisión

Cada requisito se califica de 1 a 5 en **valor** (impacto en el negocio), **riesgo** (riesgo que mitiga o que se corre al omitirlo), **esfuerzo** (5 = más costoso) y **dependencia** (cuántos requisitos se apoyan en él). Puntaje = 0,35·Valor + 0,25·Riesgo + 0,20·(6 − Esfuerzo) + 0,20·Dependencia. Reglas: ≥ 4,00 → Must; 3,00–3,99 → Should; \< 3,00 → Could. (\*) Obligación legal: se fija como Must sin importar el puntaje.

| ID    | Requisito                                                                    | Valor | Riesgo | Esfuerzo | Dep. | Puntaje  | MoSCoW  |
|-------|------------------------------------------------------------------------------|-------|--------|----------|------|----------|---------|
| RF01  | Registrar el cierre de un lote (línea, fecha, turno y cantidad).             | 5     | 4      | 2        | 5    | **4.55** | Must    |
| RF04  | Registrar el ingreso de un lote al almacén y actualizar el stock.            | 5     | 4      | 2        | 4    | **4.35** | Must    |
| RF02  | Registrar el cierre de lote sin red y sincronizarlo después, sin duplicados. | 5     | 5      | 4        | 4    | **4.20** | Must    |
| RNF01 | Autenticación con usuario/contraseña y permisos por rol.                     | 4     | 4      | 2        | 5    | **4.20** | Must    |
| RNF02 | Proteger los datos personales conforme a la Ley N.° 29733.                   | 5     | 5      | 3        | 3    | **4.20** | Must \* |
| RNF03 | Operar offline en líneas de producción y almacén.                            | 5     | 5      | 4        | 4    | **4.20** | Must    |
| RNF04 | Interfaz simple para personal con alfabetización digital básica (≈60 %).     | 5     | 4      | 2        | 3    | **4.15** | Must    |
| RF05  | Conciliar el stock con los pedidos de exportación comprometidos.             | 5     | 5      | 4        | 3    | **4.00** | Must    |
| RF06  | Registrar planilla y legajo de los 47 trabajadores con control de acceso.    | 4     | 5      | 3        | 2    | **3.65** | Must \* |
| RF03  | Consultar estado y ubicación de un lote (producción, almacén, despacho).     | 4     | 2      | 2        | 3    | **3.30** | Should  |
| RF07  | Generar la documentación de exportación de un lote (factura, packing list).  | 4     | 4      | 3        | 1    | **3.20** | Should  |
| RF08  | Buscar un lote por código, línea o fecha.                                    | 3     | 1      | 1        | 1    | **2.50** | Could   |
| RF09  | Generar reportes de trazabilidad de lote para gerencia y SENASA/SUNAT.       | 3     | 2      | 3        | 1    | **2.35** | Could   |
| RF10  | Registrar consumo de agua y mermas por lote.                                 | 2     | 2      | 2        | 1    | **2.20** | Could   |
| RNF05 | Respuesta de consultas dentro de un tiempo medible.                          | 2     | 1      | 2        | 1    | **1.95** | Could   |

## Paso 7. Acuerdos de alcance, supuestos y restricciones

| ID  | Decisión acordada (propuesta de negociación)                                                                                          | Conflicto | Impacto en alcance |
|-----|---------------------------------------------------------------------------------------------------------------------------------------|-----------|--------------------|
| D01 | El cierre en planta captura solo los 4 campos mínimos; Almacén completa y valida al sincronizar.                                      | C01       | RF01, RF02, RF04   |
| D02 | El stock se muestra con estado «Confirmado» / «En conciliación»; exportaciones decide con esa información.                            | C02       | RF05, RF03         |
| D03 | Gerencia recibe solo reportes agregados; los legajos son visibles únicamente para RRHH.                                               | C03       | RF06, RF09, RNF02  |
| D04 | Todo stock muestra fecha/hora de última sincronización; «tiempo real» se entiende como «al sincronizar».                              | C04       | RF03, RF05, RNF03  |
| D05 | Release 1 = Must (RF01, RF02, RF04, RF05, RF06, RNF01–RNF04). Integración con SENASA/SUNAT y contabilidad de costos fuera de alcance. | C06       | Alcance v1         |

**Supuestos:** el presupuesto de S/ 80 000 se mantiene; la gerencia facilita acceso a al menos 2 stakeholders de áreas distintas; hay un punto de red estable en el módulo administrativo; el personal recibe capacitación breve antes de la puesta en marcha. **Restricciones:** conectividad limitada en planta, cumplimiento de la Ley N.° 29733, alfabetización digital básica en ≈60 % del personal y tope presupuestal.

## Paso 8. Validación — checklist de calidad y ajuste de redacción

| Criterio                                    | Resultado | Observación                                 |
|---------------------------------------------|-----------|---------------------------------------------|
| Claro y no ambiguo                          | Ajustado  | RNF05 y «tiempo real» reescritos (abajo).   |
| Verificable                                 | Ajustado  | Se añaden criterios de aceptación medibles. |
| Consistente entre sí                        | Ajustado  | C04 resuelto con D04.                       |
| Trazable a un stakeholder / hallazgo        | Cumple    | Columnas «Fuente» y «Hallazgo» del SRS.     |
| Cubre RF y RNF                              | Cumple    | 10 RF + 5 RNF.                              |
| Incluye protección de datos (Ley N.° 29733) | Cumple    | RF06 y RNF02.                               |

### Redacción antes → después

| ID    | Antes                                                                                       | Después (v0.2)                                                                                                                                                   |
|-------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RNF05 | El sistema debe mostrar los resultados de las consultas en un tiempo de respuesta adecuado. | El sistema debe mostrar el resultado de una búsqueda de lote (RF08) en ≤ 3 s para el 95 % de las consultas desde el módulo administrativo.                       |
| RF05  | Conciliar el stock en tiempo real con los pedidos.                                          | El sistema debe conciliar el stock con los pedidos comprometidos y mostrar la fecha/hora de la última sincronización y el estado (Confirmado / En conciliación). |
| RF02  | Registrar en modo offline y sincronizar posteriormente.                                     | El sistema debe guardar el cierre de lote localmente sin red y sincronizarlo al detectar conexión, sin generar registros duplicados.                             |

**Validación con stakeholders:** los requisitos v0.2 se presentan a Gerencia, Jefe de producción, Almacén, Exportaciones y RRHH para registrar su conformidad en un acta.

## Paso 9. Versionado de artefactos

| Versión   | Contenido                                                  | Commit                                                                          |
|-----------|------------------------------------------------------------|---------------------------------------------------------------------------------|
| v0.1      | SRS inicial con RF01–RF10 y RNF01–RNF05                    | feat(srs): requisitos v0.1 desde entrevista y encuesta (RF01-RF10, RNF01-RNF05) |
| v0.2      | Redacción verificable y conflictos C01–C06 resueltos       | docs(srs): reescribe RNF05, RF02, RF05 y registra log de conflictos             |
| v1.0-lab2 | Priorización MoSCoW, acuerdos D01–D05 y prototipo WF-01…03 | docs(lab2): matriz de decisión, acuerdos y prototipo — tag v1.0-lab2            |

# 3. Evidencias técnicas

## EV-01 Matriz de stakeholders y EV-02 registro de conflictos

Ver Figura 1 (paso 3) y log C01–C06 (paso 5).

## EV-03 Prototipo de baja fidelidad

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

\*(ver carpeta diagramas/ o wireframes/)\*

Figura 2. Wireframes WF-01, WF-02 y WF-03 (baja fidelidad).

## EV-04 Técnicas UX

### Buyer persona (arquetipo)

| Atributo             | Descripción                                                                                                   |
|----------------------|---------------------------------------------------------------------------------------------------------------|
| Perfil               | Operario/a de producción de una de las 3 líneas (espárrago, palta o arándano); alfabetización digital básica. |
| Objetivo             | Cerrar el lote rápido y sin errores, con o sin señal.                                                         |
| Frustraciones        | Fichas de papel que se traspapelan; registro lento; no saber si su lote llegó al almacén.                     |
| Entorno              | Línea de planta con cobertura irregular; usa un celular o tablet compartida.                                  |
| Requisitos asociados | RF01, RF02, RNF03, RNF04                                                                                      |

### Mapa de empatía

| Piensa y siente                                                           | Ve                                                                      | Escucha                                                                      | Dice y hace                                                                            | Le preocupa / Necesita                                                                              |
|---------------------------------------------------------------------------|-------------------------------------------------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Quiere cerrar el lote sin errores y teme que su ficha no llegue a tiempo. | Un proceso manual con ficha de papel porque la red no llega a su línea. | Indicaciones del jefe de producción y consultas de almacén sobre cantidades. | Cierra el lote tras lavado, selección y empaque y entrega la ficha al final del turno. | Errores en la ficha o pérdida de trazabilidad. Necesita un registro simple y rápido, con o sin red. |

### Story map

| Actividad →            | Cerrar lote                                        | Almacenar                       | Conciliar y despachar                                    | Cumplir y reportar                              |
|------------------------|----------------------------------------------------|---------------------------------|----------------------------------------------------------|-------------------------------------------------|
| **Pasos del usuario**  | Elegir línea y turno · Ingresar cantidad · Guardar | Recibir lote · Actualizar stock | Revisar stock vs. pedido · Confirmar · Emitir documentos | Consultar lote · Ver reporte · Proteger legajos |
| **Release 1 (Must)**   | RF01 · RF02 · RNF03 · RNF04                        | RF04 · RNF01                    | RF05                                                     | RF06 · RNF02                                    |
| **Release 2 (Should)** | —                                                  | —                               | RF07                                                     | RF03                                            |
| **Release 3 (Could)**  | RF08                                               | RF10                            | —                                                        | RF09 · RNF05                                    |

Tabla de releases por actividad del usuario (EV-05)

# 4. Análisis de resultados

**Coherencia.** Cada requisito del SRS se apoya en al menos un hallazgo (H01–H08) y en un stakeholder identificado en la matriz; las pantallas WF-01 a WF-03 cubren RF01, RF02, RF04, RF05, RNF03 y RNF04, que son los Must de mayor puntaje. La priorización por matriz coincide con la del expediente en que el registro de lote, la conciliación y la protección de datos forman el núcleo de la versión 1.

### Brechas e inconsistencias

- **Validación pendiente:** los requisitos v0.2 aún no cuentan con acta firmada; solo existen las necesidades recogidas en la Reunión 1.
- **Tensión «tiempo real» vs. offline (C04):** se resolvió mostrando la última sincronización, pero exige un indicador visible en la interfaz.
- **RNF05** estaba sin medida; el umbral de 3 s debe confirmarse con la infraestructura real.
- **Datos personales:** RF06/RNF02 tienen puntaje inferior a otros requisitos, pero se tratan como Must por obligación legal.

### Riesgos y mejoras

| Riesgo                                                | Efecto                             | Mejora propuesta                                                                                            |
|-------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Sincronización con duplicados o conflictos de versión | Stock y pedidos inconsistentes     | Identificador único por registro y regla de no duplicados en RF02; prueba específica en el plan de pruebas. |
| Baja adopción por alfabetización digital limitada     | Se mantiene el papel               | Pantallas de 4 campos, mensajes claros y capacitación breve (RNF04).                                        |
| Exposición de datos personales                        | Incumplimiento de la Ley N.° 29733 | Roles por perfil, reportes agregados y registro de auditoría (RNF01, RNF02, D03).                           |
| Presupuesto de S/ 80 000 insuficiente para todo       | Retraso o recorte                  | Entregar por releases: los Should y Could solo se desarrollan si el presupuesto lo permite.                 |

# 5. Conclusiones

1.  Combinar entrevista, encuesta y prototipo permitió detectar que el problema central no es solo registrar el lote, sino hacerlo bajo conectividad irregular y con usuarios de baja alfabetización digital; por eso RF02, RNF03 y RNF04 resultaron decisivos para el diseño.
2.  La matriz de decisión y el log de conflictos transformaron desacuerdos entre áreas (rapidez vs. precisión, stock inmediato vs. conciliación, privacidad vs. costos) en acuerdos concretos D01–D05, que acotan la versión 1 a lo que cabe en S/ 80 000.
3.  Reescribir requisitos ambiguos (RNF05, «tiempo real») con criterios medibles mejora su verificabilidad; el siguiente paso es validarlos con los stakeholders y firmar el acta antes de modelar.

## Referencias

ISO/IEC/IEEE 29148:2018, *Systems and software engineering — Life cycle processes — Requirements engineering*. · Ley N.° 29733, Ley de Protección de Datos Personales (Perú). · Expediente de Modelado RUP-UML, AgroVerde S.A.C. (Avances 1–6). · Guía de laboratorio Tema 2, CIIN1322P.
