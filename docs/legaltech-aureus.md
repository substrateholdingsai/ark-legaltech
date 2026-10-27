# 📄 legaltech-aureus.md

- **Versión:** 0.1.0
- **Instancia:** AUREUS
- **Cliente / Tenant:** Despachos legal-tech / RegTech jurídico agéntico
- **Tipo de Huésped:** `service`
- **Sistema:** Legal Tech Romano
- **Fecha:** 2026-10-27
- **Arquitectura objetivo:** Cloudflare Workers multi-tenant + frontend React/Vite o Astro/PWA
- **Filosofía:** autoridad mineral, precisión jurídica, confianza acuñada

> **AUREUS no decora el derecho: lo acuña.**  
> Cada color es estado. Cada arco es validación. Cada sello es responsabilidad.  
> La IA agéntica no sustituye al abogado: traza la vía, ordena la tabula y prepara el sello.

---

## 1 · Tokens de color

AUREUS usa un sistema **dual**:

- **Nox Basalt** — modo oscuro institucional para consola agéntica, expedientes, auditoría, firma, sellado y operaciones.
- **Marmora / Pergamino** — modo claro patrimonial para storefront público, propuestas, contacto, WhatsApp y documentos de cara al cliente.

Regla ornamental: **Regla del 8% ornamental**.  
El bronce/oro, el púrpura porfídico y las texturas nunca superan ~8% de la superficie efectiva. El resto es piedra, pergamino, tinta y orden.

### 1.1 · Modo oscuro — `Nox Basalt`

| Token | HEX | HSL aprox. | Tailwind sugerido | Rol semántico | Contraste verificado |
|---|---:|---|---|---|---|
| `bg-primary` | `#100F0D` | `hsl(40 2% 6%)` | `bg-aureus-nox-bg` | Fondo maestro, consola oscura | — |
| `bg-canvas` | `#171512` | `hsl(36 12% 8%)` | `bg-aureus-nox-canvas` | Lienzo de dashboard | — |
| `bg-surface` | `#211E1A` | `hsl(34 12% 12%)` | `bg-aureus-nox-surface` | Tarjetas, paneles, tablas | — |
| `border-line` | `#3B342B` | `hsl(34 16% 20%)` | `border-aureus-nox-border` | Hairlines, separadores, marcos | Decorativo, no texto |
| `text-primary` | `#F3ECDF` | `hsl(39 46% 91%)` | `text-aureus-pergamino` | Texto principal, titulares | `16.3:1` vs `bg-primary` — AAA |
| `text-secondary` | `#B8AE9E` | `hsl(37 16% 67%)` | `text-aureus-text-secondary` | Texto de apoyo, labels | `8.8:1` vs `bg-primary` — AAA |
| `text-muted` | `#9A9185` | `hsl(34 9% 56%)` | `text-aureus-text-muted` | Metadatos, folios, timestamps | `6.2:1` vs `bg-primary` — AA |
| `accent-500` | `#C9A664` | `hsl(39 48% 59%)` | `bg-aureus-brass-500` | Acción primaria, bronce institucional | `8.3:1` vs `bg-primary` — AAA |
| `accent-400` | `#DCBD85` | `hsl(39 55% 69%)` | `bg-aureus-brass-400` | Hover, focus, énfasis luminoso | `10.6:1` vs `bg-primary` — AAA |
| `accent-foreground` | `#14110D` | `hsl(40 20% 7%)` | `text-aureus-accent-fg` | Texto sobre botón dorado/bronce | `8.2:1` vs `accent-500` — AAA |
| `seal-porphyry` | `#8B4A5A` | `hsl(345 31% 42%)` | `bg-aureus-seal` | Sello, autoridad, cierre, jurisdicción | `5.5:1` con `text-primary` — AA |
| `risk-terracotta` | `#CC766C` | `hsl(6 49% 61%)` | `bg-aureus-terra` | Riesgo, vencimiento, excepción | `5.8:1` vs `bg-primary` — AA |
| `pending-bronze` | `#C98A3D` | `hsl(33 56% 51%)` | `bg-aureus-bronze` | En curso, agente procesando, pendiente | `6.6:1` vs `bg-primary` — AA |
| `approved-olive` | `#7E9A6E` | `hsl(98 18% 52%)` | `bg-aureus-olive` | Conforme, validado, aprobado | `6.1:1` vs `bg-primary` — AA |
| `agent-steel` | `#6E8FA3` | `hsl(203 22% 54%)` | `bg-aureus-steel` | Automatización, trazas, eventos de agente | `5.6:1` vs `bg-primary` — AA |

