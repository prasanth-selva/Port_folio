# Portfolio refresh plan

## Direction

Three candidate visual directions were considered: **Midnight editorial** (0.05), **Warm terminal brutalism** (0.08), and **Soft neon glass** (0.03). The selected direction is **Midnight editorial**: a security portfolio that feels like a printed field journal over a dark operations console, with amber signal accents instead of the previous mint/lilac default.

### Design system

- **Design movement:** cinematic editorial interface with cyber-operations instrumentation.
- **Core principles:** high-contrast hierarchy, tactile surfaces, short readable copy, and motion that supports scanning rather than decoration.
- **Color philosophy:** ink navy and graphite create a calm command-center base; amber marks attention and evidence; muted blue-violet and coral provide restrained secondary signals.
- **Layout paradigm:** full-width atmospheric bands with narrow editorial rails, offset content blocks, and certificate/achievement galleries that break the centered grid.
- **Signature elements:** amber hairline rules, corner metadata labels, layered radial light, and document-like media frames.
- **Interaction philosophy:** hover states feel like revealing metadata; certificate images open into a focused viewer; reduced-motion users get the same information without animation.
- **Animation:** preserve the hero scrollytelling, use short reveal/hover transitions elsewhere, and never make content depend on motion.
- **Typography:** Geist for interface copy and a restrained serif display treatment for section titles, with monospace only for labels, dates, and technical metadata.
- **Brand essence:** an early-career security builder who turns failure modes into useful systems; curious, precise, grounded.
- **Brand voice:** direct and evidence-led. Example lines: “Proof, not posturing.” and “Open a secure channel.”
- **Wordmark:** the existing `>_ prasanth.selva` mark is retained, with an amber signal dot and a quieter operations-console treatment.
- **Signature brand color:** signal amber `#E3AE62`.

## Implementation

- Retheme the shared Tailwind/CSS tokens and navigation so the whole site shares the midnight editorial system.
- Add descriptive content fields to the public types and seed data, plus a forward-compatible Supabase migration for certification/achievement/skill descriptions and achievement metadata.
- Add resilient certificate/achievement media frames that display `/certs/*.webp` when the supplied scans are present and never show broken-image chrome when an asset is absent.
- Upgrade certifications into a document gallery with issuer/date metadata and click-to-enlarge viewing; upgrade achievements into proof cards with result badges and readable descriptions.
- Make skills feel like a capability map with grouped descriptions and a non-clipping 2D fallback while preserving the guarded 3D orbit.
- Add Certifications to the public navigation and keep `/manus-routes.json` synchronized with the existing route set.
- Keep the repository deployable without Supabase or certificate assets by using the existing fallback data path.

## Project structure

- `src/app`: Next.js routes, metadata, and global styles.
- `src/components/hero`: scroll-driven hero experience.
- `src/components/sections`: public portfolio sections and content presentation.
- `src/components/ui`: shared motion, navigation, and interaction primitives.
- `src/lib`: types, fallback content, data access, validation, and server actions.
- `public/certs`: expected web-ready certificate scans supplied by the owner.
- `supabase/migrations`: reproducible database schema changes.
