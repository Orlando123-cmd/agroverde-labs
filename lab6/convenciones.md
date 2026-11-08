# Convenciones del repositorio

- **Ramas**: main (línea base publicada), iter/N-tema (trabajo de una iteración), fix/hallazgo-Hn (correcciones de revisión)
- **Commits**: Formato «tipo(alcance): descripción · IDs», p. ej. docs(vision): Visión v1 · VIS-01, RF01–RF10. Tipos: docs, model, fix, chore
- **Tags**: vX.0-lab N para cada laboratorio; vN.0-iterN para la línea base de cada iteración (v1.0-iter1, v2.0-iter2, v3.0-iter3)
- **Identificadores**: RF/RNF (requisitos), CU (casos de uso, CU00 = autenticar), HU (historias), AD (actividad), WF (wireframes), SEQ (secuencia), STM (estados), PKG (paquetes), TR (trazabilidad), RSK (riesgos), CR (solicitudes de cambio), H (hallazgos)
- **Nombres de archivos**: TemaN_grupo5 para entregas; ID_descripcion_en_minusculas para diagramas
- **Revisión**: Pull request con checklist de coherencia; al menos un integrante distinto del autor revisa antes de fusionar

## Estructura
```
agroverde-labs/
├── lab2/ … lab5/                 (entregas anteriores, tags v1.0-lab2 … v1.0-lab5)
├── lab6/
│   ├── Tema6_grupo5.pdf
│   ├── vision_v1.md
│   ├── roadmap_iteraciones.csv
│   ├── matriz_fase_artefactos.csv
│   ├── riesgos_por_fase.csv
│   ├── checklist_coherencia.csv
│   ├── hallazgos_revision.csv
│   ├── convenciones.md
│   └── diagramas/                (RM-01 roadmap, AD-02 excepciones)
└── iteraciones/                  (estructura por iteración)
    ├── iter1-inicio-elaboracion/ (LB-1.0 → tag v1.0-iter1)
    ├── iter2-construccion/       (v2.0-iter2)
    └── iter3-transicion/         (v3.0-iter3)
```

## Convención de estados
Texto de interfaz: Pendiente, Sincronizado, En conciliación, Confirmado. Enumeraciones del modelo: PENDIENTE, SINCRONIZADO, EN_CONCILIACION, CONFIRMADO.
