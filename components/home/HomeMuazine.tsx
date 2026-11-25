import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight, BookOpen } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Reveal } from "@/components/Reveal";

type MuazineItem = {
  slug: string;
  judul: string;
  cover: string;
  kategori: string;
  tanggal: string;
};

type MuazineRow = {
  slug: string | null;
  judul: string | null;
  gambar: string | null;
  kategori: string | null;
  created_at: string | null;
};

const DEFAULT_ARTIKEL: MuazineItem[] = [
  {
    slug: "muazine-edisi-1",
    judul: "Selamat Datang di Website Resmi PR IPM SMK Muhammadiyah 2 Cileungsi",
    cover: "/muazine/default.jpg",
    kategori: "MUAZINE",
    tanggal: "25 Agustus 2026",
  },
  {
    slug: "fortasi-2026",
    judul: "Keseruan Pelaksanaan FORTASI SMK Muda Cileungsi Periode Ini",
    cover: "/muazine/default.jpg",
    kategori: "BERITA",
    tanggal: "20 Agustus 2026",
  },
  {
    slug: "kajian-pelajar",
    judul: "Kajian Rutin Pelajar: Membangun Karakter Berjiwa Islami",
    cover: "/muazine/default.jpg",
    kategori: "KDI",
    tanggal: "15 Agustus 2026",
  },
];

// Diambil di server: tidak ada client Supabase di bundle browser,
// tidak ada fetch setelah hydration, dan tidak ada layout yang berganti.
async function getLatestMuazine(): Promise<MuazineItem[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("muazine")
      .select("slug, judul, gambar, kategori, created_at")
      .eq("status", "terbit")
      .order("created_at", { ascending: false })
      .limit(3);

    const rows = (data ?? []) as MuazineRow[];
    if (rows.length === 0) return DEFAULT_ARTIKEL;

    return rows.map((item) => ({
      slug: item.slug || "artikel",
      judul: item.judul || "Judul Artikel",
      cover: item.gambar || "/muazine/default.jpg",
      kategori: (item.kategori || "BERITA").toUpperCase(),
      tanggal: item.created_at
        ? new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })
        : "",
    }));
  } catch {
    return DEFAULT_ARTIKEL;
  }
}

export default async function HomeMuazine() {
  const articles = await getLatestMuazine();

  return (
    <section className="relative overflow-hidden bg-white py-20 [contain-intrinsic-size:auto_640px] [content-visibility:auto]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[4px] text-ipm-blue sm:text-sm">
                Muazine &amp; Literasi
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Kabar &amp; Opini Terbaru
              </h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <Link
              href="/muazine"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ipm-blue hover:underline"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((item, i) => (
            <Reveal key={item.slug} delay={i * 100}>
              <Link
                href={`/muazine/${item.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 shadow-xs transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  <Image
                    src={item.cover}
                    alt={item.judul}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={70}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-extrabold text-white">
                    {item.kategori}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition group-hover:text-ipm-blue">
                    {item.judul}
                  </h3>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{item.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-ipm-blue">
                      <BookOpen size={13} />
                      <span>Baca</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}