"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const WORDS = [
  "Pimpinan Ranting",
  "IPM SMK Muhammadiyah 2 Cileungsi",
  "Berjiwa Islami",
  "Berorientasi, Prestasi!",
];

// Animasi masuk murni CSS: jalan sebelum hydration, tanpa JS animasi.
// fill-mode "backwards" supaya efek hover (scale) pada tombol tidak tertimpa.
const RISE = "[animation:ipm-rise_700ms_cubic-bezier(0.22,1,0.36,1)_backwards] motion-reduce:[animation:none]";

/**
 * Typewriter tanpa React state: teks diubah langsung lewat ref,
 * jadi tidak ada re-render 12-25x per detik.
 */
function Typewriter() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = WORDS[0];
      return;
    }

    let word = 0;
    let chars = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = WORDS[word];
      if (!deleting) {
        chars += 1;
        el.textContent = current.slice(0, chars);
        if (chars === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1500);
          return;
        }
        timer = setTimeout(tick, 80);
      } else {
        chars -= 1;
        el.textContent = current.slice(0, chars);
        if (chars === 0) {
          deleting = false;
          word = (word + 1) % WORDS.length;
          timer = setTimeout(tick, 300);
          return;
        }
        timer = setTimeout(tick, 40);
      }
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className={`mt-2 block min-h-[1.2em] text-ipm-yellow [animation-delay:120ms] ${RISE}`}
      aria-label={WORDS.join(", ")}
    >
      <span ref={textRef} aria-hidden="true" />
      <span className="animate-pulse text-white" aria-hidden="true">|</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-ipm-blue">
      <style>{`@keyframes ipm-rise{from{opacity:0;transform:translateY(24px)}}`}</style>

      {/* BACKGROUND: tanpa blur/filter, hanya gradient statis */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero.jpg"
          alt="PR IPM SMK Muhammadiyah 2 Cileungsi"
          fill
          priority
          sizes="100vw"
          quality={60}
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-ipm-blue/60" />
        <div className="absolute inset-0 bg-linear-to-br from-[#005BAC]/70 via-[#005BAC]/25 to-[#00A651]/60" />

        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[45px_45px]" />

        {/* Pengganti blob blur-3xl: radial-gradient, tidak memakai filter */}
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(0,91,172,0.45),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(0,166,81,0.45),transparent_70%)]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto min-h-svh max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="flex min-h-svh w-full flex-col justify-center pb-24 pt-12 text-center lg:w-[52%] lg:items-start lg:justify-center lg:pb-12 lg:pt-0 lg:text-left">
          <h1 className="text-3xl font-black leading-[1.05] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            <span className={`block ${RISE}`}>Welcome to</span>
            <Typewriter />
            <span className={`mt-2 block [animation-delay:240ms] ${RISE}`}>
              Official Website!
            </span>
          </h1>

          <a
            href="https://forms.gle/5kLd5hHJN1vmwrXn7"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex w-fit self-center items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ipm-blue shadow-2xl transition-transform hover:scale-105 hover:bg-ipm-yellow active:scale-95 sm:px-8 sm:py-4 sm:text-base lg:self-start [animation-delay:380ms] ${RISE}`}
          >
            Join Us
            <ArrowRight size={18} />
          </a>
        </div>

        {/* FOTO KETUM (desktop saja) */}
        <div className="pointer-events-none absolute bottom-0 right-0 z-20 hidden h-[92vh] w-[55%] lg:block">
          {/* Pengganti drop-shadow filter: bayangan lantai statis */}
          <div className="absolute inset-x-[10%] bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.4),transparent_70%)]" />
          <Image
            src="/anggota/bph/rendy-rafif-santoso.png"
            alt="Ketua Umum PR IPM SMK Muhammadiyah 2 Cileungsi"
            fill
            sizes="55vw"
            quality={75}
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* WAVE */}
      <div className="pointer-events-none absolute -bottom-px left-0 z-30 w-full overflow-hidden leading-none">
        <svg
          className="block h-24 w-full sm:h-28 lg:h-32"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            fill="white"
            d="M0 110 C180 125 300 155 480 150 C650 145 760 125 960 112 C1140 100 1270 88 1440 78 L1440 185 L0 185 Z"
          />
        </svg>
      </div>
    </section>
  );
}