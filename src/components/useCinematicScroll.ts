"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";
import SplitType from "split-type";

type Chapter = { id: string };

/** One scroll clock controls the entire film, including reversible chapter dissolves. */
export function useCinematicScroll(
  root: RefObject<HTMLDivElement | null>,
  lenis: RefObject<Lenis | null>,
  chapters: Chapter[],
  setActive: (index: number) => void,
  setSelected: (index: number) => void,
) {
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = new Lenis({
      duration: 1.05,
      smoothWheel: !reduced,
      anchors: false,
    });
    lenis.current = smooth;
    smooth.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => smooth.raf(time * 1000);
    gsap.ticker.add(tick);

    const sections = Array.from(
      scope.querySelectorAll<HTMLElement>(".chapter"),
    );
    const films = Array.from(
      scope.querySelectorAll<HTMLElement>(".cinema-film"),
    );
    const videos = films.map((film) =>
      film.querySelector<HTMLVideoElement>("video")!,
    );
    const targets = videos.map(() => 0);
    const cleanups: (() => void)[] = [];
    const splits: SplitType[] = [];
    const pins: ScrollTrigger[] = [];
    const animators: (() => void)[] = [];
    const animated = new Set<number>();
    let prepareAnimation = (_index: number) => {};
    let activeIndex = -1;
    let menuIndex = -1;
    let disposed = false;
    let interacted = window.scrollY > 0;
    let master: ScrollTrigger | undefined;

    const load = (index: number) => {
      const video = videos[index];
      const poster = films[index]?.querySelector<HTMLImageElement>("img");
      if (poster && !poster.getAttribute("src"))
        poster.src = poster.dataset.src!;
      if (!video || reduced || !interacted || video.getAttribute("src")) return;
      video.src = matchMedia("(max-width: 900px)").matches
        ? video.dataset.mobileSrc!
        : video.dataset.src!;
      video.load();
    };
    const prime = () => {
      interacted = true;
      load(Math.max(0, activeIndex));
    };
    window.addEventListener("wheel", prime, { once: true, passive: true });
    window.addEventListener("touchmove", prime, { once: true, passive: true });
    const seek = (index: number) => {
      const video = videos[index];
      if (
        !video ||
        video.seeking ||
        video.readyState < 1 ||
        !Number.isFinite(video.duration)
      )
        return;
      const desired = targets[index] * Math.max(0, video.duration - 0.04);
      if (Math.abs(video.currentTime - desired) > 0.018)
        video.currentTime = desired;
    };
    videos.forEach((video, index) => {
      const ready = () => {
        video.classList.add("is-ready");
        seek(index);
      };
      const seeked = () => seek(index);
      const failed = () => video.classList.remove("is-ready");
      video.addEventListener("loadeddata", ready);
      video.addEventListener("seeked", seeked);
      video.addEventListener("error", failed);
      cleanups.push(() => {
        video.removeEventListener("loadeddata", ready);
        video.removeEventListener("seeked", seeked);
        video.removeEventListener("error", failed);
      });
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target as HTMLElement);
            load(index);
            prepareAnimation(index);
          }
      },
      { rootMargin: "100% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    const context = gsap.context(() => {
      sections.forEach((section, index) => {
        const stage = section.querySelector<HTMLElement>(".stage")!;
        const pin = ScrollTrigger.create({
          id: chapters[index].id,
          trigger: section,
          start: "top top",
          end: reduced
            ? "bottom top"
            : () => `+=${innerHeight * (index === 4 ? 4.5 : 1.8)}`,
          pin: reduced ? false : stage,
          invalidateOnRefresh: true,
        });
        pins.push(pin);
        animators[index] = () => {
          if (reduced || animated.has(index)) return;
          animated.add(index);

          const title = section.querySelector<HTMLElement>(".headline");
          if (title) {
            title.setAttribute(
              "aria-label",
              Array.from(title.children)
                .map((line) => line.textContent?.replace("✳", "").trim())
                .join(" "),
            );
            const split = new SplitType(title, { types: "words,chars" });
            splits.push(split);
            split.chars?.forEach((char) =>
              char.setAttribute("aria-hidden", "true"),
            );
            gsap.from(split.chars, {
              yPercent: index ? 90 : 18,
              rotationX: index ? -65 : -10,
              rotationZ: index ? 5 : 1,
              scale: index ? 0.85 : 0.98,
              opacity: index ? 0 : 1,
              stagger: 0.025,
              duration: 0.9,
              ease: "power3.out",
              ...(index
                ? {
                    scrollTrigger: {
                      trigger: section,
                      start: "top 70%",
                      toggleActions: "play none none reverse",
                    },
                  }
                : { delay: 0.3 }),
            });
            if (index === 5)
              gsap.to(split.chars, {
                x: (i: number) => (i - (split.chars!.length - 1) / 2) * 5,
                scale: 1.12,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: () => `+=${innerHeight * 1.8}`,
                  scrub: true,
                },
              });
          }
          gsap.to(section.querySelector(".watermark"), {
            xPercent: -12,
            scale: index === 5 ? 1.45 : 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${innerHeight * 1.8}`,
              scrub: true,
            },
          });
          gsap.fromTo(
            section.querySelectorAll(".callout"),
            { y: 35, rotation: -12, opacity: 0 },
            {
              y: -25,
              rotation: 5,
              opacity: 1,
              stagger: 0.12,
              scrollTrigger: {
                trigger: section,
                start: "top 30%",
                end: "+=700",
                scrub: 1,
              },
            },
          );
          section
            .querySelectorAll<HTMLElement>(".floating-herb")
            .forEach((herb, i) => {
              gsap.to(herb, {
                motionPath: {
                  path: [
                    { x: 0, y: 50 },
                    { x: i % 2 ? -70 : 80, y: -35 },
                    { x: i % 2 ? -25 : 120, y: -150 },
                  ],
                  curviness: 1.6,
                },
                rotation: i % 2 ? -70 : 65,
                scale: 1.3,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: () => `+=${innerHeight * 3.5}`,
                  scrub: 1,
                },
              });
            });
          if (index === 2)
            gsap.fromTo(
              section.querySelector(".metric-value"),
              { textContent: 0 },
              {
                textContent: 100,
                duration: 1.8,
                snap: { textContent: 1 },
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 55%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          gsap.to(section.querySelectorAll(".bubbles i"), {
            y: -95,
            x: (i: number) => Math.sin(i) * 35,
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: () => `+=${innerHeight * 3}`,
              scrub: true,
            },
          });
        };
      });
      animators[0]?.();

      const render = (position: number, velocity = 0) => {
        if (position > 0) interacted = true;
        let index = 0;
        for (let i = 0; i < pins.length; i++)
          if (position >= pins[i].start) index = i;
        const start = pins[index].start;
        const end = pins[index + 1]?.start ?? ScrollTrigger.maxScroll(window);
        const progress = gsap.utils.clamp(
          0,
          1,
          (position - start) / Math.max(1, end - start),
        );
        // Finish the outgoing clip before dissolving into the exact first frame of the next.
        const dissolve =
          index < films.length - 1
            ? gsap.utils.clamp(0, 1, (progress - 0.88) / 0.12)
            : 0;
        films.forEach((film, i) => {
          film.style.opacity = String(
            i === index ? 1 : i === index + 1 ? dissolve : 0,
          );
          film.style.visibility =
            i === index || (i === index + 1 && dissolve > 0)
              ? "visible"
              : "hidden";
          film.style.zIndex = i === index + 1 ? "2" : "1";
        });
        if (index !== activeIndex) {
          activeIndex = index;
          setActive(index);
          scope.dataset.chapter = String(index);
          load(index);
          prepareAnimation(index);
        }
        load(index);
        if (progress > 0.65) load(index + 1);
        if (!reduced) {
          targets[index] = Math.min(1, progress / (index === 6 ? 1 : 0.88));
          seek(index);
          if (dissolve > 0 && videos[index + 1]) {
            targets[index + 1] = 0;
            seek(index + 1);
          }
        }
        const stage = sections[index].querySelector<HTMLElement>(".stage")!;
        stage.style.setProperty("--chapter-progress", `${progress * 100}%`);
        scope.style.setProperty(
          "--story-progress",
          `${((index + progress) / films.length) * 100}%`,
        );
        scope.style.setProperty("--film-dissolve", String(dissolve));
        if (index === 4 && !reduced) {
          const next = Math.min(9, Math.floor(progress * 10));
          if (next !== menuIndex) {
            menuIndex = next;
            setSelected(next);
          }
        }
        if (!reduced && Math.abs(velocity) > 1) {
          const chars = sections[index].querySelectorAll(".headline .char");
          gsap.to(chars, {
            skewY: gsap.utils.clamp(-3, 3, velocity / 1000),
            duration: 0.2,
            overwrite: "auto",
            onComplete: () => {
              gsap.to(chars, { skewY: 0, duration: 0.5, overwrite: "auto" });
            },
          });
        }
      };
      master = ScrollTrigger.create({
        id: "film-clock",
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        onUpdate: (self) => render(self.scroll(), self.getVelocity()),
        onRefresh: (self) => render(self.scroll()),
      });
      render(window.scrollY);
      if (!reduced)
        gsap.to(".orbit-seed", {
          motionPath: {
            path: [
              { x: 0, y: 0 },
              { x: 65, y: -45 },
              { x: 100, y: 10 },
              { x: 0, y: 0 },
            ],
            curviness: 1.5,
          },
          duration: 12,
          repeat: -1,
          ease: "none",
        });
    }, scope);
    prepareAnimation = (index) => {
      if (!disposed && !animated.has(index))
        context.add(() => animators[index]?.());
    };
    load(0);
    const refresh = () => {
      if (!disposed) {
        ScrollTrigger.refresh();
        master?.update();
      }
    };
    document.fonts.ready.then(refresh);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("wheel", prime);
      window.removeEventListener("touchmove", prime);
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
      splits.forEach((split) => split.revert());
      gsap.ticker.remove(tick);
      smooth.destroy();
      lenis.current = null;
    };
  }, [root, lenis, chapters, setActive, setSelected]);
}
