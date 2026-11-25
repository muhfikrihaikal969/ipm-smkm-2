import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, HeartHandshake } from "lucide-react";
import { Reveal, RevealText } from "@/components/Reveal";

const POINTS = [
  {
    icon: HeartHandshake,
    title: "Berjiwa Islami",
    text: "Menanamkan nilai-nilai Islam dalam setiap kegiatan, sehingga terbentuk karakter pelajar yang berakhlak dan bertanggung jawab.",
    box: "bg-ipm-blue/10 group-hover:bg-blue-600",
    iconColor: "text-ipm-blue",
    titleHover: "group-hover:text-blue-600",
  },
  {
    icon: Sparkles,
    title: "Berkembang Bersama",
    text: "Menjadi ruang belajar kepemimpinan, komunikasi, kreativitas, hingga pengalaman organisasi bagi seluruh anggota.",
    box: "bg-ipm-green/10 group-hover:bg-emerald-600",
    iconColor: "text-ipm-green",
    titleHover: "group-hover:text-emerald-600",
  },
  {
    icon: Trophy,
    title: "Berorientasi Prestasi",
    text: "Mendorong setiap kader untuk terus berprestasi, berkarya, dan memberikan manfaat bagi sekolah maupun masyarakat.",
    box: "bg-ipm-yellow/20 group-hover:bg-amber-500",
    iconColor: "text-[#D4A000]",
    titleHover: "group-hover:text-amber-600",
  },
];

export default function About() {
  return (
    <section className="relative overflow-hidden bg-white py-16 [contain-intrinsic-size:auto_760px] [content-visibility:auto] sm:py-24">
      {/* Dekorasi statis (sebelumnya animasi infinite) */}
      <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-ipm-green/15" />
      <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full bg-ipm-blue/15" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[4px] text-ipm-blue sm:text-sm">
              Tentang Kami
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Tempat Berkembang dan Berkarya
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-linear-to-r from-[#005BAC] via-[#00A651] to-[#F4C430]" />
          </Reveal>

          <RevealText
            delay={220}
            className="mx-auto mt-6 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base md:text-lg"
            text="PR IPM SMK Muhammadiyah 2 Cileungsi hadir sebagai wadah bagi pelajar untuk belajar memimpin, mengembangkan potensi, serta berkarya bersama dalam semangat Islam Berkemajuan."
          />
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, text, box, iconColor, titleHover }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="group rounded-3xl border border-transparent p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-slate-100 hover:bg-slate-50/80">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs transition-colors duration-300 sm:h-16 sm:w-16 ${box}`}
                >
                  <Icon
                    className={`${iconColor} transition-colors group-hover:text-white`}
                    size={28}
                  />
                </div>

                <h3
                  className={`mt-4 text-lg font-bold text-slate-900 transition-colors sm:text-xl ${titleHover}`}
                >
                  {title}
                </h3>

                <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-10 flex justify-center sm:mt-14">
          <Link
            href="/tentang"
            className="group inline-flex items-center gap-2.5 rounded-full border-2 border-ipm-blue px-6 py-3.5 text-xs font-bold text-ipm-blue shadow-sm transition-all duration-300 hover:bg-ipm-blue hover:text-white hover:shadow-md sm:px-8 sm:py-4 sm:text-sm"
          >
            <span>Yuk, Kenali Kami Lebih Dekat!</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}