# DESIGN.md: Design Contract v2 de danicaju.github.io

Este documento es vinculante. Si una decisión de implementación lo contradice, se cambia el código o se actualiza este contrato con su motivo; nunca se ignora en silencio.

**v2 (cambio de dirección):** la v1 era "cuaderno editorial" (crema, serif, filetes negros, esquinas rectas). Se sentía rígida y anticuada. La v2 es **producto digital claro, luminoso y táctil**: lienzo neutro, superficies blancas elevadas con sombra mínima, radios sobrios, una sans moderna y un único acento azul tinta.

## 1. Propósito y audiencia
- **Qué es:** web de un único profesor de Matemáticas (ESO y Bachillerato) en Palma de Mallorca y online.
- **Quién la usa:** (a) padres y madres desde el móvil, con prisa; (b) estudiantes que quieren ver cómo se trabaja y cuánto cuesta.
- **Prueba de los 5 segundos:** en 390×844 y en 1280×800 / 1440×900, sin scroll, se ve *qué* (clases de Matemáticas ESO y Bachillerato), *dónde* (Palma y online), *cuánto* (desde 10 €/h por alumno) y *cómo contactar* (botón de WhatsApp con el número visible). En escritorio, el CTA y "Ver tarifas" terminan por encima de los 700 px de alto.
- **Una decisión por sección:** hero contactar o ver tarifas; tarifas elegir modalidad; estimador obtener la cuota y enviarla.

## 2. Dirección estética
Limpia, luminosa, precisa, humana y táctil. Referente de oficio: producto digital bien cuidado en tema claro. Jerarquía por tamaño, peso y superficie (blanco elevado sobre lienzo), no por filetes. Nunca plantilla SaaS genérica: sin degradados, sin glow, sin glass, sin orbes.

Diales: RHYTHM = 3 (cada sección con composición propia) · MOTION = 1 (solo estados y transiciones ≤ 180 ms, cero bucles) · liveliness = media, aportada por tipografía, superficie y tacto.

## 3. Tokens (todo en `:root`; ningún valor suelto fuera)

### Color (tema claro único; `color-scheme: light`)
| Token | Valor | Uso |
|---|---|---|
| `--color-canvas` | `#F8F8F6` | fondo de página |
| `--color-surface` | `#FFFFFF` | tarjetas, opciones, hojas de apuntes, diálogo |
| `--color-surface-2` | `#F1F1EE` | bandas hundidas (apuntes, estimador), hover de filas |
| `--color-ink` | `#0F172A` | texto principal (≈ 17:1 sobre canvas) |
| `--color-ink-2` | `#475569` | texto secundario (≈ 7:1) |
| `--color-ink-3` | `#5A677B` | metadatos (≥ 4,5:1 sobre canvas, blanco y surface-2) |
| `--color-border` | `rgb(15 23 42 / 0.08)` | borde suave de tarjetas y separadores |
| `--color-border-strong` | `rgb(15 23 42 / 0.16)` | borde de controles y de botones secundarios |
| `--color-accent` | `#1D4ED8` | **único acento**: CTA principal, estado activo/seleccionado y enlaces pulsados (blanco encima ≈ 6,7:1) |
| `--color-accent-hover` / `-pressed` | `#1E40AF` / `#1E3A8A` | hover (solo puntero) y `:active` |
| `--color-accent-bright` | `#2563EB` | el mismo acento sobre superficie oscura (blanco encima ≈ 5,2:1; ≥ 3:1 contra pizarra) |
| `--color-slate` | `#111827` | superficie "pizarra": resumen del estimador y cierre |
| `--color-on-slate` / `--color-on-slate-2` | `#F8FAFC` / `#CBD5E1` | texto sobre pizarra |
| `--color-on-accent` | `#FFFFFF` | texto sobre acento |
| `--color-focus` | `#1D4ED8` | anillo de foco 2 px, offset 3 px (sobre pizarra: `--color-on-slate`) |

Prohibido: degradados, glow, `backdrop-filter` (salvo las dos excepciones de §7), sombras de color, orbes, fondos con cuadrícula, violeta/índigo saturado, un segundo acento. Una sola familia oscura (pizarra), solo en estimador y cierre.

### Tipografía (autoalojada, subset latin, `font-display: swap`, precarga de la sans)
| Rol | Familia |
|---|---|
| Titulares y cuerpo | **Plus Jakarta Sans** (variable 200-800) |
| Cifras clave, tarifas, números de paso, metadatos | **IBM Plex Mono** 400/500, con `tabular-nums` |

Tracking según tamaño: H1 `-0.035em`, H2 `-0.03em`, H3 `-0.02em`, cuerpo `0`, pequeño `+0.005em`, mono `+0.02em`.

| Token | clamp() | line-height |
|---|---|---|
| `--step-display` (H1) | `clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem)` | 1.05 |
| `--step-3` (H2) | `clamp(1.75rem, 1.35rem + 1.5vw, 2.5rem)` | 1.1 |
| `--step-2` (H3, cifras) | `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)` | 1.2 |
| `--step-1` (lead) | `clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)` | 1.5 |
| `--step-0` (cuerpo) | `clamp(1rem, 0.96rem + 0.15vw, 1.0625rem)` | 1.6 |
| `--step--1` (notas) | `0.9375rem` | 1.5 |
| `--step-mono` | `0.875rem` | 1.4 |

