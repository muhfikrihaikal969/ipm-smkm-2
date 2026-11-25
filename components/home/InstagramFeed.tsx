import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { Reveal, RevealText } from "@/components/Reveal";

export default function InstagramFeed() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200/80 bg-slate-50 py-16 [contain-intrinsic-size:auto_320px] [content-visibility:auto]">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white shadow-lg">
            <FaInstagram size={24} />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Ikuti Perkembangan Kami di Instagram
          </h2>
        </Reveal>

        <RevealText
          delay={160}
          className="mx-auto mt-2 max-w-xl text-xs font-medium text-slate-600 sm:text-sm"
          text="Dapatkan dokumentasi harian, info keseruan acara, dan konten kreatif langsung di akun resmi @ipmsmkmuda_."
        />

        <Reveal delay={260} className="mt-6 flex justify-center">
          <Link
            href="https://www.instagram.com/ipmsmkmuda_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-slate-950 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <FaInstagram size={16} />
            <span>@ipmsmkmuda_</span>
            <ArrowRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}