#### Regla WCAG explícita — modo oscuro

- Sobre `accent-500` y `accent-400`: **texto oscuro**, nunca blanco.
  - Correcto: `#14110D` sobre `#C9A664`.
  - Incorrecto: `#FFFFFF` sobre `#C9A664`.
- Sobre `seal-porphyry`: **texto claro pergamino**, no negro.
  - Correcto: `#F3ECDF` sobre `#8B4A5A`.
  - Incorrecto: `#100F0D` sobre `#8B4A5A`.
- El bronce/oro no es decoración libre: se reserva para acción primaria, firma, sello, foco y estados de confianza.
- El púrpura porfídico es autoridad/cierre/jurisdicción. Cuando aparece, debe sentirse definitivo.

---

### 1.2 · Modo claro — `Marmora / Pergamino`

| Token | HEX | HSL aprox. | Tailwind sugerido | Rol semántico | Contraste verificado |
|---|---:|---|---|---|---|
| `bg-primary` | `#F8F3E9` | `hsl(40 52% 94%)` | `bg-aureus-marmora-bg` | Fondo pergamino claro | — |
| `bg-canvas` | `#F1E9DB` | `hsl(41 45% 90%)` | `bg-aureus-marmora-canvas` | Lienzo suave, secciones alternas | — |
| `bg-surface` | `#FFFDF8` | `hsl(48 100% 99%)` | `bg-aureus-marmora-surface` | Tarjetas, formularios, documentos | — |
| `border-line` | `#D8CBB6` | `hsl(39 27% 78%)` | `border-aureus-marmora-border` | Bordes, reglas, tablas | Decorativo |
| `text-primary` | `#15120F` | `hsl(36 16% 7%)` | `text-aureus-ink` | Texto principal | `17.0:1` vs `bg-primary` — AAA |
| `text-secondary` | `#4E463C` | `hsl(33 13% 27%)` | `text-aureus-text-secondary-light` | Texto de apoyo | `8.4:1` vs `bg-primary` — AAA |
| `text-muted` | `#6B6156` | `hsl(33 10% 38%)` | `text-aureus-text-muted-light` | Metadatos, notas legales | `5.6:1` vs `bg-primary` — AA |
| `accent-500` | `#6F4F22` | `hsl(35 53% 28%)` | `bg-aureus-bronze-dark` | Bronce oscuro institucional | `6.7:1` vs `bg-primary` — AA |
| `accent-400` | `#825F2A` | `hsl(36 51% 34%)` | `bg-aureus-bronze-mid` | Hover/enfasis controlado | `5.2:1` vs `bg-primary` — AA |
| `accent-foreground` | `#FFFDF8` | `hsl(48 100% 99%)` | `text-aureus-accent-fg-light` | Texto sobre bronce oscuro | `7.3:1` vs `accent-500` — AAA |
| `risk-terracotta` | `#A84B42` | `hsl(5 52% 46%)` | `bg-aureus-terra-dark` | Riesgo/incumplimiento | `5.1:1` vs `bg-primary` — AA |
| `approved-olive` | `#3F6B45` | `hsl(126 24% 33%)` | `bg-aureus-olive-dark` | Conforme/aprobado | `5.6:1` vs `bg-primary` — AA |
| `pending-bronze` | `#8A5A1C` | `hsl(33 62% 33%)` | `bg-aureus-bronze-pending` | Pendiente/proceso | `5.3:1` vs `bg-primary` — AA |
| `agent-steel` | `#2F5D7C` | `hsl(205 45% 34%)` | `bg-aureus-steel-dark` | Agente/automatización | `6.4:1` vs `bg-primary` — AA |

