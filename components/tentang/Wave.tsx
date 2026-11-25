/**
 * Pembatas ombak antar-section. Taruh di dalam <section className="relative ...">.
 * `color` = warna section SEBELUMNYA (ombak "mengalir" turun ke section ini).
 * Dua lapis bergerak berlawanan arah, jadi tampak hidup tapi tetap ringan
 * (hanya transform).
 */
const PATH =
  "M0,0 L0,60 C200,100 400,100 600,60 S1000,20 1200,60 C1400,100 1600,100 1800,60 S2200,20 2400,60 L2400,0 Z";

export default function Wave({
  color,
  position = "top",
  className = "h-8 sm:h-14",
}: {
  color: string;
  position?: "top" | "bottom";
  className?: string;
}) {
  const edge =
    position === "top" ? "top-[-1px]" : "bottom-[-1px] scale-y-[-1]";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 overflow-hidden leading-none ${edge} ${className}`}
    >
      <svg
        className="wave-drift wave-drift-rev absolute left-0 top-0 h-full w-[200%] opacity-50"
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
      >
        <path d={PATH} fill={color} />
      </svg>
      <svg
        className="wave-drift absolute left-0 top-0 h-full w-[200%]"
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
      >
        <path d={PATH} fill={color} />
      </svg>
    </div>
  );
}
