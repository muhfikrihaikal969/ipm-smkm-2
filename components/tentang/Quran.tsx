import { Rise, RiseHeading, RiseText } from "./Motion";
import Wave from "./Wave";

export default function Quran() {
  return (
    <section className="relative bg-[#F8FCFF] pt-24 pb-16 sm:pt-36 sm:pb-24">
      {/* warna = section sebelumnya (Activities) */}
      <Wave color="#FFFFFF" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <RiseHeading
          lines={["Landasan Al-Qur’an"]}
          className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
        />

        {/* Ayat */}
        <Rise
          as="figure"
          delay={2}
          className="relative mt-10 overflow-hidden rounded-[2rem] bg-linear-to-br from-[#005BAC] to-[#0A74CF] px-6 pt-12 pb-24 text-center sm:mt-14 sm:px-12 sm:pt-20 sm:pb-32"
        >
          <blockquote className="relative z-10">
            <p
              lang="ar"
              dir="rtl"
              className="font-arabic text-5xl leading-[1.7] text-white sm:text-7xl sm:leading-[1.7]"
            >
              ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ
            </p>
            <p className="mx-auto mt-6 max-w-xl text-lg italic leading-relaxed text-blue-100 sm:text-xl">
              &ldquo;Nun. Demi pena dan apa yang mereka tuliskan.&rdquo;
            </p>
          </blockquote>
          <figcaption className="relative z-10 mt-8 inline-block rounded-full bg-[#F4C430] px-4 py-1.5 text-sm font-semibold text-slate-900">
            QS. Al-Qalam ayat 1
          </figcaption>

          <Wave
            position="bottom"
            color="rgba(255,255,255,0.14)"
            className="h-12 sm:h-20"
          />
        </Rise>

        {/* Makna */}
        <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <RiseHeading
              as="h3"
              lines={["Makna ayat"]}
              className="font-heading text-2xl font-bold text-slate-900"
            />
            <div className="mt-4 max-w-prose space-y-4 text-base leading-8 text-slate-600">
              <RiseText text="Ayat ini menunjukkan betapa pentingnya ilmu pengetahuan, pendidikan, serta budaya membaca dan menulis dalam kehidupan seorang muslim. Pena menjadi simbol lahirnya ilmu yang bermanfaat, sedangkan tulisan menjadi sarana menyebarkan kebaikan kepada sesama." />
              <RiseText text="Sebagai organisasi pelajar Muhammadiyah, PR IPM SMK Muhammadiyah 2 Cileungsi menjadikan semangat tersebut sebagai dasar dalam membangun pelajar yang gemar belajar, berpikir kritis, berakhlak mulia, serta mampu memberikan manfaat bagi sekolah maupun masyarakat." />
            </div>
          </div>

          <Rise
            as="aside"
            delay={1}
            className="self-start rounded-2xl border-l-4 border-[#00A651] bg-white p-6 ring-1 ring-slate-200 lg:col-span-2"
          >
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Nilai yang dapat dipetik
            </h3>
            <p className="mt-2 text-base leading-7 text-slate-600">
              Ilmu merupakan cahaya kehidupan, dan setiap pelajar memiliki
              tanggung jawab untuk terus belajar, berkarya, serta menyebarkan
              manfaat melalui ilmu yang dimilikinya.
            </p>
          </Rise>
        </div>
      </div>
    </section>
  );
}
