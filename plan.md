# Portfolio cleanup plan

## Direction

Three candidate directions were considered: **Flat field notes** (0.08), **Warm terminal brutalism** (0.05), and **Soft editorial paper** (0.03). The selected direction is **Flat field notes**: a dark, readable security portfolio with one amber accent, hard-edged surfaces, and evidence before decoration.

### Design system

- **Design movement:** flat editorial documentation with a practical operations-console feel.
- **Core principles:** plain language, strong spacing, readable line length, honest evidence, and no decorative effects that compete with the work.
- **Color philosophy:** near-black background, off-white text, muted gray borders, and one signal-amber accent. No purple/blue pairings.
- **Layout paradigm:** simple vertical sections, two-column evidence blocks, and project pages that prioritize screenshots, links, and measurable facts when available.
- **Signature elements:** thin amber rules, square corners, small metadata labels, and visible evidence states for missing uploads.
- **Interaction philosophy:** interactions reveal links or details; they do not add fake depth, glow, or visual noise.
- **Animation:** keep only useful scroll transitions and the existing real hero sequence; remove floating orbit visuals, cursor tricks, glow effects, and decorative background motion.
- **Typography:** one Geist Sans family for headings, body copy, labels, and metadata. Use weight and spacing instead of a second font.
- **Brand essence:** a cybersecurity student who documents what he built, tested, and learned; direct, practical, credible.
- **Brand voice:** short, factual, and plain. Example lines: “Here is what I built.” and “Contact me about security work.”
- **Wordmark:** retain the existing text mark without pill treatments or decorative status effects.
- **Signature brand color:** signal amber `#E3AE62`.

## Implementation

- Replace gradients, glassmorphism, backdrop blur, glow shadows, grid masks, and purple/blue tokens with flat backgrounds, borders, and one amber token.
- Use Geist Sans as the only font family and remove public-facing monospace/serif styling.
- Rewrite hero, about, experience, projects, skills, achievements, certifications, and contact copy in plain English; remove inflated or template-like phrases.
- Remove the 3D skill orbit and 2D orbit fallback; render grouped skills as readable lists with descriptions and levels.
- Remove fake project image grids and generic mission language; show real cover/gallery media when available and use an honest “Screenshot not uploaded” state otherwise.
- Keep the certificate and achievement evidence frames, but style them as flat document panels without blur, gradients, or decorative overlays.
- Simplify navigation, buttons, forms, project detail pages, writeups, and 404/admin surfaces so the flat system is consistent across the app.
- Keep real numbers already present in the data visible: CGPA, internships, CTF rankings, certifications, team size, and project facts. Do not invent new metrics.
- Preserve the route manifest, fallback data path, Supabase integration, admin editing, and deployed project behavior.

## Project structure

- `src/app`: Next.js routes, metadata, and global styles.
- `src/components/hero`: real scroll-driven hero sequence and plain overlay copy.
- `src/components/sections`: public portfolio sections and evidence-first presentation.
- `src/components/ui`: shared motion, media, and link primitives.
- `src/lib`: types, fallback content, data access, validation, and server actions.
- `public/certs`: expected web-ready certificate and achievement scans supplied by the owner.
- `supabase/migrations`: reproducible database schema changes.
