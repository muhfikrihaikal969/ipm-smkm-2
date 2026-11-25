"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Pengganti framer-motion untuk animasi masuk.
 * - Satu IntersectionObserver dipakai bersama oleh semua elemen.
 * - Hanya animasi opacity + transform (compositor, tanpa layout/paint).
 * - Berjalan sekali, observer dilepas setelah elemen tampil.
 * - Mengikuti prefers-reduced-motion.
 */

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observe(el: Element, cb: () => void) {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          sharedObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
  }
  callbacks.set(el, cb);
  sharedObserver.observe(el);
  return () => {
    callbacks.delete(el);
    sharedObserver?.unobserve(el);
  };
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // setState hanya dipanggil dari callback observer (sistem eksternal), bukan langsung di body effect.
    return observe(el, () => setShown(true));
  }, []);

  return [ref, shown] as const;
}

const BASE =
  "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const HIDDEN =
  "opacity-0 translate-y-5 motion-reduce:opacity-100 motion-reduce:translate-y-0";
const VISIBLE = "opacity-100 translate-y-0";

type RevealProps = {
  children: ReactNode;
  delay?: number; // ms
  className?: string;
  as?: ElementType;
};

/** Satu blok naik dari bawah ke atas. */
export function Reveal({ children, delay = 0, className = "", as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const [ref, shown] = useReveal<HTMLElement>();
  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  return (
    <Tag
      ref={ref}
      style={style}
      className={`${BASE} ${shown ? VISIBLE : HIDDEN} ${className}`}
    >
      {children}
    </Tag>
  );
}

type RevealTextProps = {
  text: string;
  delay?: number; // ms, awal untuk kalimat pertama
  step?: number; // ms, jeda antar kalimat
  className?: string;
  as?: ElementType;
};

/** Teks dipecah per kalimat, tiap kalimat naik dari bawah secara berurutan. */
export function RevealText({
  text,
  delay = 0,
  step = 140,
  className = "",
  as,
}: RevealTextProps) {
  const Tag = (as ?? "p") as ElementType;
  const [ref, shown] = useReveal<HTMLElement>();
  const sentences = text.split(/(?<=[.!?”"])\s+/).filter(Boolean);

  return (
    <Tag ref={ref} className={className}>
      {sentences.map((sentence, i) => (
        <span
          key={i}
          style={{ transitionDelay: `${delay + i * step}ms` }}
          className={`inline-block ${BASE} ${shown ? VISIBLE : HIDDEN}`}
        >
          {sentence}
          {i < sentences.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}