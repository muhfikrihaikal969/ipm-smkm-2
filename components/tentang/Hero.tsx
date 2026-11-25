import Link from "next/link";
import { Rise, RiseHeading, RiseText } from "./Motion";

export default function HeroTentang() {
  return (
    <section className="relative overflow-hidden bg-[#F8FCFF] pt-28 pb-24 sm:pt-36 sm:pb-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Teks */}
        <div>
          <div
            className="bar-grow flex h-1.5 w-24 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span className="flex-1 bg-[#005BAC]" />
            <span className="flex-1 bg-[#00A651]" />
            <span className="flex-1 bg-[#F4C430]" />
          </div>

          <RiseHeading
            as="h1"
            lines={["PR IPM SMK Muhammadiyah 2 Cileungsi"]}
            className="font-heading mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl"
            delay={1}
          />

          <RiseText
            text="PR IPM SMK Muhammadiyah 2 Cileungsi adalah organisasi pelajar Muhammadiyah. Kami menjadi wadah kaderisasi, pengembangan potensi, dan kepemimpinan untuk membentuk pelajar Islami yang berilmu, berprestasi, dan berkemajuan."
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
            delay={4}
          />

          <Rise delay={7} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/organisasi/bph"
              className="rounded-full bg-[#005BAC] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#004a8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
            >
              Lihat semua pengurus
            </Link>
            <Link
              href="/muazine"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#005BAC] hover:text-[#005BAC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
            >
              Baca Muazine
            </Link>
          </Rise>
        </div>

        {/* Visual: huruf Nun dalam bentuk organik */}
        <Rise delay={3} className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div
            className="absolute -bottom-3 -right-3 h-full w-full rounded-[38%_62%_46%_54%/56%_44%_56%_44%] bg-[#F4C430]"
            aria-hidden="true"
          />
          <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[62%_38%_54%_46%/48%_56%_44%_52%] bg-linear-to-br from-[#005BAC] to-[#00A651] px-10 text-center">
            <span
              lang="ar"
              aria-hidden="true"
              className="font-arabic text-[9rem] leading-none text-white sm:text-[12rem]"
            >
              ن
            </span>
            <p className="max-w-[15rem] text-sm leading-relaxed text-white/85 sm:text-base">
              Nuun wal qalami wamaa yasthuruun. Demi pena dan apa yang
              dituliskannya.
            </p>
          </div>
        </Rise>
      </div>
    </section>
  );
}
