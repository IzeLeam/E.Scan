"use client";

import { useRef, useState } from "react";

/** Carrousel en scroll-snap natif : swipe au doigt, points cliquables. */
export default function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Aucune image
      </div>
    );
  }

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={(e) => {
          const t = e.currentTarget;
          setIndex(Math.round(t.scrollLeft / t.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={src} className="flex h-64 w-full shrink-0 snap-center items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- images distantes Leclerc, déjà redimensionnées par leur CDN */}
            <img
              src={withSize(src)}
              alt={`${alt} – image ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Le CDN media.e.leclerc accepte des paramètres de taille, comme sur le site. */
function withSize(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname !== "media.e.leclerc" || url.search) return src;
    url.search = "?fit=fit&fmt=webp&qlt=85&wid=600&hei=600";
    return url.toString();
  } catch {
    return src;
  }
}
