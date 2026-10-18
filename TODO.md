# Portfolio cleanup TODO

- [x] **Flat visual system:** Removed gradients, glassmorphism, backdrop blur, glow shadows, grid masks, and purple/blue combinations during the initial cleanup; the mood-board pass now carries that discipline into obsidian and titanium.
- [x] **Plain English copy:** Rewrote public headings, descriptions, CTAs, metadata, and status messages in direct language and removed hype and cyber-drama wording.
- [x] **Evidence-first projects:** Project cards now show real cover/gallery media when available, live/source facts, and an honest “Screenshot not uploaded” state instead of fake graphics.
- [x] **Typography and spacing:** The public app now uses one Poppins family with a simpler type scale, comfortable line height, and consistent section/card spacing.
- [x] **Remove fake elements:** Removed the floating skill orbit, decorative cursor, terminal easter egg, glow effects, and unused decorative UI while preserving real project, certification, achievement, and contact functionality.
- [x] **Preserve behavior:** Public routes, route manifest, admin editing, Supabase fallback behavior, certificate evidence viewer, and the real hero frame sequence remain available.
- [x] **Verification and ship:** Typecheck, lint, production build, JSON validation, and diff checks pass. Commit `60cd3ec` is pushed to GitHub and the production deployment is live.

## Mood board pass

- [x] **Obsidian palette:** Replaced the warm amber field-note palette with `#050505`, `#0B0B0C`, `#101113`, `#18191D`, `#202228`, `#D4D6DB`, `#9CA3AF`, and `#2E3238`.
- [x] **Poppins typography:** Loaded Poppins as the single public typeface and removed the remaining Geist/mono visual language.
- [x] **Titanium controls:** Restyled navigation, buttons, cards, rules, inputs, media frames, and status elements with cool metallic whites and thin titanium borders.
- [x] **Mood-board hero:** Applied the supplied obsidian/titanium direction to the hero without adding fake stock imagery or decorative orbs.
- [x] **Validation and ship:** Typecheck, lint, build, JSON, diff, and live HTTP checks pass. The mood-board pass is pushed and live in production.
- [x] **Projects layout rollback:** Per the latest request, removed the optional/full-screen horizontal experiments and restored the original responsive top-to-bottom project grid.
- [x] **Rollback validation and ship:** Typecheck, lint, production build, clean local HTTP check, GitHub push, and production deployment pass.
- [ ] **Achievement certificate viewer:** Clicking an uploaded certificate/evidence image in Achievements must open a large modal viewer with a close control, without affecting cards that have no image.

## About metrics configuration

- [x] **Admin fields:** `/admin/settings` lets the admin edit CGPA, internships, CTF rankings, and certifications as short values, including text such as `Top 10`.
- [x] **Public sync:** The About stat cards read those four values from the existing `settings` table and update after saving without hard-coded public values.
- [x] **Fallback and seed:** Missing settings fall back to the current values (`8.09`, `3`, `2`, `7`) and `seed.json` includes the same keys.
- [x] **Validation and ship:** Typecheck, lint, build, seed validation, local HTTP checks, GitHub push, and production deployment pass.
