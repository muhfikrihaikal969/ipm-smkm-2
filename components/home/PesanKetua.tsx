import Image from "next/image";
import { Quote, Sparkles, Target, Compass } from "lucide-react";
import { Reveal, RevealText } from "@/components/Reveal";

export default function PesanKetua() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/60 bg-[#F4F6FB] pb-28 pt-20 [contain-intrinsic-size:auto_720px] [content-visibility:auto]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <Reveal>
            <span className="inline-block rounded-full border border-blue-200/60 bg-blue-100/80 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-ipm-blue">
              Kepemimpinan Pelajar
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Pesan Ketua Umum
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-linear-to-r from-[#005BAC] via-[#00A651] to-[#F4C430]" />
          </Reveal>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:mt-12 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <Reveal className="relative flex justify-center lg:col-span-5">
              <div className="group relative h-72 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs sm:h-88 sm:w-68">
                <Image
                  src="/anggota/bph/rendy-rafif-santoso.png"
                  alt="Rendy Rafif Santoso"
                  fill
                  sizes="(max-width: 640px) 240px, 272px"
                  quality={75}
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="inline-block rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    Ketua Umum 2026/2027
                  </span>
                </div>
              </div>
            </Reveal>

            <div className="space-y-5 lg:col-span-7">
              <Reveal delay={60}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-500">
                  <Quote size={20} />
                </div>
              </Reveal>

              <RevealText
                as="blockquote"
                delay={120}
                step={220}
                className="text-lg font-black italic leading-snug text-slate-800 sm:text-2xl"
                text="“Jika periode saya gagal, itu murni kesalahan saya. Tapi jika periode saya berhasil, itu karena pengurus saya yang hebat. Jadi jangan pernah untuk takut mencoba.”"
              />

              <Reveal delay={500}>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Rendy Rafif Santoso</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-ipm-blue">
                    PR IPM SMK Muhammadiyah 2 Cileungsi
                  </p>
                </div>
                <hr className="mt-5 border-slate-100" />
              </Reveal>

              <Reveal delay={600}>
                <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5">
                    <Compass className="shrink-0 text-ipm-blue" size={16} />
                    <span className="text-xs font-bold text-slate-700">Religius &amp; Inovatif</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5">
                    <Target className="shrink-0 text-ipm-green" size={16} />
                    <span className="text-xs font-bold text-slate-700">Kader Produktif</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5">
                    <Sparkles className="shrink-0 text-amber-500" size={16} />
                    <span className="text-xs font-bold text-slate-700">Dampak Nyata</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}