# ark-legaltech

Red agéntica de despachos jurídicos, contables y notariales en Cloudflare Workers.

## AUREUS

Instancia legal-tech del sistema **AUREUS**.  
Versión 0.1.0 · Instancia: AUREUS · Fecha: 2026-10-27

> **AUREUS no decora el derecho: lo acuña.**  
> Cada color es estado. Cada arco es validación. Cada sello es responsabilidad.  
> La IA agéntica no sustituye al abogado: traza la vía, ordena la tabula y prepara el sello.

Arquitectura objetivo: **Cloudflare Workers multi-tenant** + frontend React/Vite o Astro/PWA.

---

## Filosofía

- **Autoridad mineral, precisión jurídica, confianza acuñada.**
- Dos modos cromáticos: **Nox Basalt** (oscuro institucional, consola agéntica) y **Marmora / Pergamino** (claro patrimonial, storefront público).
- **Regla del 8% ornamental:** bronce/oro, púrpura porfídico y texturas nunca superan ~8% de la superficie efectiva.
- La IA no reemplaza la autoridad final: el abogado es el *keystone*.

---

## Vocabulario del tenant

| Concepto genérico | Vocabulario AUREUS |
|---|---|
| Caso / ticket | `expediente` |
| Documento generado | `minuta`, `tabula`, `escritura` |
| Proceso del agente | `via agentis` |
| Paso validado | `miliarium` |
| Handoff humano | `mutatio` |
| Firma / aprobación | `sigillum` |
| Cierre definitivo | `clausura` |
| Auditoría | `codex probatorio` |
| Alerta regulatoria | `evento de corte` |
| Monto / plazo / folio | dato mono, nunca decorativo |

---

## Flujo operativo

1. **Ingesta documental** — la tabula recibe hechos, contratos, facturas, correos, evidencias.
2. **Validación de vía** — el agente recorre la ruta: datos, plazos, jurisdicción, riesgos.
3. **Keystone humano** — el abogado valida el punto crítico. No se automatiza la autoridad final.
4. **Sellado** — documento firmado, hash registrado, estado bloqueado.
5. **Archivo auditable** — expediente cerrado, trazable, exportable.

---

## Semántica cromática operativa

| Color | Significado | Uso |
|---|---|---|
| Bronce/oro `#C9A664` | Confianza, acción primaria, firma | “Firmar minuta”, “Sellar expediente” |
| Púrpura porfídico `#8B4A5A` | Autoridad, cierre, jurisdicción | Badge “Sellado”, “Resolución” |
| Olivo `#7E9A6E` | Conforme, validado | “Documento válido”, “PLD conforme” |
| Bronce ámbar `#C98A3D` | En proceso, agente trabajando | “Agente revisando”, “Pendiente de firma” |
| Terracota `#CC766C` | Riesgo, vencimiento, excepción | “Plazo crítico”, “Dato conflictivo” |
| Acero azul `#6E8FA3` | Automatización, traza | “Ejecutado por agente”, “Hash verificado” |

---

## Tipografía

- **Display:** `Cormorant Garamond` / `EB Garamond` — titulares, marca, sellos.
- **Cuerpo/UI:** `Inter` — dashboard, formularios, lectura operativa.
- **Mono:** `JetBrains Mono` / `IBM Plex Mono` — folios, montos, hashes, fechas. **Obligatoria con `tabular-nums`.**

---

## Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **TypeScript:** 5.7
- **Tests:** Vitest
- **Infra:** Wrangler, D1 (SQLite)

---

## Comandos

```bash
npm run dev      # Desarrollo local (wrangler dev)
npm run deploy   # Despliegue a Cloudflare
npm run test     # Ejecutar pruebas (vitest)
npm run typecheck # Verificación de tipos TypeScript
npm run d1:init  # Inicializar base de datos local D1
```

---

## Estructura

```
ark-legaltech/
├── src/             # Código fuente
├── tests/           # Pruebas (vitest)
├── public/          # Assets públicos
├── assets/          # Assets artísticos AUREUS
├── docs/            # Documentación del sistema
├── schema.sql       # Esquema de base de datos
├── wrangler.toml    # Configuración de Cloudflare
└── package.json
``

---

## Recursos

- Documentación del sistema: `docs/legaltech-aureus.md`
- Configuración de Cloudflare: `wrangler.toml`
- Esquema de base de datos: `schema.sql`