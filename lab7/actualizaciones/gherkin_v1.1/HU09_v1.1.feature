# language: es
Característica: Obtener reportes de trazabilidad (v1.1 · CR-02)

  Escenario: Reporte filtrado
    Dado que existen lotes de varias líneas y estados
    Cuando la gerencia genera el reporte filtrado por línea "Palta" y estado "Sincronizado"
    Entonces el reporte lista solo los lotes que cumplen el filtro
    Y no contiene datos personales de trabajadores
    Y se genera en 10 segundos o menos
