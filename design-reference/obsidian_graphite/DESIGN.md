# Design System Strategy: The Technical Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Technical Curator."** 

Unlike standard B2B SaaS platforms that rely on rigid grids and aggressive borders to organize data, this system treats information as high-end editorial content. We move beyond the "dashboard" look toward an interface that feels like a precision instrument—minimalist, authoritative, and deeply intentional. 

The aesthetic is driven by **Tonal Depth** and **Asymmetric Breathing Room**. By utilizing dense, high-information clusters (for developer productivity) surrounded by generous atmospheric spacing, we create a rhythmic visual pace. We break the "template" feel by overlapping layers and using "ghost" containers that suggest structure without the visual clutter of physical lines.

---

## 2. Colors & Surface Logic

### The Palette
The color economy is strictly enforced. We use deep charcoals for the foundation and high-chroma accents for cognitive signaling.

*   **Primary (`#adc6ff`):** Used for primary actions and system-level focus.
*   **Secondary/Rose (`#ffb0cd`):** Reserved for "Message B" logic or secondary status indicators.
*   **Surface Foundation (`#131314`):** The base layer of the entire application.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined through **Background Shifts**.
*   Instead of a border, use `surface_container_low` against a `surface` background.
*   The transition between global navigation and the main workspace should be a tonal shift, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers. 
1.  **Level 0 (Base):** `surface` (#131314) – The global background.
2.  **Level 1 (Sections):** `surface_container_low` (#1c1b1c) – Sidebars or utility panels.
3.  **Level 2 (Objects):** `surface_container` (#201f20) – Main content cards or focused work areas.
4.  **Level 3 (Pop-overs):** `surface_container_highest` (#353436) – Modals and tooltips.

### The "Glass & Gradient" Rule
To achieve a "Vercel-tier" premium finish, floating elements (modals, dropdowns) must use **Glassmorphism**. Apply `surface_container_highest` at 80% opacity with a `20px` backdrop blur. 
*   **Signature Texture:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` to `primary_container` at a 145-degree angle to give buttons a slight "convex" feel.

---

## 3. Typography
The typography is a dialogue between the humanist precision of **Inter** and the technical heritage of **Berkeley Mono**.

*   **Inter (90% usage):** Our primary voice. Use `Inter Variable` to fine-tune weights. For `display-lg` through `headline-sm`, use a tighter tracking (-0.02em) to create an editorial "locked-in" feel.
*   **Berkeley Mono (10% usage):** Used for `label-sm` data points, IDs, keyboard shortcuts, and code snippets. This provides the "Developer-Centric" soul of the system.
*   **The Hierarchy:** Use extreme scale contrast. A `display-md` title paired with a `label-md` mono-type caption creates a sophisticated, technical hierarchy that signals both "Big Picture" and "Granular Detail."

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by stacking tonal tiers. To lift a card, do not use a border; place a `surface_container_lowest` (#0e0e0f) card inside a `surface_container` (#201f20) parent. This "sunken" or "raised" effect feels more integrated into the hardware of the screen.

### Ambient Shadows
When an element must float (e.g., a Command Menu), use a double-layered shadow:
1.  **Layer 1:** 0px 4px 20px rgba(0,0,0,0.5)
2.  **Layer 2:** 0px 0px 1px `outline_variant` at 20% opacity.
The shadow should feel like a soft glow of darkness, never a harsh smudge.

### The "Ghost Border" Fallback
If accessibility requirements demand a container border, use the **Ghost Border**: `outline_variant` (#424754) at 15% opacity. It should be just barely visible—enough to catch the eye's edge-detection without being "read" as a line.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). Radius: `md` (0.375rem). Text: `label-md` Bold.
*   **Tertiary/Ghost:** No background. On hover, transition to `surface_container_high`. Use for low-priority actions in dense layouts.

### Input Fields
*   **Base State:** Background: `surface_container_low`. Border: `none`.
*   **Focus State:** A subtle 1px "Ghost Border" using `surface_tint`.
*   **Density:** For B2B SaaS forms, use `spacing-3` for vertical padding. Keep labels `label-sm` and use Berkeley Mono for placeholder text to emphasize the technical nature.

### Cards & Lists
*   **Strict Rule:** No dividers. Use `spacing-8` of vertical white space to separate list groups, or alternating background shifts (`surface` to `surface_container_low`) for row-level separation.
*   **Interaction:** On hover, a card should shift from `surface_container` to `surface_container_high`.

### Chips
*   **Technical Chips:** Use `surface_container_highest` with Berkeley Mono text. Use these for metadata, tags, and status.

---

## 6. Do’s and Don'ts

### Do
*   **Do** embrace negative space. If a layout feels "crowded," increase the padding to `spacing-12` rather than adding a border.
*   **Do** use `on_surface_variant` (#c2c6d6) for secondary text to maintain a soft, high-end contrast ratio that reduces eye strain.
*   **Do** align all mono-type elements to a strict baseline grid to reinforce the "instrument" feel.

### Don't
*   **Don't** use pure black (#000000) or pure white (#FFFFFF). Use our defined surface and "on-surface" tokens to keep the atmosphere sophisticated.
*   **Don't** use standard "Drop Shadows" from component libraries. Always use the Tonal Layering or Ambient Shadow rules.
*   **Don't** use rounded-full corners for buttons unless it's a floating action button. Stick to `md` (0.375rem) to maintain a professional, architectural edge.