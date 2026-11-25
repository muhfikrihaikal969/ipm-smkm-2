import {
  GraduationCap,
  BookOpen,
  Megaphone,
  HeartHandshake,
  Trophy,
  Users,
} from "lucide-react";
import { Rise, RiseHeading, RiseText } from "./Motion";
import Wave from "./Wave";

const BLUE = "bg-[#005BAC] text-white";
const GREEN = "bg-[#00A651] text-white";
const YELLOW = "bg-[#F4C430] text-slate-900";

const activities = [
  {
    icon: GraduationCap,
    title: "Perkaderan",
    desc: "Membentuk karakter dan kepemimpinan pelajar melalui berbagai kegiatan kaderisasi.",
    chip: BLUE,
  },
  {
    icon: BookOpen,
    title: "Keilmuan",
    desc: "Mendorong budaya literasi, diskusi, kajian, dan pengembangan wawasan.",
    chip: GREEN,
  },
  {
    icon: Megaphone,
    title: "Media & Informasi",
    desc: "Menyebarkan informasi kegiatan melalui media sosial dan platform digital.",
    chip: YELLOW,
  },
  {
    icon: HeartHandshake,
    title: "Dakwah & Sosial",
    desc: "Menanamkan nilai Islami melalui kajian, aksi sosial, dan kepedulian sesama.",
    chip: BLUE,
  },
  {
    icon: Trophy,
    title: "Prestasi",
    desc: "Mengembangkan potensi pelajar melalui lomba, olahraga, seni, dan kreativitas.",
    chip: GREEN,
  },
  {
    icon: Users,
    title: "Kolaborasi",
    desc: "Membangun kerja sama dengan sekolah, ortom Muhammadiyah, dan masyarakat.",
    chip: YELLOW,
  },
];

export default function Activities() {
  return (
    <section className="relative bg-white pt-24 pb-16 sm:pt-36 sm:pb-24">
      {/* warna = section sebelumnya (Values) */}
      <Wave color="#F8FCFF" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <RiseHeading
              lines={["Apa yang", "dilakukan IPM?"]}
              className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
            />
            <RiseText
              text="PR IPM SMK Muhammadiyah 2 Cileungsi menjalankan enam bidang kegiatan untuk membentuk pelajar yang Islami, berprestasi, kreatif, dan berjiwa pemimpin."
              className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg"
              delay={2}
            />
          </div>
        </div>

        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {activities.map((item, i) => {
            const Icon = item.icon;
            return (
              <Rise
                as="li"
                key={item.title}
                delay={i % 2}
                className="border-t border-slate-200 pt-6"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.chip}`}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-5 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-600">
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
