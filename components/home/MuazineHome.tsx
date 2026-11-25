import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { Reveal, RevealText } from "@/components/Reveal";

const posts = [
  { url: "https://www.instagram.com/p/Dae_yafyHaT/", title: "Dokumentasi Kegiatan IPM" },
  { url: "https://www.instagram.com/p/DW2lSfBEqrw/", title: "Info & Bulletin Terbaru" },
  { url: "https://www.instagram.com/p/DT0Tgl2ktdE/", title: "Kajian Rutin Pelajar" },
];

export default function MuazineHome() {
  return (
    <section className="relative overflow-hidden border-t border-slate-800 bg-slate-950 py-20 [contain-intrinsic-size:auto_560px] [content-visibility:auto]">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <Reveal>
            <p className="font-mono text-xs font-bold uppercase tracking-[4px] text-amber-400">
              Muazine Media
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-2 text-3xl font-black text-white md:text-5xl">
              Konten Kami di <span className="text-emerald-400">Instagram</span>
            </h2>
          </Reveal>
          <RevealText
            delay={160}
            className="mx-auto mt-3 max-w-xl text-xs font-medium text-slate-400 sm:text-sm"
            text="Temukan informasi terbaru, dokumentasi acara, dan postingan kreatif langsung di Instagram resmi PR IPM."
          />
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.url} delay={i * 90}>
              <Link
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-emerald-500/50 hover:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500 group-hover:text-slate-950">
                    <FaInstagram size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Post Instagram
                    </span>
                    <h3 className="text-xs font-bold text-white transition group-hover:text-emerald-400">
                      {post.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] font-bold text-emerald-400">
                  <span>Lihat Postingan</span>
                  <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12 text-center">
          <Link
            href="https://www.instagram.com/ipmsmkmuda_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-6 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            <FaInstagram size={16} />
            <span>Kunjungi @ipmsmkmuda_</span>
            <ArrowRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}