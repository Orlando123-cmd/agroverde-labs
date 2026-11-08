# Documento de Visión v1 — AgroVerde S.A.C.

## Necesidad y problema
Lotes sin trazabilidad entre las 3 líneas; conflicto entre stock de almacén y pedidos de exportación; datos personales de 47 trabajadores sin control de acceso (Ley N.° 29733); reprocesos manuales con costo por lote impreciso.

## Objetivo del sistema
Sistema integrado de trazabilidad de lotes, stock y datos de personal para AgroVerde S.A.C., operable con conectividad limitada y por usuarios con alfabetización digital básica.

## Dentro del alcance (v1)
Registro de cierre de lote con y sin red (RF01, RF02), consulta y búsqueda (RF03, RF08), ingreso a almacén y stock (RF04), conciliación stock–pedidos (RF05), datos personales con acceso por rol (RF06), documentos de exportación (RF07), reportes (RF09), agua y mermas (RF10).

## Fuera del alcance (v1)
Integración directa con SENASA/SUNAT; planillas y remuneraciones; hardware de planta; implementación productiva (el desafío entrega el modelado).

## Stakeholders (poder/interés)
Alto poder/alto interés: Gerencia general. Alto interés: Jefe de producción, Encargado de almacén, Coord. de exportaciones, Esp. de RRHH. Interés medio: operarios (27). Externos: SENASA/SUNAT y clientes internacionales.

## Restricciones (5 dimensiones)
Legal: Ley N.° 29733 (47 trabajadores). Social: ~60% de operarios con alfabetización digital básica. Económica: presupuesto S/ 80,000. Técnica: red no cubre líneas ni almacén. Ambiental: alto consumo de agua y mermas diarias.

## Criterios de éxito medibles
(1) 10 de 10 RF con CU, HU, clase y prueba en la matriz. (2) 100% de las clases con requisito asociado. (3) Cero dependencias cíclicas entre paquetes. (4) Backlog de 12 HU con ≥ 5 features Gherkin. (5) Ajustes de la Reunión 2 registrados con CR.

## Suposiciones y dependencias
Presupuesto constante; acceso a ≥ 2 stakeholders para la Reunión 2; punto de red estable en el módulo administrativo; capacitación breve del personal de planta.
