---
name: Senior Front-End Developer
description: >
  Professional-grade methodology for building high-conversion, brutalist/editorial user interfaces 
  and components (specifically Modals and CTAs) that align with the Aisthetic Design Co. philosophy. 
  Use this skill when designing or coding user flows, purchase funnels, modals, pop-ups, or 
  call-to-action buttons where standard SaaS aesthetics are unacceptable.
version: 1.0.0
compatible: [Claude, Antigravity]
category: Design & Engineering
source: [project-local]
tags:
  [
    frontend,
    react,
    css,
    brutalism,
    editorial-design,
    conversion-optimization,
    cta,
    modal,
    pop-up,
    glassmorphism,
    typography,
    aisthetic,
  ]
install: Aisthetic Design Co. — Proprietary Workflow
author: Aisthetic Design Co.
---

# Senior Front-End Developer

This skill encodes the UI/UX methodology of a senior front-end developer and conversion designer building high-end, editorial digital experiences. It rejects standard "SaaS" or "Bootstrap" aesthetics in favor of Brutalist, magazine-like layouts.

---

## Core Concepts — How It Works

Standard web design relies on rounded buttons, drop shadows, and bouncy animations to draw attention. The Aisthetic philosophy relies on extreme contrast, intentional negative space, raw geometry, and cinematic pacing.

### The Four Pillars of Aisthetic UI

**Pillar 1 — Brutalist Geometry over Decoration**
- Reject `border-radius: 9999px` (pill shapes) for primary actions. Use sharp `0px` or very tight `2px-4px` radii.
- Reject soft CSS `box-shadow` for elevation. Use stark, high-contrast borders or deep, sharp shadows (e.g., `4px 4px 0px black`).
- Use raw lines (1px solid borders) to separate content, not differing background colors.

**Pillar 2 — Editorial Typography Hierarchy**
- Use extreme scale contrast. A massive Serif headline (`52px+`, e.g., Ogg or Playfair) paired with microscopic, highly-tracked Monospace meta-text (`9px`, `letter-spacing: 0.15em`).
- Typography replaces UI. Instead of an icon of an "X" to close a modal, use the word `[ CLOSE ]` in monospace.

**Pillar 3 — The "Anti-Pop-up" Modal Protocol**
Pop-ups fail when they feel like interruptions. They succeed when they feel like an exclusive environment.
- **The Backdrop:** Never use a flat `rgba(0,0,0,0.5)`. Use deep glassmorphism: `backdrop-filter: blur(40px) saturate(150%)`. The background should become a creamy cinematic blur.
- **The Entrance:** Never "bounce" or "spring". Modals should fade in with a slow, heavy easing curve (e.g., `cubic-bezier(0.22, 1, 0.36, 1)`) and scale imperceptibly from `98%` to `100%`.
- **The Layout:** Prefer cinematic split-screens. 50/50 or 40/60 splits where one half is a massive, edge-to-edge high-res editorial image (generated via the Retoucher skill), and the other half is stark typography on a matte background.

**Pillar 4 — High-Conversion Call-to-Buy (CTA) Protocol**
- The purchase button is not a "button"; it is an action block. 
- Use high-contrast monochrome (pure black on pure white, or vice versa).
- **Hover States:** Do not "lighten" or "darken". Use stark inversion (background becomes text color, text becomes background color) or translate sharply (`transform: translate(-2px, -2px)` with a hard shadow left behind).
- **Messaging:** Never use "Submit" or "Click Here". Use authoritative, architectural language: `ACQUIRE ACCESS`, `INITIATE GENERATION`, `UNLOCK RECIPE`.

---

## Usage Examples

```
"Act as a senior front-end developer and design a 'Call to Buy' modal for our new product using the Aisthetic guidelines."

"Review this CSS for our purchase button. Fix it to align with the Brutalist Geometry pillar."

"Generate the React/JSX for a split-screen modal overlay. Follow the Anti-Pop-up protocol."
```

---

## Technical Implementation Guides

### The Brutalist Button CSS
```css
.btn-brutalist {
  background: var(--text);
  color: var(--bg);
  border: 1px solid var(--text);
  padding: 16px 32px;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border-radius: 0; /* Sharp corners */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-brutalist:hover {
  background: transparent;
  color: var(--text);
}
```

### The Cinematic Modal Container CSS
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 12, 0.4);
  backdrop-filter: blur(40px) saturate(150%); /* The creamy blur */
  display: grid;
  place-items: center;
  z-index: 1000;
  animation: cinematicFade 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes cinematicFade {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
```

---

*Initial Release — v1.0*
*Aisthetic Design Co. — Architectural Philosophy meets Everyday Aspiration.*
*© 2026 Aisthetic Design Co. All Rights Reserved.*
