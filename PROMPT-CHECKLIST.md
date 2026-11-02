# Prompt implementation checklist

## Website features

| Requirement                                  | Implementation                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router, TypeScript, Tailwind     | Next.js 16.4.3; typed client/server components; Tailwind 4                                                                          |
| GSAP, ScrollTrigger, Lenis, MotionPathPlugin | Pinned chapters, one scroll clock, smooth wheel input, path-driven ingredient movement                                              |
| Framer Motion                                | Spring-driven 3D collection, dialogs and loading transitions                                                                        |
| React Three Fiber + Drei                     | Deferred desktop WebGL crumbs with Float; starts after interaction                                                                  |
| SplitType + React Icons                      | Character-level motion and accessible interface icons                                                                               |
| Seven videos, no autoplay/audio/controls     | Seven paused videos; 1080p desktop, 720p mobile; programmatic scroll seeking                                                        |
| Full-viewport video                          | Fixed film surface covers the viewport through the whole story                                                                      |
| Continuous scroll transitions                | Reversible scroll-driven dissolves finish on the next clip's exact first frame                                                      |
| Hero                                         | CRAFTED / outlined TO / gold PERFECTION; BURGER watermark; Explore Menu                                                             |
| Taco                                         | MEET THE CRUNCH, gradient Crispy / Chicken, green Taco, staggered ingredient callouts                                               |
| Fries + drink                                | ICE COLD, PERFECTLY CRISPY; floating bubbles; animated freshness metric                                                             |
| Packaging                                    | WRAPPED WITH LOVE; supplied packaging animation; warm background treatment                                                          |
| Menu                                         | Ten-item rotating 3D collection; parallax depth, pointer tilt, swipe, keyboard and button controls                                  |
| Ingredients                                  | ONLY REAL INGREDIENTS; expanding letters; motion-path floating ingredient photography                                               |
| Finale                                       | EVERY BITE MATTERS; Perfect / Every / Bite color treatment; Order Now; minimal footer                                               |
| Typography and palette                       | Local Clash Display / Satoshi; specified cream, orange, gold, green, tomato, charcoal, brown                                        |
| Micro-interactions                           | Magnetic cursor; elastic buttons; pointer-origin ripple; canvas grain; floating crumbs                                              |
| Loading screen                               | Assembling ingredient icon and smoothly animated asset-completion percentage                                                        |
| Accessibility                                | Focusable controls, native modal focus containment, keyboard collection controls, reduced-motion photographic experience            |
| Performance                                  | Lazy videos/posters, adaptive video resolution, sparse keyframe seeking, deferred 3D bundle, measured production Lighthouse reports |

## Requirements that depend on source material or external services

- The Google Flow descriptions specify actions, textures, lighting, 120fps appearance, matched camera angles, and text-free imagery **inside the videos**. This implementation uses the supplied footage. Those source-level properties cannot all be created by changing a website. Scroll-based crossfades smooth the joins; they do not regenerate the clips or turn them into a physically continuous ingredient morph.
- Lighthouse's maximum score is **100**, not “100+.” Actual production audit results are recorded instead of promising a score.
- The prompt asks for an Order Now button for a fictional brand, not a payment integration. The button opens a working sample order selection/review/copy flow. It does not submit orders or take payment; the menu explicitly says so.
