AI Code Editor Prompt​
​
ACT AS:
A world-class Creative Developer (Awwwards-level) specializing in Next.js,
Framer Motion, and high-performance scrollytelling experiences.
THE TASK:
Build a high-end scrollytelling landing page for a fictional product brand
called “[BRAND NAME]”.
The core mechanic is a scroll-linked animation that plays an image sequence
of “[PRODUCT TYPE]” visually exploding (disassembling) and reassembling
as the user scrolls down the page.
TECH STACK:

- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Rendering: HTML5 Canvas (for performance)
VISUAL DIRECTION & COLOR:
- Seamless Blending:
The website background MUST perfectly match the background color of the
image sequence so the edges of the frames are completely invisible.
- Color Palette:
Pure dark mode. Use [BACKGROUND HEX COLOR — e.g. #050505] or
eye-drop the image background directly.
- Typography:
[FONT FAMILY — e.g. Inter / San Francisco / Geist].
Clean, minimalist, tracking-tight.
- Text Colors:
Headings: text-white/90
Body: text-white/60
IMPLEMENTATION DETAILS:

1. The Sticky Canvas

- Create a component called `[SCROLL COMPONENT NAME].tsx`.
- The outer container should be h-[400vh] to allow extended scroll time.
- Inside it, render a <canvas> element that is:
- position: sticky
- top-0
- h-screen
- w-full
- The canvas must be perfectly centered and fill the viewport.

2. Scroll Logic

- Load a sequence of [TOTAL FRAME COUNT] images generated from an image splitter.
- Naming convention:
`[FRAME_PREFIX]_[i]_[OPTIONAL SUFFIX].webp`
- Use useScroll from Framer Motion to map scroll progress (0 → 1)
to the frame index (0 → TOTAL FRAMES - 1).
- On every scroll update:
- Calculate the current frame index
- Draw the corresponding image to the canvas
- Ensure smooth interpolation and no visible stutter.

3. Text Overlays (The Story)
Overlay animated text sections that fade in and out as the product
disassembles and reassembles.
SCROLL SECTIONS (Editable):

- 0% Scroll:
"[HERO HEADLINE]"
(Centered)
- 30% Scroll:
"[FEATURE / MESSAGE #1]"
(Left aligned)
→ Product begins expanding / separating
- 60% Scroll:
"[FEATURE / MESSAGE #2]"
(Right aligned)
→ Product fully exploded, internal components visible
- 90% Scroll:
"[CTA / FINAL MESSAGE]"
(Centered)
→ Product smoothly reassembles
Text animations should be subtle, cinematic, and scroll-synced.

4. Polish & UX

- Add a loading state with a spinner while all images preload.
- Do NOT start scroll animation until images are fully loaded.
- Ensure the canvas scales correctly on mobile (contain fit).
- Maintain consistent aspect ratio across devices.
OUTPUT:
Generate the complete, production-ready code for:
- page.tsx
- [SCROLL COMPONENT NAME].tsx
- globals.css
Use nano banana to generate UI components if needed.
