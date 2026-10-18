# Portfolio cleanup plan

## Direction

The selected direction is **Obsidian precision**: a dark, premium security portfolio shaped by the supplied LYWARO mood board. It uses near-black backgrounds, titanium-gray surfaces, cool white type, thin technical borders, and restrained material contrast instead of colored neon.

### Design system

- **Design movement:** premium industrial product interface with a clean engineering feel.
- **Core principles:** plain language, precise spacing, readable line length, honest evidence, and material contrast through surface values rather than decoration.
- **Color philosophy:** obsidian `#050505`, `#0B0B0C`, and `#101113`; card surfaces `#18191D` and `#202228`; cool whites `#FFFFFF`, `#D4D6DB`, and `#9CA3AF`; border `#2E3238`.
- **Layout paradigm:** generous black space, thin rules, controlled two-column evidence blocks, and project pages that prioritize screenshots, links, and measurable facts.
- **Signature elements:** titanium hairlines, brushed-metal highlights, restrained white hover states, square/low-radius controls, and visible evidence states for missing uploads.
- **Interaction philosophy:** interactions reveal links or details; they do not add fake depth, colored glow, or visual noise.
- **Animation:** keep only useful scroll transitions and the existing real hero sequence; avoid floating orbs, cursor tricks, and decorative background motion.
- **Typography:** one Poppins family for headings, body copy, labels, and metadata. Use weight and spacing instead of a second font.
- **Brand essence:** a cybersecurity student who documents what he built, tested, and learned; direct, practical, credible.
- **Brand voice:** short, factual, and plain. Example lines: “Here is what I built.” and “Contact me about security work.”
- **Wordmark:** retain the existing text mark without pill treatments or decorative status effects.
- **Signature material accent:** titanium highlight `#ECEFF3`, with no warm accent color.

## Implementation

- Replace the amber field-note tokens with obsidian/titanium surfaces, cool-gray borders, and white hover states.
- Use Poppins as the only font family and remove public-facing monospace/serif styling.
- Rewrite hero, about, experience, projects, skills, achievements, certifications, and contact copy in plain English; remove inflated or template-like phrases.
- Remove the 3D skill orbit and 2D orbit fallback; render grouped skills as readable lists with descriptions and levels.
- Remove fake project image grids and generic mission language; show real cover/gallery media when available and use an honest “Screenshot not uploaded” state otherwise.
- Keep the certificate and achievement evidence frames, but style them as flat document panels without blur, gradients, or decorative overlays.
- Simplify navigation, buttons, forms, project detail pages, writeups, and 404/admin surfaces so the flat system is consistent across the app.
- Keep real numbers already present in the data visible: CGPA, internships, CTF rankings, certifications, team size, and project facts. Do not invent new metrics.
- Preserve the route manifest, fallback data path, Supabase integration, admin editing, and deployed project behavior.
- Store the four About metrics in the existing `settings` table and expose them in `/admin/settings`, with safe seed defaults and public fallback behavior.

## Project structure

- `src/app`: Next.js routes, metadata, and global styles.
- `src/components/hero`: real scroll-driven hero sequence and plain overlay copy.
- `src/components/sections`: public portfolio sections and evidence-first presentation.
- `src/components/ui`: shared motion, media, and link primitives.
- `src/lib`: types, fallback content, data access, validation, and server actions.
- `public/certs`: expected web-ready certificate and achievement scans supplied by the owner.
- `supabase/migrations`: reproducible database schema changes.
