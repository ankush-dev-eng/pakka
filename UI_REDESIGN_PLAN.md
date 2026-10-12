# UI Redesign Plan

## Routes Found
- `/` (Landing Page)
- `/about`
- `/community`
- `/result/[id]`

## Shared UI Components
- `GlassTile.tsx`
- `GridBackground.tsx`
- `Header.tsx`
- `HighlightedText.tsx`
- `InputCard.tsx`
- `LangSwitch.tsx`
- `SectionBand.tsx`

## Per-page Inventory of Current Visual Shortcomings
- **Global**: Utilitarian look, lacks depth, gradients are basic, typography hierarchy is somewhat flat.
- **Landing Page (`/`)**: Hero section is plain. The input card (`InputCard.tsx`) needs better focus states, hover effects, and a more polished floating surface. The Glass tiles could use more nuanced gradients and borders.
- **Result Page (`/result/[id]`)**: Currently functional but looks like oversized white boxes. Needs better spatial hierarchy, a refined circular score indicator (with SVG/CSS animation), and semantically colored evidence cards.
- **About (`/about`)**: Low-contrast text on pale surfaces. Weak section panels.
- **Community (`/community`)**: Functional but basic metric cards. Needs intentional empty states and better tabular hierarchy.

## Proposed Visual Direction
- **Theme**: "Pakka Dawn" - luminous, deep indigo/blue moving into lavender, violet, soft rose, and peach.
- **Backgrounds**: Soft grid-paper surfaces with atmospheric "glow" layers.
- **Surfaces**: Glassmorphism with translucent tiles, layered shadows, and thin borders. 
- **Typography**: Refined scale, consistent weights, readable across all screen sizes.
- **Motion**: Subtle entrances (fade up with slight translate), hover elevations, and responsive states.

## Components/Files to Change
- `globals.css` (Update tokens and global styles)
- `Header.tsx` (Add glass effect, improve layout)
- `GridBackground.tsx` (Refine grid and glow)
- `InputCard.tsx` (Add depth, hover states, transition effects)
- `page.tsx` (Landing page hero and layout)
- `ResultContent.tsx` (Structure the result page as a premium report)

## Implementation Checklist
- [x] Create `UI_REDESIGN_PLAN.md`
- [ ] Define global CSS variables for Pakka Dawn palette.
- [ ] Refine `Header.tsx` to use a translucent glass surface.
- [ ] Upgrade `GridBackground.tsx` with a layered radial glow.
- [ ] Redesign `/` hero section in `page.tsx`.
- [ ] Refine `InputCard.tsx` interactive states.
- [ ] Redesign `/result/[id]` layout and score indicator.
- [ ] Update `/about` and `/community` contrast and layout.
- [ ] Run build, lint, and test checks.
