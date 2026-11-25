import { BookOpen, GraduationCap, Handshake, Rocket } from "lucide-react";
import { Rise, RiseHeading, RiseText } from "./Motion";
import Wave from "./Wave";

const values = [
  {
    icon: BookOpen,
    title: "Islami",
    desc: "Menjadikan Al-Qur'an dan As-Sunnah sebagai pedoman dalam setiap aktivitas organisasi.",
    chip: "bg-[#005BAC] text-white",
  },
  {
    icon: GraduationCap,
    title: "Berilmu",
    desc: "Mendorong budaya belajar, berpikir kritis, dan terus mengembangkan wawasan.",
    chip: "bg-[#00A651] text-white",
  },
  {
    icon: Handshake,
    title: "Kolaboratif",
    desc: "Mengutamakan kerja sama, saling menghargai, dan semangat gotong royong.",
    chip: "bg-[#F4C430] text-slate-900",
  },
  {
    icon: Rocket,
    title: "Berkemajuan",
    desc: "Berani berinovasi serta mampu memberikan manfaat bagi sekolah maupun masyarakat.",
    chip: "bg-[#005BAC] text-white",
  },
];

export default function Values() {
  return (
    <section className="relative bg-[#F8FCFF] pt-24 pb-16 sm:pt-36 sm:pb-24">
      {/* warna = section sebelumnya (Purpose) */}
      <Wave color="#005BAC" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <RiseHeading
          lines={["Nilai yang kami junjung"]}
          className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
        />
        <RiseText
          text="Setiap kegiatan dan program kerja PR IPM SMK Muhammadiyah 2 Cileungsi berlandaskan nilai-nilai yang menjadi identitas pelajar Muhammadiyah."
          className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
          delay={2}
        />

        <ul className="mt-12 divide-y divide-slate-200 border-y border-slate-200 sm:mt-16">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <Rise
                as="li"
                key={item.title}
                className="grid items-start gap-4 py-8 sm:grid-cols-[auto_1fr_1.4fr] sm:items-center sm:gap-8"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.chip}`}
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="text-base leading-7 text-slate-600">
                  {item.desc}
                </p>
              </Rise>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
