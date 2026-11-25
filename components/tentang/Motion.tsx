"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/** Menandai elemen "masuk layar" sekali saja, lalu observer dilepas. */
function useInViewOnce<T extends Element>(
  threshold = 0.2,
  rootMargin = "0px 0px -8% 0px"
) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return [ref, seen] as const;
}

const idx = (n: number) => ({ "--i": n }) as CSSProperties;

/** Judul: setiap baris naik dari balik garis. */
export function RiseHeading({
  lines,
  as = "h2",
  className = "",
  delay = 0,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const [ref, seen] = useInViewOnce<HTMLElement>(0.3);
  const Comp = as as ElementType<any>;
  return (
    <Comp ref={ref} data-in={seen} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="rise-mask">
          <span className="rise-line" style={idx(i + delay)}>
            {line}
          </span>
        </span>
      ))}
    </Comp>
  );
}

/** Paragraf: setiap kalimat (atau bagian yang lo tentukan lewat `parts`) naik bergantian. */
export function RiseText({
  text,
  parts,
  as = "p",
  className = "",
  delay = 0,
}: {
  text?: string;
  parts?: string[];
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const [ref, seen] = useInViewOnce<HTMLElement>(0.15);
  const Comp = as as ElementType<any>;
  const items =
    parts ??
    (text ?? "").match(/[^.!?]+(?:[.!?]+["”’)]*)(?:\s+|$)|[^.!?]+$/g) ?? [
      text ?? "",
    ];

  return (
    <Comp ref={ref} data-in={seen} className={className}>
      {items.map((s, i) => (
        <Fragment key={i}>
          <span className="rise-inline" style={idx(i + delay)}>
            {s.trim()}
          </span>{" "}
        </Fragment>
      ))}
    </Comp>
  );
}

/** Blok apa pun: naik + muncul halus. `delay` buat stagger antar item. */
export function Rise({
  as = "div",
  className = "",
  delay = 0,
  children,
}: {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const [ref, seen] = useInViewOnce<HTMLElement>(0.15);
  const Comp = as as ElementType<any>;
  return (
    <Comp
      ref={ref}
      data-in={seen}
      className={`rise-block ${className}`}
      style={idx(delay)}
    >
      {children}
    </Comp>
  );
}