#### Regla WCAG explícita — modo claro

- En claro, el acento ya no es oro brillante: es **bronce oscuro**.
- Sobre `accent-500` claro: **texto blanco/hueso** sí funciona.
- Nunca uses `#C9A664` como texto sobre fondo claro: falla contraste.
- El pergamino no debe ser amarillo saturado. Debe sentirse papel mineral, no papel de regalo.

---

### 1.3 · Semántica cromática operativa

| Color | Significado operativo | Ejemplo de uso |
|---|---|---|
| `accent-500` bronce/oro | Confianza, acción principal, firma, validar, sellar | “Firmar minuta”, “Sellar expediente”, “Enviar propuesta” |
| `seal-porphyry` púrpura porfídico | Autoridad humana, cierre, jurisdicción, caso firmado/no modificable | Badge “Sellado”, “Resolución”, “Autoridad asignada” |
| `approved-olive` olivo | Conforme, validado, sin excepciones | “Documento válido”, “PLD conforme”, “Datos verificados” |
| `pending-bronze` bronce ámbar | En proceso, agente trabajando, espera humana | “Agente revisando”, “Pendiente de firma”, “En cola” |
| `risk-terracotta` terracota | Riesgo, vencimiento, inconsistencia, escalación | “Plazo crítico”, “Dato conflictivo”, “Requiere abogado” |
| `agent-steel` acero azul | Automatización, traza, evento de sistema, integridad técnica | “Ejecutado por agente”, “Hash verificado”, “Log inmutable” |

---

### 1.4 · Tailwind config sugerido

```js
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        aureus: {
          nox: {
            bg: "#100F0D",
            canvas: "#171512",
            surface: "#211E1A",
            border: "#3B342B",
          },
          marmora: {
            bg: "#F8F3E9",
            canvas: "#F1E9DB",
            surface: "#FFFDF8",
            border: "#D8CBB6",
          },
          pergamino: "#F3ECDF",
          ink: "#15120F",
          brass: {
            500: "#C9A664",
            400: "#DCBD85",
          },
          bronze: {
            dark: "#6F4F22",
            mid: "#825F2A",
            pending: "#8A5A1C",
          },
          seal: "#8B4A5A",
          terra: {
            DEFAULT: "#CC766C",
            dark: "#A84B42",
          },
          olive: {
            DEFAULT: "#7E9A6E",
            dark: "#3F6B45",
          },
          steel: {
            DEFAULT: "#6E8FA3",
            dark: "#2F5D7C",
          },
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"EB Garamond"', "Georgia", "serif"],
        body: ["Inter", "Helvetica", "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
    },
  },
};
```

---

## 2 · Tríada tipográfica

| Rol | Fuente | Weight | Uso | Regla |
|---|---|---:|---|---|
| Display | `Cormorant Garamond` o `EB Garamond` | 500–600 | Titulares, marca, sellos, portadas de propuesta | Elegancia inscriptional, nunca párrafos largos |
| Cuerpo / UI | `Inter` | 400–600 | Dashboard, formularios, lectura operativa | Neutralidad, legibilidad, densidad controlada |
| Mono | `JetBrains Mono` o `IBM Plex Mono` | 400–500 | Folios, montos, CLABE, RFC, hashes, fechas, evidencias | **Obligatoria con `tabular-nums`** |

### Jerarquía recomendada

- H1 display: `Cormorant Garamond`, 500/600, `letter-spacing: -0.015em`.
- Body: `Inter`, 400/500.
- Labels: `Inter`, 500, uppercase ligero, `letter-spacing: 0.08em`.
- Datos críticos: `JetBrains Mono`, 400/500, `font-variant-numeric: tabular-nums`.

