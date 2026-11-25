import { Rise, RiseHeading, RiseText } from "./Motion";
import Wave from "./Wave";

const pillars = [
  { label: "Berilmu", dot: "#FFFFFF" },
  { label: "Berakhlak mulia", dot: "#00A651" },
  { label: "Terampil", dot: "#F4C430" },
];

export default function Purpose() {
  return (
    <section className="relative bg-[#005BAC] pt-24 pb-16 sm:pt-36 sm:pb-24">
      {/* warna = section sebelumnya (AboutIPM) */}
      <Wave color="#FFFFFF" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <RiseHeading
          lines={["Mengapa IPM hadir?"]}
          className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:col-span-4"
        />

        <div className="lg:col-span-8">
          <RiseText
            parts={[
              "Terbentuknya pelajar muslim yang berilmu, berakhlak mulia, serta terampil",
              "dalam rangka menegakkan dan menjunjung tinggi nilai-nilai ajaran Islam",
              "sehingga terwujud masyarakat Islam yang sebenar-benarnya.",
            ]}
            className="font-heading text-2xl font-semibold leading-snug text-white sm:text-4xl sm:leading-snug"
            delay={1}
          />

          <ul className="mt-10 flex flex-wrap gap-3">
            {pillars.map((item, i) => (
              <Rise
                as="li"
                key={item.label}
                delay={i + 4}
                className="flex items-center gap-2.5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white sm:text-base"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full ring-2 ring-white/70"
                  style={{ backgroundColor: item.dot }}
                  aria-hidden="true"
                />
                {item.label}
              </Rise>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
