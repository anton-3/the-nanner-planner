import { useMemo } from "react";

type Kind = "twinkle" | "drift";

interface AmbientStar {
  id: number;
  top: number; // percentage 0-100
  left: number; // percentage 0-100
  size: number; // px
  kind: Kind;
  dur: number; // seconds
  delay: number; // seconds
  dx: number; // px drift amplitude
  dy: number; // px drift amplitude
}

// About ~22 small stars clustered around the agent background with subtle motion
export default function AmbientStars() {
  const stars = useMemo<AmbientStar[]>(() => {
    const count = 22;
    const arr: AmbientStar[] = [];
    for (let i = 0; i < count; i++) {
      const kind: Kind = Math.random() < 0.55 ? "twinkle" : "drift";
      // avoid the very center (white dwarf) by biasing positions toward outer ring
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 2; // 1-3px
      const dur = kind === "twinkle" ? 2 + Math.random() * 3 : 6 + Math.random() * 10;
      const delay = Math.random() * 5;
      const dx = kind === "drift" ? (Math.random() * 2 + 0.5) * (Math.random() < 0.5 ? -1 : 1) : 0.2;
      const dy = kind === "drift" ? (Math.random() * 2 + 0.5) * (Math.random() < 0.5 ? -1 : 1) : 0.2;
      arr.push({ id: i, top, left, size, kind, dur, delay, dx, dy });
    }
    return arr;
  }, []);

  return (
    <div className="ambient-stars pointer-events-none absolute inset-0 z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className={`ambient-star ${s.kind === "twinkle" ? "ambient-twinkle" : "ambient-drift"}`}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            ["--amb-dur" as unknown as string]: `${s.dur}s`,
            ["--amb-delay" as unknown as string]: `${s.delay}s`,
            ["--amb-dx" as unknown as string]: `${s.dx}px`,
            ["--amb-dy" as unknown as string]: `${s.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
