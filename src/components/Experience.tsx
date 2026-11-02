"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCinematicScroll } from "./useCinematicScroll";
import MenuCarousel from "./MenuCarousel";
import Grain from "./Grain";
import type Lenis from "lenis";

import {
  FiArrowUpRight,
  FiArrowDown,
  FiArrowRight,
  FiPlus,
  FiMinus,
  FiX,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";

const Crumbs = dynamic(() => import("./Crumbs"), { ssr: false });
const chapters = [
  {
    id: "signature",
    name: "The signature",
    label: "An obsession with every layer",
    video: "01-hero-burger",
    image: "burger",
    word: "BURGER",
  },
  {
    id: "crunch",
    name: "The crunch",
    label: "A different kind of extraordinary",
    video: "02-taco",
    image: "taco",
    word: "CRUNCH",
  },
  {
    id: "perfect-pair",
    name: "The perfect pair",
    label: "Some things are better together",
    video: "03-drink-fries",
    image: "drinks",
    word: "TOGETHER",
  },
  {
    id: "wrapped",
    name: "The little details",
    label: "Good taste. Inside and out.",
    video: "04-packaging",
    image: "packaging",
    word: "WITH LOVE",
  },
  {
    id: "menu",
    name: "Your next favorite",
    label: "Follow your cravings",
    video: "05-menu",
    image: "menu",
    word: "THE MENU",
  },
  {
    id: "ingredients",
    name: "Nothing to hide",
    label: "Greatness starts at the source",
    video: "06-ingredients",
    image: "ingredients",
    word: "REAL",
  },
  {
    id: "finale",
    name: "Every bite matters",
    label: "Made with a little more love",
    video: "07-finale",
    image: "finale",
    word: "BR–BURGER",
  },
];
const products = [
  {
    name: "Classic Burger",
    category: "Burgers",
    price: 9,
    image: "menu-classic",
    note: "Flame-grilled beef, cheddar, crisp lettuce & our signature sauce.",
  },
  {
    name: "Double Cheese",
    category: "Burgers",
    price: 12,
    image: "menu-double",
    note: "Double the beef. Melted cheddar. Absolutely no compromises.",
  },
  {
    name: "Chicken Burger",
    category: "Burgers",
    price: 10,
    image: "menu-chicken",
    note: "Golden crispy chicken, fresh slaw & creamy house sauce.",
  },
  {
    name: "BBQ Burger",
    category: "Burgers",
    price: 11,
    image: "menu-spicy",
    note: "Smoky BBQ sauce, grilled beef, cheddar & crunchy onions.",
  },
  {
    name: "Spicy Burger",
    category: "Burgers",
    price: 11,
    image: "menu-spicy",
    note: "Grilled beef, fiery chipotle, pickles & a little extra attitude.",
  },
  {
    name: "Chicken Taco",
    category: "Sides & more",
    price: 8,
    image: "taco",
    note: "Crispy chicken, purple cabbage & chipotle in a golden tortilla.",
  },
  {
    name: "Loaded Fries",
    category: "Sides & more",
    price: 6,
    image: "menu-fries",
    note: "Golden fries with melted cheddar & our signature sauce.",
  },
  {
    name: "Nuggets",
    category: "Sides & more",
    price: 6,
    image: "menu-nuggets",
    note: "Bite-sized golden chicken. Your favorite dip on the side.",
  },
  {
    name: "Milkshake",
    category: "Drinks",
    price: 5,
    image: "menu-shake",
    note: "Rich, creamy vanilla with a soft whipped finish.",
  },
  {
    name: "Cold Coffee",
    category: "Drinks",
    price: 5,
    image: "menu-coffee",
    note: "Smooth coffee, chilled milk & plenty of ice.",
  },
];
const money = (amount: number) => `$${amount.toFixed(2)}`;

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(0);
  const [panel, setPanel] = useState<"menu" | "chapters" | null>(null);
  const [category, setCategory] = useState("Burgers");
  const [selected, setSelected] = useState(0);
  const [bag, setBag] = useState<Record<string, number>>({});
  const [review, setReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const reduced = useReducedMotion();
  const [explored, setExplored] = useState(false);
  useEffect(() => {
    const reveal = () => {
      setExplored(true);
      if (
        matchMedia(
          "(min-width: 1000px) and (prefers-reduced-motion: no-preference)",
        ).matches
      ) {
        const context = document.createElement("canvas").getContext("webgl2");
        setWebgl(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
    window.addEventListener("wheel", reveal, { once: true, passive: true });
    window.addEventListener("touchmove", reveal, { once: true, passive: true });
    return () => {
      window.removeEventListener("wheel", reveal);
      window.removeEventListener("touchmove", reveal);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let complete = 0;
    const counter = { value: 0 };
    const settle = () => {
      if (alive) {
        complete++;
        gsap.to(counter, {
          value: (complete / 4) * 100,
          duration: 0.35,
          overwrite: true,
          onUpdate: () => {
            if (alive) setLoaded(Math.round(counter.value));
          },
          onComplete: () => {
            if (alive && complete === 4) setLoading(false);
          },
        });
      }
    };
    const img = new Image();
    img.src = "/assets/images/01-hero-burger-poster.jpg";
    img
      .decode()
      .catch(() => {})
      .then(settle);
    document.fonts.load('600 32px "Clash Display"').then(settle, settle);
    document.fonts.load('400 14px "Satoshi"').then(settle, settle);
    document.fonts.ready.then(settle);
    const fallback = window.setTimeout(() => {
      if (alive) setLoading(false);
    }, 3500);
    return () => {
      alive = false;
      gsap.killTweensOf(counter);
      clearTimeout(fallback);
    };
  }, []);

  useCinematicScroll(root, lenis, chapters, setActive, setSelected);

  useEffect(() => {
    const cursor = document.querySelector<HTMLElement>(".custom-cursor");
    if (!cursor || !matchMedia("(pointer: fine)").matches || reduced) return;
    const move = (event: PointerEvent) => {
      gsap.to(cursor, {
        x: event.clientX,
        y: event.clientY,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });
      cursor.classList.toggle(
        "is-hovered",
        Boolean((event.target as HTMLElement).closest("button,a")),
      );
    };
    const leave = () => gsap.to(cursor, { opacity: 0 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  useEffect(() => {
    if (panel) {
      lastFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      lenis.current?.stop();
    } else {
      dialog.current?.close();
      lenis.current?.start();
      lastFocus.current?.focus();
    }
  }, [panel]);

  const navigate = useCallback(
    (index: number) => {
      setPanel(null);
      const target =
        ScrollTrigger.getById(chapters[index].id)?.start ??
        document.getElementById(chapters[index].id)?.offsetTop ??
        0;
      lenis.current?.start();
      if (lenis.current)
        lenis.current.scrollTo(target + (index ? 2 : 0), {
          duration: reduced ? 0 : 1.35,
          immediate: Boolean(reduced),
        });
      else
        window.scrollTo({
          top: target,
          behavior: reduced ? "instant" : "smooth",
        });
    },
    [reduced],
  );
  const openMenu = () => {
    setReview(false);
    setCopied(false);
    setPanel("menu");
  };
  const updateBag = (name: string, amount: number) =>
    setBag((current) => ({
      ...current,
      [name]: Math.max(0, (current[name] || 0) + amount),
    }));
  const bagCount = Object.values(bag).reduce((a, b) => a + b, 0);
  const total = products.reduce(
    (sum, product) => sum + product.price * (bag[product.name] || 0),
    0,
  );
  const copyOrder = async () => {
    const text = `My BR-Burger order\n${products
      .filter((p) => bag[p.name])
      .map(
        (p) => `${bag[p.name]} × ${p.name} — ${money(p.price * bag[p.name])}`,
      )
      .join(
        "\n",
      )}\nTotal: ${money(total)}\nDemo menu — no order has been placed.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const magnetic = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--ripple-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--ripple-y",
      `${event.clientY - bounds.top}px`,
    );
    gsap.to(event.currentTarget, {
      x: (event.clientX - bounds.left - bounds.width / 2) * 0.12,
      y: (event.clientY - bounds.top - bounds.height / 2) * 0.18,
      rotation: (event.clientX - bounds.left - bounds.width / 2) * 0.025,
      scaleX: 1.035,
      scaleY: 0.97,
      duration: 0.3,
    });
  };
  const resetMagnet = (event: React.PointerEvent<HTMLButtonElement>) =>
    gsap.to(event.currentTarget, {
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.65,
      ease: "elastic.out(1,.4)",
    });
  const cta = (text: string, handler: () => void, secondary = false) => (
    <button
      className={`pill-button ${secondary ? "light" : ""}`}
      onClick={handler}
      onPointerMove={magnetic}
      onPointerLeave={resetMagnet}
    >
      <span>{text}</span>
      <FiArrowUpRight aria-hidden="true" />
    </button>
  );

  return (
    <div ref={root} className="experience" data-chapter="0">
      <a className="skip-link" href="#menu">
        Skip to menu
      </a>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            aria-label="Loading experience"
          >
            <div className="loader-burger">
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="brand">
              BR<span>–</span>Burger<span className="brand-dot">®</span>
            </span>
            <div className="loader-track">
              <span style={{ width: `${loaded}%` }} />
            </div>
            <span className="eyebrow">
              Something good is coming · {loaded}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate(0)}
          aria-label="BR-Burger home"
        >
          BR<span>–</span>Burger<span className="brand-dot">®</span>
        </button>
        <nav className="header-links" aria-label="Main navigation">
          <button onClick={() => navigate(0)}>Our story</button>
          <button onClick={() => navigate(4)}>The menu</button>
          <button onClick={() => navigate(5)}>Our ingredients</button>
        </nav>
        <div className="header-actions">
          <button className="order-link" onClick={openMenu}>
            Order now <FiArrowUpRight />
            {bagCount > 0 && <span className="bag-count">{bagCount}</span>}
          </button>
          <button
            className="menu-toggle"
            onClick={() => setPanel("chapters")}
            aria-label="Explore chapters"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <aside className="chapter-rail" aria-label="Story chapters">
        <span className="rail-label">THE GOOD STUFF</span>
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => navigate(index)}
            className={active === index ? "active" : ""}
            aria-label={`Chapter ${index + 1}: ${chapter.name}`}
            aria-current={active === index ? "step" : undefined}
          >
            <span className="rail-number">0{index + 1}</span>
            <i />
            <span className="rail-tooltip">{chapter.name}</span>
          </button>
        ))}
        <span className="rail-end">07</span>
      </aside>
      <div className="cinema" aria-hidden="true">
        {chapters.map((chapter, index) => (
          <div className={`cinema-film cinema-film-${index}`} key={chapter.id}>
            <img
              className="cinema-poster"
              src={
                index === 0
                  ? `/assets/images/${chapter.video}-poster.jpg`
                  : undefined
              }
              data-src={`/assets/images/${chapter.video}-poster.jpg`}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              width="1280"
              height="720"
            />
            <video
              className="cinema-video"
              data-src={`/assets/videos/${chapter.video}.mp4`}
              data-mobile-src={`/assets/videos/${chapter.video}-mobile.mp4`}
              muted
              playsInline
              preload="none"
              disablePictureInPicture
              tabIndex={-1}
            />
          </div>
        ))}
        <div className="cinema-readability" />
      </div>
      <main>
        {chapters.map((chapter, index) => (
          <section
            key={chapter.id}
            id={chapter.id}
            className={`chapter chapter-${index}`}
            aria-label={`Chapter ${index + 1}: ${chapter.name}`}
          >
            <div className="stage">
              <div className="watermark" aria-hidden="true">
                {chapter.word}
              </div>
              {index === 0 && (
                <>
                  <div className="hero-copy chapter-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> NOT JUST A BURGER. A
                      WHOLE EXPERIENCE.
                    </div>
                    <h1 className="headline hero-headline">
                      <span className="orange">CRAFTED</span>
                      <span className="outline hero-to">
                        TO{" "}
                        <i className="title-star" aria-hidden="true">
                          ✳
                        </i>
                      </span>
                      <span className="gold">PERFECTION</span>
                    </h1>
                    <p className="hero-subtitle">Every layer tells a story.</p>
                    <p className="body-copy">
                      Real ingredients. Bold flavor. A little obsession.
                      <br />
                      Welcome to a better kind of burger.
                    </p>
                    {cta("Explore Menu", () => navigate(4))}
                  </div>
                  <div className="signature-label">
                    <span className="small-cross">+</span>
                    <span>
                      THE BR SIGNATURE
                      <small>Built different. Bite after bite.</small>
                    </span>
                    <i />
                  </div>
                  <div className="round-seal">
                    <span>ALL FLAVOR. NO SHORTCUTS.</span>
                    <b>
                      100<sup>%</sup>
                    </b>
                    <span>CRAFTED WITH LOVE</span>
                  </div>
                  <span className="orbit-seed seed-one" aria-hidden="true" />
                  {webgl && explored && !loading && !panel && active === 0 && (
                    <Crumbs />
                  )}
                </>
              )}
              {index === 1 && (
                <>
                  <div className="chapter-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> A LITTLE CRUNCH. A
                      LOT OF CHARACTER.
                    </div>
                    <h2 className="headline">
                      <span>MEET THE</span>
                      <span className="gold">
                        CRUNCH<span className="orange">.</span>
                      </span>
                    </h2>
                    <p className="flavor-script">
                      <span className="orange-gradient">Crispy</span>{" "}
                      <span className="gold-gradient">Chicken</span>{" "}
                      <span className="green">Taco</span>
                    </p>
                    <p className="body-copy">
                      Golden chicken. A fresh little kick.
                      <br />
                      All wrapped up in one glorious bite.
                    </p>
                    {cta("Meet your next favorite", openMenu)}
                  </div>
                  <div className="ingredient-callouts">
                    <span className="callout c1">01 / Fresh lettuce</span>
                    <span className="callout c2">02 / Crispy chicken</span>
                    <span className="callout c3">03 / Melted cheese</span>
                    <span className="callout c4">04 / Smoky chipotle</span>
                    <span className="callout c5">Always fresh ↗</span>
                  </div>
                </>
              )}
              {index === 2 && (
                <>
                  <div className="chapter-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> THE ULTIMATE PLUS ONE
                    </div>
                    <h2 className="headline">
                      <span>
                        ICE <em className="outline">COLD,</em>
                      </span>
                      <span className="orange">PERFECTLY</span>
                      <span className="gold">CRISPY.</span>
                    </h2>
                    <p className="body-copy">
                      That first sip. That perfect crunch.
                      <br />
                      Some pairings just make sense.
                    </p>
                    <div className="metrics">
                      <div>
                        <strong>
                          <b className="metric-value">100</b>
                          <span>%</span>
                        </strong>
                        <small>FRESH</small>
                      </div>
                      <div>
                        <strong>
                          0<span>%</span>
                        </strong>
                        <small>ARTIFICIAL TASTE</small>
                      </div>
                    </div>
                  </div>
                  <div className="bubbles" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                </>
              )}
              {index === 3 && (
                <>
                  <div className="chapter-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> EVERY DETAIL.
                      DELIBERATE.
                    </div>
                    <h2 className="headline">
                      <span>WRAPPED</span>
                      <span className="outline">WITH</span>
                      <span className="orange">LOVE.</span>
                    </h2>
                    <p className="body-copy">
                      Good things deserve a beautiful entrance.
                      <br />
                      From our first layer to your last bite.
                    </p>
                    <span className="handwritten">
                      A little box of happiness. ↗
                    </span>
                  </div>
                  <div className="packaging-note">
                    <span>MADE TO MAKE YOUR DAY</span>
                    <FiArrowUpRight />
                  </div>
                </>
              )}
              {index === 4 && (
                <>
                  <div className="chapter-copy menu-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> THE BR COLLECTION
                    </div>
                    <h2 className="headline">
                      <span>MANY MOODS.</span>
                      <span className="orange">ONE MENU.</span>
                    </h2>
                    <p className="body-copy">
                      Go with your usual. Find your unexpected.
                    </p>
                    <div className="menu-manifesto">
                      <span>DOUBLE THE CHEESE.</span>
                      <span>TURN UP THE CRUNCH.</span>
                      <span>FIND YOUR FAVORITE.</span>
                    </div>
                    <p className="collection-instruction">
                      Scroll to rotate the collection <FiArrowDown />
                    </p>
                    {cta("Discover the full menu", openMenu)}
                  </div>
                  <MenuCarousel
                    products={products}
                    selected={selected}
                    onSelect={setSelected}
                    onOpen={openMenu}
                  />
                </>
              )}
              {index === 5 && (
                <>
                  <div className="chapter-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> NOTHING TO HIDE.
                      EVERYTHING TO TASTE.
                    </div>
                    <h2 className="headline">
                      <span>
                        ONLY <em className="green">REAL</em>
                      </span>
                      <span className="orange">INGREDIENTS.</span>
                    </h2>
                    <p className="flavor-script">
                      <span className="green">Fresh</span>{" "}
                      <span className="orange">Ingredients</span>
                    </p>
                    <p className="body-copy">
                      Crisp greens. Ripe tomatoes. Beautifully grilled beef.
                      <br />
                      Simple things, treated extraordinarily.
                    </p>
                    <div className="ingredient-tags">
                      <span>Freshly prepared</span>
                      <span>Full of flavor</span>
                      <span>Made with care</span>
                    </div>
                  </div>
                  <div className="floating-garden" aria-hidden="true">
                    {["lettuce", "tomato", "onion"].map((image, i) => (
                      <img
                        className={`floating-herb herb-${i}`}
                        key={image}
                        src={`/assets/images/${image}.webp`}
                        alt=""
                        loading="lazy"
                        width="160"
                        height="100"
                      />
                    ))}
                  </div>
                  <div className="fresh-stamp">
                    <span>GOOD FOOD</span>
                    <b>starts here.</b>
                    <FiArrowDown />
                  </div>
                </>
              )}
              {index === 6 && (
                <>
                  <div className="finale-copy">
                    <div className="eyebrow">
                      <span className="tiny-star">✳</span> THIS IS WHAT GOOD
                      TASTES LIKE.
                    </div>
                    <h2 className="headline">
                      <span>
                        EVERY <em className="orange">BITE</em> MATTERS.
                      </span>
                    </h2>
                    <p className="finale-promise">
                      <span>Perfect</span> <span>Every</span> <span>Bite.</span>
                    </p>
                    {cta("Order Now", openMenu)}
                  </div>
                  <footer className="site-footer">
                    <button className="brand" onClick={() => navigate(0)}>
                      BR<span>–</span>Burger<sup>®</sup>
                    </button>
                    <span>GOOD FOOD. GOOD MOOD.</span>
                    <button onClick={() => navigate(0)}>
                      Back to the first bite <FiArrowUpRight />
                    </button>
                    <small>
                      © {new Date().getFullYear()} BR-Burger · A fictional brand
                      experience.
                    </small>
                  </footer>
                </>
              )}
              <div className="chapter-bottom">
                <div className="chapter-index">
                  <span>0{index + 1}</span>
                  <i />
                  <span>{chapter.name}</span>
                </div>
                {index === 0 ? (
                  <button className="scroll-cue" onClick={() => navigate(1)}>
                    <span>SCROLL TO UNWRAP</span>
                    <FiArrowDown />
                  </button>
                ) : (
                  <span className="chapter-motto">{chapter.label}</span>
                )}
                <div className="chapter-progress">
                  <span />
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>
      <div className="story-progress" aria-hidden="true" />
      <Grain />
      <div className="custom-cursor" aria-hidden="true" />
      <dialog
        ref={dialog}
        className={`experience-dialog ${panel === "chapters" ? "navigation-dialog" : ""}`}
        onCancel={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPanel(null);
        }}
        aria-labelledby="dialog-title"
        data-lenis-prevent
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <span className="brand">
              BR<span>–</span>Burger<sup>®</sup>
            </span>
            <button
              className="icon-button"
              aria-label="Close menu"
              onClick={() => setPanel(null)}
            >
              <FiX />
            </button>
          </div>
          {panel === "chapters" ? (
            <>
              <span className="eyebrow">
                SEVEN CHAPTERS. ONE DELICIOUS STORY.
              </span>
              <h2 id="dialog-title">
                Take a little <em>journey.</em>
              </h2>
              <nav className="chapter-navigation" aria-label="Jump to chapter">
                {chapters.map((chapter, index) => (
                  <button key={chapter.id} onClick={() => navigate(index)}>
                    <small>0{index + 1}</small>
                    <span>{chapter.name}</span>
                    <FiArrowUpRight />
                  </button>
                ))}
              </nav>
            </>
          ) : (
            <>
              <span className="eyebrow">A LITTLE OF WHAT YOU LOVE</span>
              <h2 id="dialog-title">
                {review ? (
                  <>
                    Your kind of <em>good.</em>
                  </>
                ) : (
                  <>
                    Find your <em>favorite.</em>
                  </>
                )}
              </h2>
              <p className="demo-note">
                A fictional brand’s sample menu. Prices are illustrative; no
                payment or live order is processed.
              </p>
              {!review ? (
                <>
                  <div
                    className="category-tabs"
                    role="tablist"
                    aria-label="Menu category"
                  >
                    {["Burgers", "Sides & more", "Drinks"].map((tab) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={category === tab}
                        aria-controls="menu-products"
                        onClick={() => setCategory(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div
                    id="menu-products"
                    className="menu-products"
                    role="tabpanel"
                    aria-label={category}
                  >
                    {products
                      .filter((product) => product.category === category)
                      .map((product) => (
                        <motion.article
                          className="product-row"
                          key={product.name}
                          initial={reduced ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <img
                            src={`/assets/images/${product.image}.webp`}
                            alt={`${product.category} ingredient and serving inspiration`}
                            loading="lazy"
                          />
                          <div>
                            <h3>{product.name}</h3>
                            <p>{product.note}</p>
                            <strong>{money(product.price)}</strong>
                          </div>
                          <div className="quantity">
                            {bag[product.name] ? (
                              <>
                                <button
                                  onClick={() => updateBag(product.name, -1)}
                                  aria-label={`Remove one ${product.name}`}
                                >
                                  <FiMinus />
                                </button>
                                <span aria-live="polite">
                                  {bag[product.name]}
                                </span>
                              </>
                            ) : null}
                            <button
                              onClick={() => updateBag(product.name, 1)}
                              aria-label={`Add ${product.name}`}
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </motion.article>
                      ))}
                  </div>
                </>
              ) : (
                <div className="order-review">
                  {products
                    .filter((p) => bag[p.name])
                    .map((product) => (
                      <div key={product.name}>
                        <span>
                          {bag[product.name]} × {product.name}
                        </span>
                        <strong>
                          {money(product.price * bag[product.name])}
                        </strong>
                      </div>
                    ))}
                  <p>
                    Your selection is ready to copy. This demo does not send
                    orders to a restaurant.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setReview(false)}
                  >
                    ← Keep exploring
                  </button>
                </div>
              )}
              <div className="bag-footer">
                <div>
                  <FiShoppingBag />
                  <span>
                    {bagCount} {bagCount === 1 ? "item" : "items"}
                    <strong>{money(total)}</strong>
                  </span>
                </div>
                <button
                  className="pill-button"
                  disabled={!bagCount}
                  onClick={review ? copyOrder : () => setReview(true)}
                >
                  <span>
                    {review
                      ? copied
                        ? "Order copied"
                        : "Copy my order"
                      : "Review my order"}
                  </span>
                  {copied && review ? <FiCheck /> : <FiArrowRight />}
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