### CSS tipográfico base

```css
:root {
  --aureus-font-display: "Cormorant Garamond", "EB Garamond", Georgia, serif;
  --aureus-font-body: Inter, Helvetica, Arial, sans-serif;
  --aureus-font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

.aureus-display {
  font-family: var(--aureus-font-display);
  font-weight: 600;
  letter-spacing: -0.015em;
}

.aureus-body {
  font-family: var(--aureus-font-body);
  font-weight: 400;
}

.aureus-label {
  font-family: var(--aureus-font-body);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.aureus-mono {
  font-family: var(--aureus-font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
```

---

## 3 · Metáfora de operación legal-tech agéntica

AUREUS no habla de “chatbot” ni “asistente mágico”. Habla de **trazabilidad jurídica**.

### Vocabulario del tenant

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

### Flujo operativo sugerido

1. **Ingesta documental** — la tabula recibe hechos, contratos, facturas, correos, evidencias.
2. **Validación de vía** — el agente recorre la ruta: datos, plazos, jurisdicción, riesgos.
3. **Keystone humano** — el abogado valida el punto crítico. No se automatiza la autoridad final.
4. **Sellado** — documento firmado, hash registrado, estado bloqueado.
5. **Archivo auditable** — expediente cerrado, trazable, exportable.

### Metáforas romanas permitidas, sin cliché

- **Arco de medio punto** = validación estructural.
- **Keystone** = decisión humana indispensable.
- **Vía** = pipeline agéntico.
- **Acueducto abstracto** = flujo confiable de datos.
- **Tabula cerata** = documento vivo, enmendable hasta sellado.
- **Sello** = estado jurídico final.
- **Tessera** = patrón de auditoría y trazabilidad.

No usar: templos literales, águilas, togas, gladiadores, dioses, laureles excesivos, balanzas de justicia cliché, martillos de juez, escudos heráldicos falsos.

---

## 4 · Capa artística

### Manifiesto

> **AUREUS es derecho con peso material.**  
> No promete inteligencia infinita; ofrece certeza operativa.  
> Su belleza no está en el adorno, está en la proporción, la traza y la firma.  
> Un despacho serio no necesita gritar. Necesita acuñar confianza.

### Ética cultural

AUREUS referencia la Roma **institucional e ingenieril**, no la Roma turística ni mitológica.

Se permite:

- geometría de arco, vía, sello, tessera, tabula;
- proporción sobria;
- textura mineral sutil;
- bronce, púrpura porfídico, pergamino, basalto;
- jerarquía clara, adulto, calmado.

Se evita:

- iconografía sagrada literal;
- cliché arqueológico;
- “imperio” como fantasía de poder;
- ornamento que compita con la lectura jurídica;
- glassmorphism, neón, gradientes chillantes, burbujas startup.

### Anatomía de componentes

