# Portfolio refresh TODO

- [x] **Certificate gallery:** Certifications render descriptive copy, issuer/date metadata, verification links, and the supplied `/certs/*.webp` scans when present; missing media uses a designed fallback instead of a broken image. The scans themselves are still awaiting re-upload because they were not present in this checkout.
- [x] **Achievement proof:** Achievements render descriptive detail, date, result/placement metadata, and supplied images in a distinct proof-of-work layout; missing media is handled by the same fallback.
- [x] **Capability map:** Skills render grouped descriptions and a readable fallback orbit whose labels do not clip; the guarded 3D orbit remains optional.
- [x] **Navigation and routes:** Public navigation includes Certifications and the route manifest remains valid for the existing page routes.
- [x] **Visual redesign:** Replace the flat mint/lilac treatment with the midnight editorial palette, layered background, richer surfaces, document-like cards, and consistent typography/motion.
- [x] **Verification:** Typecheck, lint, and production build pass; the app remains usable with no Supabase environment and no certificate assets in the checkout.
