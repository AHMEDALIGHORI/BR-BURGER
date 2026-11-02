"use client";
import { useEffect, useRef } from "react";

export default function Grain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const surface = canvas.current;
    const ctx = surface?.getContext("2d");
    if (!surface || !ctx) return;
    surface.width = 384;
    surface.height = 384;
    const image = ctx.createImageData(384, 384);
    let seed = 73;
    for (let i = 0; i < image.data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const value = seed % 256;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
      image.data[i + 3] = 100;
    }
    ctx.putImageData(image, 0, 0);
  }, []);
  return (
    <canvas ref={canvas} className="noise noise-canvas" aria-hidden="true" />
  );
}
