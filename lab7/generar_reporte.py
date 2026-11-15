#!/usr/bin/env python3
"""Reporte semiautomático de cobertura de trazabilidad (Lab. 7, AgroVerde S.A.C.).
Uso: python3 generar_reporte.py matriz.csv pruebas.csv [salida.json]
Una fila de la matriz está COMPLETA si tiene caso de uso, diseño (clases o wireframes) y al menos una prueba."""
import csv, json, re, sys
RE = {"req": r"^RNF?\d{2}$|^RF\d{2}$", "cu": r"^CU\d{2}a?$", "hu": r"^HU\d{2}$", "cl": r"^CL\d{2}$", "pr": r"^PR-(RF|RNF)\d{2}-\d{2}$"}
def split(s): return [x.strip() for x in re.split(r"[;,]", s) if x.strip() and x.strip() != "—"]
def main(mp, tp, out=None):
    M = list(csv.DictReader(open(mp, encoding="utf-8-sig")))
    T = list(csv.DictReader(open(tp, encoding="utf-8-sig")))
    tests_by_req = {}
    for t in T:
        for r in split(t["Requisitos"]): tests_by_req.setdefault(r, []).append(t["ID"])
    rows, errs = [], []
    for m in M:
        cu, cl, hu = split(m["CU"]), split(m["Clases_IDs"]) + split(m["Wireframes"]), split(m["HU"])
        pr = tests_by_req.get(m["Req"], [])
        ok = bool(cu and cl and pr)
        rows.append({"req": m["Req"], "cu": len(cu), "diseno": len(cl), "hu": len(hu), "pruebas": len(pr), "completa": ok})
        if not re.match(RE["req"], m["Req"]): errs.append(f"ID de requisito inválido: {m['Req']}")
        for c in split(m["CU"]):
            if c != "CU00" and not re.match(RE["cu"], c): errs.append(f"{m['Req']}: CU inválido {c}")
        for h in hu:
            if not re.match(RE["hu"], h): errs.append(f"{m['Req']}: HU inválida {h}")
        for c in split(m["Clases_IDs"]):
            if not re.match(RE["cl"], c): errs.append(f"{m['Req']}: clase inválida {c}")
    for t in T:
        if not re.match(RE["pr"], t["ID"]): errs.append(f"ID de prueba inválido: {t['ID']}")
        if not split(t["Requisitos"]): errs.append(f"Prueba sin requisito: {t['ID']}")
    reqs = {m["Req"] for m in M}
    for t in T:
        for r in split(t["Requisitos"]):
            if r not in reqs: errs.append(f"{t['ID']} apunta a requisito inexistente {r}")
    res = {"requisitos": len(M), "completas": sum(r["completa"] for r in rows), "pruebas": len(T),
           "incompletas": [r["req"] for r in rows if not r["completa"]], "errores": errs, "filas": rows}
    if out: json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Requisitos: {res['requisitos']} · completos (CU + diseño + prueba): {res['completas']} · pruebas: {res['pruebas']}")
    print("Incompletos:", ", ".join(res["incompletas"]) or "ninguno")
    print("Errores de convención:", len(errs)); [print(" -", e) for e in errs]
    return res
if __name__ == "__main__": main(*sys.argv[1:4])
