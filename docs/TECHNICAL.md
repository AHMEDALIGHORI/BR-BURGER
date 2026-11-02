# BR-Burger

A cinematic, seven-chapter brand experience built with Next.js App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger + MotionPathPlugin, Lenis, Framer Motion, SplitType, React Three Fiber, Drei, and React Icons.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build` followed by `npm start`.

## The experience

- Seven pinned chapters share one fixed, full-viewport film layer. One scroll clock controls paused video time and reversible chapter dissolves. There is no autoplay, audio, or native video UI.
- Desktop uses 1080p footage; mobile uses lighter 720p copies. Neighboring videos and fallback posters preload as the visitor approaches. Seek requests coalesce while the browser decodes a frame.
- All ten menu items appear in a perspective-based rotating 3D collection with spring rotation, depth, pointer tilt, touch swipes, arrow-key controls, direct item selection, and scroll-controlled selection.
- Locally hosted Clash Display and Satoshi typography; character rotation, scaling, reveals, and scroll-velocity response; expanding ingredient lettering; gradient flavor titles; motion-path floating ingredients; optional desktop WebGL crumbs; canvas grain; pointer-centered button ripples and elastic deformation.
- Responsive desktop, tablet, and mobile layouts. Reduced-motion mode displays an unpinned photographic story and avoids video loading, smooth scrolling, and particle rendering.
- Keyboard-accessible menu and chapter dialogs. Sample menu filtering, quantities, totals, order review, and copying a selection. This fictional brand has no payment or order backend; this is disclosed inside the menu.

## Assets

The supplied originals remain in `Asssts/`. The page uses optimized WebP photographs and seek-friendly H.264 video copies in `public/assets/`.

| Chapter       | Source filename prefix           | Web video          |
| ------------- | -------------------------------- | ------------------ |
| Signature     | Burger_ingredients_floating_and_ | 01-hero-burger.mp4 |
| Taco          | Burger_transforms_into_chicken   | 02-taco.mp4        |
| Fries + drink | Taco_dissolving                  | 03-drink-fries.mp4 |
| Packaging     | Fast_food_packaging_assembling   | 04-packaging.mp4   |
| Menu          | Fast_food_products_floating      | 05-menu.mp4        |
| Ingredients   | Burger_ingredients_floating_in_s | 06-ingredients.mp4 |
| Finale        | BR-Burger_food_lineup_assembles  | 07-finale.mp4      |

Regenerate assets with `node scripts/prepare-assets.mjs`, then `node scripts/prepare-hd.mjs`. The original source files remain untouched. The website finishes each outgoing clip and dissolves into the next clip's first frame; scrolling backward reverses that dissolve. This provides continuous rendered transitions but cannot reconstruct ingredient morphs, change camera motion, or remove text embedded in independently generated source footage. Existing menu images serve as food/ingredient illustrations where individual product photos are unavailable.

## Verification

```sh
npm run typecheck
npm run build
npm run test:e2e
node scripts/audit-performance.mjs
```

Browser checks expect a running server at `http://localhost:3000` (or `BASE_URL`). They verify all seven chapters, forward/reverse seeking, full-viewport film dimensions, chapter dissolves, all ten 3D cards, carousel navigation and wrapping, menu filtering, quantities and review, keyboard dismissal, mobile overflow, and reduced motion. Screenshots are saved to `test-results/`.

Run Lighthouse against a **production server**, after `npm run build` and `npm start`. The audit script produces separate desktop and mobile HTML/JSON reports and `test-results/lighthouse-summary.json` with measured scores. Stop other browser tests before measuring to avoid competing CPU load.

Lighthouse scores are not guaranteed; Lighthouse's maximum score is 100. Video loading, WebGL support, device speed, and hosting affect real-world results. No analytics, tracking, external checkout, or database is configured.

Fonts: Clash Display and Satoshi by Indian Type Foundry, obtained from Fontshare. Fontshare license terms apply to the included webfonts.
