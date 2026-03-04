# Recall — Lessons

Patterns learned during this project. Applied to all future projects.

---

## 1. Atmospheric CSS effects are not the same as atmosphere

**Mistake:** Built layered radial gradients, animated glow, noise SVG filter, and vignette overlay to create environmental warmth. Looked synthetic.

**Correct approach:** Real photography does more in one image than 200 lines of CSS gradients. Start with photography. Use CSS as overlay control, not as the atmosphere itself.

**Rule:** When the brief says "make this feel like a real place" — ask for a photo before writing any CSS atmosphere.

---

## 2. Two-direction background transitions require two DOM layers

**Mistake:** Tried to transition `background-image` between two gradient stacks directly in CSS. CSS cannot interpolate between different `background-image` values — the transition fires but the visual change is instant.

**Correct approach:** Use two separate `div.bg-layer` elements (one per image), both `position: fixed; opacity: 0`. Activate the correct layer by setting `opacity: 1`. Crossfade is smooth because `opacity` transitions correctly.

**Rule:** Never try to `transition: background-image`. Two layers, transition `opacity`.

---

## 3. Sidebar `backdrop-filter` bleeds the background image through

**Mistake:** Applied `backdrop-filter: blur()` to the sidebar alongside the image layers. The sidebar blurred the photography visible through it, defeating its purpose as a solid navigation anchor.

**Correct approach:** Sidebar gets a fully solid (or near-opaque rgba) `background`. No `backdrop-filter` on sidebars. Reserve `backdrop-filter` for floating elements that intentionally sit on top of content (cards, modals, tooltips).

**Rule:** Sidebar = solid background. Cards/modals = backdrop-filter. Never both on the same element type.

---

## 4. Low overlay opacity kills legibility on photography

**Mistake:** Started with overlay at 0.30 (Morning) and 0.45 (Evening). Text on photography at those values is borderline unreadable in any ambient light condition.

**Correct approach:** 0.60 minimum for overlay opacity on photography-backed UI. Cards then sit on top of the overlay and use their own `backdrop-filter` + high background opacity (0.85+) for additional control.

**Rule:** Overlay ≥ 0.60 on photography. Card background opacity ≥ 0.85. Test in a bright room, not just at your desk.

---

## 5. `var(--text-tertiary)` is too low-contrast for section labels

**Mistake:** Used `--text-tertiary` (a muted token) for timeline section divider labels ("Today", "Yesterday"). Against a photographic background — even with overlay — these were invisible.

**Correct approach:** Section labels are wayfinding elements. They need solid, high-contrast colour regardless of what's behind them. Use explicit hardcoded rgba values per mood, not semantic tokens that can resolve too lightly.

**Rule:** Wayfinding text (labels, breadcrumbs, section headers) always gets explicit high-contrast colour. Never a tertiary token.

---

## 6. Remove cleanly — don't hide

**Mistake:** Used `hidden` HTML attribute to suppress Garden mode rather than removing it. Left dead CSS blocks (`.mood-garden` tokens, sidebar, cards, botanical) throughout the file.

**Correct approach:** When a feature is cut, delete all its code — tokens, CSS blocks, HTML elements, JS references. Dead code is a maintenance liability and a source of confusion.

**Rule:** Hidden ≠ removed. If it is cut from the product, cut it from the codebase.

---

## 7. Z-index stack must be designed before the first element is positioned

**Mistake:** Added z-index values reactively as stacking conflicts appeared.

**Correct approach:** Define the full z-index stack at the top of the CSS before writing any positioned elements:

```
bg-layers:     0
bg-overlay:    1
watermark:     5
app shell:    10
voice button: 200
modals:       300
```

**Rule:** Write the z-index stack as a comment block at the top of the CSS. Never assign z-index without referencing it.