Mínimo 14 px. Párrafos ≤ 68ch. Sin eyebrows en mayúsculas ni píldoras sobre titulares.

### Forma, elevación, espaciado
- Radios: `--radius-sm 8px` (botones, inputs, opciones) · `--radius-md 12px` (chips, miniaturas) · `--radius-lg 16px` (tarjetas, retrato, paneles, diálogo). Sin píldoras.
- Sombras (única forma de elevación, nunca de color): `--shadow-1` reposo `0 1px 2px rgb(15 23 42 / .05), 0 1px 1px rgb(15 23 42 / .03)`; `--shadow-2` elevado/hover `0 6px 20px rgb(15 23 42 / .08)`; `--shadow-sheet` hojas de apuntes y diálogo `0 10px 30px rgb(15 23 42 / .12)`. Se usan solo en tarjetas, opciones del estimador, retrato, hojas de apuntes, panel del menú, lightbox, header con scroll (sombra mínima) y WhatsApp flotante.
- Rejilla de 4 px: `--space-1 … --space-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Contenedor `72rem`, gutter `clamp(1rem, 4vw, 2.5rem)`.
- Ritmo vertical variable por sección (hero compacto, metodología y apuntes amplios).

## 4. Composición por sección (cada una distinta)
1. **Cabecera** sticky, fondo canvas con borde inferior suave: firma + enlaces + botón WhatsApp secundario; en móvil, menú desplegable.
2. **Hero** `1.25fr / .75fr`, columnas centradas verticalmente: línea de datos mono, H1, lead, CTA primario con el número debajo, "Ver tarifas". Retrato 4:5 con radio 16, `--shadow-2` y pie de foto.
3. **Ficha** (4 datos): fila de tarjetas blancas pequeñas bajo el hero.
4. **Metodología:** encabezado centrado y rejilla ligera de 3 columnas (número mono, título, texto, resultado) sin líneas verticales; una columna en móvil.
5. **Apuntes:** banda `surface-2`, dos hojas blancas grandes con `--shadow-sheet`, texto de apoyo al lado; clic abre un lightbox con anterior/siguiente, contador y ampliar/ajustar.
6. **Tarifas:** cuadrícula comparativa de 4 tarjetas (Individual: presencial, online · Dúo: presencial, online), precio grande en mono, línea de detalle y botón directo al estimador. Sin puntos guía, sin "Recomendado".
7. **Estimador:** opciones como tarjetas blancas elevadas (activo = acento); resumen en tarjeta pizarra con el mensaje autogenerado y el botón de WhatsApp en la misma unidad.
8. **Dudas:** columna centrada estrecha, una tarjeta blanca con separadores suaves.
9. **Cierre** pizarra en dos columnas (CTA y teléfono / información práctica real: zona, modalidades, enlaces, GitHub) y barra inferior alineada.

Sin botón flotante de WhatsApp. Sin testimonios, logos, cifras ni horarios inventados (no hay horarios en el repo).

## 5. Componentes y estados
Todo control interactivo: default · hover (solo `@media (hover: hover)`) · `:focus-visible` · `:active` · disabled · seleccionado (acento). Objetivos ≥ 44×44 px. Un único CTA primario por vista. `:active` entra en 70 ms (`--dur-press`) y sale en 160 ms (`--dur-ui`); botones, opciones y tarjetas pulsables `scale(.98)`. `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` y un `touchstart` pasivo para `:active` en iOS. Curva `cubic-bezier(.23, 1, .32, 1)`, sin rebote ni `ease-in`.

## 6. Iconografía
Sin emojis ni fuentes de iconos. SVG propios en sprite, trazo 1,5 px, `currentColor`: burbuja de chat, más, cerrar, chevrón, enlace externo, flechas anterior/siguiente.

## 7. Movimiento (sistema vanilla, mejora progresiva)

### Tokens
| Token | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | única curva (desaceleración natural); nunca `ease-in`, sin rebote |
| `--dur-press` | 70 ms | entrada de `:active` |
| `--dur-ui` | 160 ms | hover, color, menú, estados de controles |
| `--dur-enter` | 180 ms | lightbox, acordeón, giro del `+` |
| `--dur-number` | 220 ms | interpolación del importe mensual |
| `--dur-fab` | 240 ms | aparición del WhatsApp flotante |
| `--dur-reveal` | 480 ms | scroll reveal |
| `--reveal-shift` / `--stagger` | 16 px / 60 ms | desplazamiento inicial y retraso entre hermanos (tope 240 ms) |

### Reglas
- Se anima solo `opacity` y `transform`. **Excepciones explícitas:** (1) el acordeón anima `grid-template-rows` (0fr→1fr), solo por acción del usuario y durante 180 ms; (2) el header cambia fondo/sombra/blur al hacer scroll (pintura, sin layout); (3) el importe del estimador interpola texto, no estilos.
- **Mejora progresiva:** un script mínimo en `<head>` añade `js-motion` a `<html>` antes del primer render; todo estado "oculto" cuelga de `.js-motion` y de `prefers-reduced-motion: no-preference`. Sin JS (o si `main.js` no ejecuta en 4 s) no queda nada invisible. La FAQ y el estimador funcionan sin JS; `js-ready` activa los colapsos.
- **Reveal:** `IntersectionObserver` (`threshold .12`, `rootMargin 0 0 -48px 0`), cada bloque una sola vez (`unobserve`, `disconnect` al terminar). Hero y ficha de datos no se animan. Stagger solo entre hermanos (`data-reveal-group`).
- **Sin listeners de scroll:** header (centinela de 12 px), scrollspy (banda central del viewport), WhatsApp flotante y reveal usan observers. Un único registro de listeners por función, sin reinicializar.
- `will-change` solo mientras el elemento está oculto a la espera de su reveal.
- **`prefers-reduced-motion: reduce`:** contenido visible al instante; sin desplazamientos, staggers, escalas ni giros; el número cambia sin interpolar y no hay pulso; el scroll es instantáneo; solo quedan cambios de color/opacidad ≤ 120 ms. También `prefers-contrast`, `prefers-reduced-transparency` (header y fondo del lightbox opacos) y `forced-colors`.
- **`backdrop-filter`:** permitido únicamente en el header con scroll (`blur(12px)`, fondo translúcido) y en el fondo del lightbox (`blur(6px)`); con `@supports not` el fondo pasa a casi opaco. Prohibido en cualquier otro sitio.
- **Header:** con `scrollY > 12` se vuelve translúcido y gana borde/sombra muy sutil; el enlace de la sección visible lleva `aria-current="true"` y subrayado de 2 px en acento. `scroll-margin-top` en cada `section[id]` evita que el header tape los títulos (no se usa `scroll-padding`, para no sumar dos offsets).
- **Estimador:** al cambiar nivel/modalidad/días el total interpola 220 ms (`tabular-nums`, sin cambio de layout) y el mensaje hace un pulso de opacidad (WAAPI, 260 ms); "Copiar mensaje" confirma con "Copiado" 1,6 s y región `aria-live`.
- **Acordeón de FAQ:** `button` con `aria-expanded` y `aria-controls`, panel `role="region"` con `aria-labelledby`, `inert` + `visibility` cuando está cerrado; flechas, Inicio y Fin mueven el foco entre preguntas.
- **Lightbox:** fade + `scale(.98→1)`, fondo desenfocado, caption descriptivo, cierre ≥ 44 px, `Escape`/clic fuera/botón, scroll de fondo bloqueado sin salto (`scrollbar-gutter: stable`), foco devuelto.
- **WhatsApp flotante (< 768 px):** aparece cuando el CTA del hero sale por arriba y se oculta mientras estén visibles el CTA del estimador, el de cierre o el footer (un solo CTA primario por vista). `env(safe-area-inset-bottom)`.
- **Menú móvil:** fade + 4 px desde su origen; se cierra con `Escape`, clic en enlace, clic fuera y al tabular fuera.
- Nota sobre `apple-design`: no se adoptan materiales translúcidos generalizados ni resortes/gestos (no hay arrastre).

## 8. Restricciones técnicas (GitHub Pages)
Sitio 100 % estático: `index.html`, `css/main.css`, `js/main.js`, `assets/`, `DESIGN.md`. Sin frameworks ni CDNs de código. CSS en `@layer tokens, base, layout, components`. HTML semántico. JS ≤ 20 KB (≤ 6 KB gzip), progresivo (sin JS: enlaces de contacto, tarifas y FAQ funcionan y el estimador muestra su cálculo por defecto). Presupuesto: HTML ≤ 40 KB, CSS ≤ 40 KB (≤ 8 KB gzip), fuentes ≤ 150 KB, retrato ≤ 60 KB, cada apunte ≤ 80 KB. WCAG 2.2 AA, `lang="es"`.

## 9. Contenido
Se conserva el texto real (tarifas, metodología, FAQ, credenciales, textos de WhatsApp, apuntes). Se puede recomponer y recortar redundancias; no se añade experiencia, resultados, testimonios ni estadísticas. Dos textos prellenados de WhatsApp literales (cabecera/hero y contacto). El único canal es WhatsApp (más GitHub).

## 10. Checklist de prohibiciones
Degradados · glow · glass/blur · orbes · cuadrícula de fondo · sombras de color o fuera de la lista · bordes negros duros · puntos guía en precios · píldoras y badges decorativos · eyebrows en mayúsculas · puntos con pulso · "Recomendado" · emojis · fuentes de iconos · parallax/tilt · reveal en el hero · `@keyframes` · listeners de scroll · animar propiedades de layout (salvo las excepciones de §7) · botón flotante duplicado · dos controles con el mismo destino en una vista · `backdrop-filter` fuera del header con scroll y el lightbox · `:hover` sin `(hover: hover)` · controles sin `:active` · texto < 14 px · acento fuera de CTA/activo/pulsado · más de un CTA primario por vista · datos sin fuente en el repo.