```css
:root {
  --aureus-bg-primary: #100F0D;
  --aureus-bg-canvas: #171512;
  --aureus-bg-surface: #211E1A;
  --aureus-border-line: #3B342B;

  --aureus-text-primary: #F3ECDF;
  --aureus-text-secondary: #B8AE9E;
  --aureus-text-muted: #9A9185;

  --aureus-accent-500: #C9A664;
  --aureus-accent-400: #DCBD85;
  --aureus-accent-foreground: #14110D;

  --aureus-seal: #8B4A5A;
  --aureus-risk: #CC766C;
  --aureus-pending: #C98A3D;
  --aureus-approved: #7E9A6E;
  --aureus-agent: #6E8FA3;

  --aureus-radius: 14px;
  --aureus-hairline: 1px;
}

.aureus-card {
  background: var(--aureus-bg-surface);
  border: var(--aureus-hairline) solid var(--aureus-border-line);
  border-radius: var(--aureus-radius);
  box-shadow: inset 0 1px 0 rgba(243, 236, 223, 0.035);
}

.aureus-btn-primary {
  background: var(--aureus-accent-500);
  color: var(--aureus-accent-foreground);
  border: 1px solid rgba(220, 189, 133, 0.55);
  border-radius: 12px;
  font-family: var(--aureus-font-body);
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.75rem 1.25rem;
  transition: background 160ms ease, transform 120ms ease;
}

.aureus-btn-primary:hover {
  background: var(--aureus-accent-400);
}

.aureus-btn-primary:focus-visible {
  outline: 2px solid var(--aureus-accent-400);
  outline-offset: 3px;
}

.aureus-badge-seal {
  background: var(--aureus-seal);
  color: var(--aureus-text-primary);
  border: 1px solid rgba(220, 189, 133, 0.45);
  border-radius: 999px;
  font-family: var(--aureus-font-mono);
  font-size: 0.75rem;
  padding: 0.25rem 0.65rem;
}

.aureus-badge-risk {
  background: rgba(204, 118, 108, 0.16);
  color: var(--aureus-risk);
  border: 1px solid rgba(204, 118, 108, 0.35);
}

.aureus-badge-approved {
  background: rgba(126, 154, 110, 0.14);
  color: var(--aureus-approved);
  border: 1px solid rgba(126, 154, 110, 0.32);
}

.aureus-data {
  font-family: var(--aureus-font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--aureus-text-secondary);
}

.aureus-arch-divider {
  block-size: 48px;
  inline-size: 100%;
  background-image: url("/assets/aureus/arch-divider.svg");
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.75;
}
```

### Voz de marca

- Templada.
- Precisa.
- Institucional.
- Sin hype.
- Sin promesas mágicas.
- Habla como un socio senior, no como un startup influencer.

Frases modelo:

- “Expediente validado. Pendiente de sello humano.”
- “El agente completó la vía. Requiere keystone jurídico.”
- “Minuta sellada. Hash registrado en códice probatorio.”
- “Riesgo detectado en plazo de cortesía. Escalación recomendada.”

### Do / Don’t

| Do | Don’t |
|---|---|
| Usar bronce solo para acción/confianza/firma | Usar dorado degradado tipo banco genérico |
| Usar púrpura porfídico para sello/cierre | Usar púrpura como “premium” decorativo |
| Mantener textura al 2–6% | Ensuciar la UI con pergamino fake |
| Usar mono tabular para datos críticos | Alinear montos/folios con proporcional |
| Redondear con criterio: 12–16px | Usar bubbles de 24px+ en dashboard |
| Mostrar estado con color semántico | Decorar badges sin significado |
| Referenciar arco/vía/sello abstracto | Poner templos, togas, águilas o dioses |
| Priorizar legibilidad jurídica | Sacrificar contraste por estética oscura |

### Inventario de assets AUREUS

#### Técnico mínimo

- `favicon.svg`
- `logo-lockup.svg`
- `pattern-tessera.svg`
- `manifest.json`

#### Kit artístico vectorial

- `texture-basalt.svg`
- `texture-parchment.svg`
- `monogram-aureus.svg`
- `seal-state.svg`
- `arch-divider.svg`
- `keystone-node.svg`
- `via-progress.svg`
- `arc-mask.svg`
- `og-image.svg`
- `sprite-gremial.svg`

#### Sprite gremial

- `codex`
- `sigillum`
- `arcus`
- `tabula`
- `via`
- `contractus`
- `scutum`
- `horologium`

#### Capa raster SEO/PWA

- `og-image.png`
- `twitter-card.png`
- `apple-touch-icon.png`
- `favicon-32.png`
- `favicon-16.png`
- `android-chrome-192.png`
- `android-chrome-512.png`
- `favicon.ico`
- `site.webmanifest`
- `robots.txt`
- `meta-tags.html`
- Modo dinámico: `alert-card.png`
