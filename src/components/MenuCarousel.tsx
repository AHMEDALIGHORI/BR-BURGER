"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Product = { name: string; image: string; note: string; category: string };
export default function MenuCarousel({
  products,
  selected,
  onSelect,
  onOpen,
}: {
  products: Product[];
  selected: number;
  onSelect: (index: number) => void;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const startX = useRef<number | null>(null);
  const previous = useRef(selected);
  const [rotation, setRotation] = useState(-selected * 36);
  useEffect(() => {
    let delta = selected - previous.current;
    if (delta > 5) delta -= 10;
    if (delta < -5) delta += 10;
    setRotation((value) => value - delta * 36);
    previous.current = selected;
  }, [selected]);
  const select = (offset: number) =>
    onSelect((selected + offset + products.length) % products.length);
  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
    gsap.to(event.currentTarget, {
      rotationY: x * 14,
      rotationX: -y * 12,
      scale: 1.035,
      duration: 0.4,
      ease: "power2.out",
    });
  };
  const reset = (event: PointerEvent<HTMLButtonElement>) =>
    gsap.to(event.currentTarget, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      duration: 0.8,
      ease: "elastic.out(1,.5)",
    });
  return (
    <div
      className="menu-carousel"
      role="region"
      aria-label="3D menu collection"
      aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          select(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div
        className="collection-stage"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (
            startX.current !== null &&
            Math.abs(event.clientX - startX.current) > 45
          )
            select(event.clientX < startX.current ? 1 : -1);
          startX.current = null;
        }}
      >
        <motion.div
          className="collection-ring"
          animate={{ rotateY: rotation }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 60, damping: 19, mass: 1.1 }
          }
        >
          {products.map((product, index) => {
            const distance = Math.min(
              Math.abs(index - selected),
              products.length - Math.abs(index - selected),
            );
            return (
              <div
                className={`collection-position ${index === selected ? "is-selected" : ""}`}
                key={product.name}
                aria-hidden={index !== selected}
                style={{
                  transform: `rotateY(${index * 36}deg) translateZ(var(--ring-radius))`,
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.32 : 0,
                }}
              >
                <button
                  className="collection-card"
                  tabIndex={index === selected ? 0 : -1}
                  onClick={onOpen}
                  onPointerMove={tilt}
                  onPointerLeave={reset}
                  aria-label={`Explore ${product.name === "Double Cheese" ? "Double Cheese Burger" : product.name}`}
                >
                  <div className="card-topline" aria-hidden="true">
                    <span>THE BR COLLECTION</span>
                    <span>{String(index + 1).padStart(2, "0")} / 10</span>
                  </div>
                  <div className="card-photo">
                    <img
                      src={`/assets/images/${product.image}.webp`}
                      alt={product.name}
                      loading="lazy"
                      draggable={false}
                      width="360"
                      height="320"
                    />
                  </div>
                  <h3 className="collection-title">
                    {(product.name === "Double Cheese"
                      ? "Double Cheese Burger"
                      : product.name
                    )
                      .split(" ")
                      .map((word, i) => (
                        <span
                          key={i}
                          className={i === 0 ? "orange" : i === 1 ? "gold" : ""}
                        >
                          {word}{" "}
                        </span>
                      ))}
                  </h3>
                  <div className="card-bottomline" aria-hidden="true">
                    <span>{product.category}</span>
                    <FiArrowUpRight />
                  </div>
                </button>
              </div>
            );
          })}
        </motion.div>
      </div>
      <div className="collection-controls">
        <button aria-label="Previous menu item" onClick={() => select(-1)}>
          <FiArrowLeft />
        </button>
        <span aria-live="polite">
          {String(selected + 1).padStart(2, "0")} <i /> 10
        </span>
        <button aria-label="Next menu item" onClick={() => select(1)}>
          <FiArrowRight />
        </button>
      </div>
      <p className="collection-description" aria-live="polite">
        {products[selected].note}
      </p>
      <div className="collection-index" aria-label="Choose a menu item">
        {products.map((product, index) => (
          <button
            key={product.name}
            aria-label={`Show ${product.name}`}
            aria-pressed={index === selected}
            onClick={() => onSelect(index)}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
