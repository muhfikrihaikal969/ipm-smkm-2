"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Play, FolderOpen } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const documentation = [
  { title: "Rapat Kerja Pimpinan", image: "/media/rakerpim.jpg", drive: "https://drive.google.com/drive/folders/1NzOMtiWd0w5djxcmem-jsd8vjv17zIHJ" },
  { title: "Pra Fortasi", image: "/media/prafor.jpg", drive: "https://drive.google.com/drive/folders/1WCq3bSOyGOiuHPctxnDCn5QQLBH68AtK" },
  { title: "FORTASI 2026", image: "/media/fortasi1.jpg", drive: "https://drive.google.com/drive/folders/1osDpYYU7WICzOpHuwWE4dlNmHtJ17SRb" },
  { title: "Classmeet Futsal", image: "/media/classmeetfutsal.jpg", drive: "https://drive.google.com/drive/folders/1WSGffv0_zpxjnFH0HzxIB914WhpLjWk8" },
];

/**
 * Slider CSS scroll-snap: pengganti Swiper (tanpa library, tanpa slide kloningan).
 * Autoplay hanya jalan saat slider terlihat dan tidak disentuh/di-hover.
 */
function PhotoSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      goTo((activeRef.current + 1) % documentation.length);
    }, 4000);
    return () => clearInterval(id);
  }, [inView, goTo]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  };

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerEnter={pause}
        onPointerLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {documentation.map((item) => (
          <div key={item.title} className="w-full shrink-0 snap-center">
            <Link
              href={item.drive}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              className="group relative block h-72 overflow-hidden rounded-3xl border border-white/10 shadow-lg"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                quality={70}
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Google Drive
                  </span>
                  <h4 className="mt-0.5 text-base font-bold leading-tight text-white">{item.title}</h4>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white transition group-hover:bg-emerald-500">
                  <ExternalLink size={15} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {documentation.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Lihat album ${item.title}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function MediaSection() {
  const [playVideo, setPlayVideo] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#12163A] pb-20 pt-24 text-white [contain-intrinsic-size:auto_900px] [content-visibility:auto]">
      {/* Wave */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-16 w-full overflow-hidden leading-none sm:h-24">
        <svg viewBox="0 0 1440 120" className="h-full w-full fill-[#F4F6FB]" preserveAspectRatio="none">
          <path d="M0,0 L1440,0 L1440,30 C1080,110 360,10 0,60 Z" />
        </svg>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-6">
        <div className="mb-12 text-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[3px] text-amber-400 sm:text-sm">
              Galeri &amp; Media
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              Dokumentasi &amp; Highlight Video
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-blue-500 via-emerald-400 to-amber-400" />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* YouTube: thumbnail dulu, iframe baru dimuat saat diklik */}
          <Reveal className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Play size={14} className="fill-red-500 text-red-500" />
                  <span>Tonton Video Terbaru di YouTube Kami</span>
                </div>
                <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-red-400">
                  YouTube
                </span>
              </div>

              <div className="relative aspect-video w-full bg-black">
                {!playVideo ? (
                  <button
                    onClick={() => setPlayVideo(true)}
                    className="group relative flex h-full w-full items-center justify-center overflow-hidden"
                    aria-label="Putar video YouTube"
                  >
                    <Image
                      src="https://img.youtube.com/vi/cYE3bU4Pc4w/maxresdefault.jpg"
                      alt="Thumbnail video YouTube"
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      quality={70}
                      className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <Play size={28} className="translate-x-0.5 fill-white" />
                    </div>
                  </button>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/cYE3bU4Pc4w?autoplay=1"
                    title="Tonton Video Terbaru di YouTube Kami"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-4 lg:col-span-5">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <FolderOpen size={16} className="text-emerald-400" />
              Album Foto Terbaru
            </h3>
            <PhotoSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}