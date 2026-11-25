"use client";

import Image from "next/image";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Rise, RiseHeading, RiseText } from "./Motion";
import Wave from "./Wave";

const stats = [
  { value: 47, title: "Anggota aktif", color: "#005BAC" },
  { value: 8, title: "Bidang", color: "#00A651" },
  { value: 57, title: "Program kerja", color: "#F4C430" },
];

export default function AboutIPM() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="relative bg-white pt-24 pb-16 sm:pt-36 sm:pb-24">
      {/* warna = section sebelumnya (Hero) */}
      <Wave color="#F8FCFF" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        {/* Logo */}
        <Rise className="lg:col-span-5">
          <div className="flex aspect-square items-center justify-center rounded-[55%_45%_50%_50%/45%_55%_45%_55%] bg-[#F8FCFF] p-12 ring-1 ring-slate-100 lg:sticky lg:top-28">
            <Image
              src="/logo/logo-ipm.png"
              alt="Logo Ikatan Pelajar Muhammadiyah"
              width={260}
              height={260}
              className="h-44 w-44 object-contain sm:h-60 sm:w-60"
            />
          </div>
        </Rise>

        {/* Teks */}
        <div className="lg:col-span-7">
          <RiseHeading
            lines={["Mengenal Ikatan Pelajar Muhammadiyah"]}
            className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
          />

          <div className="mt-8 max-w-prose space-y-5 text-base leading-8 text-slate-600 sm:text-lg">
            <RiseText text="Ikatan Pelajar Muhammadiyah adalah organisasi otonom Muhammadiyah yang merupakan gerakan Islam, dakwah amar ma’ruf nahi mungkar di kalangan pelajar, berakidah Islam dan bersumber pada Al-Qur’an dan Al-Sunnah. IPM saat ini terdapat di 34 provinsi se-Indonesia." />
            <RiseText text="Lambang IPM berupa segi lima berbentuk pena berwarna hijau yang berarti keabadian dan keilahian, bergambar matahari kuning (melambangkan ortom Muhammadiyah dan keagungan) dan buku putih di tengahnya (melambangkan pengetahuan dan kesucian). Pada bulatan matahari tertulis Nuu Wal Qalami Wamaa Yasthuruun (demi pena dan apa yang dituliskannya), semboyan IPM." />
            <RiseText text="Latar belakang berdirinya IPM tidak terlepas dari berdirinya Muhammadiyah. IPM diperlukan untuk mendukung misi Muhammadiyah di tengah situasi politik Indonesia masa Orde Lama yang sedemikian berat dan sulit. Pada rintisan pendirian organisasi pelajar Muhammadiyah tahun 1985 di Garut, ditetapkan bahwa organisasi Pelajar Muhammadiyah berada dalam pengawasan Pemuda Muhammadiyah." />
          </div>

          {/* Statistik */}
          <dl className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {stats.map((item, i) => (
              <Rise key={item.title} delay={i}>
                <div
                  className="border-t-4 pt-4"
                  style={{ borderColor: item.color }}
                >
                  <dd className="font-heading text-5xl font-extrabold tabular-nums text-slate-900">
                    {inView ? (
                      <CountUp end={item.value} duration={2} separator="," />
                    ) : (
                      0
                    )}
                  </dd>
                  <dt className="mt-1 text-sm font-medium text-slate-600 sm:text-base">
                    {item.title}
                  </dt>
                </div>
              </Rise>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
