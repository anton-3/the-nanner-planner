import { useEffect, useMemo, useRef, useState } from "react";

interface Star {
  id: number;
  top: number; // px
  left: number; // px
  angle: number; // deg
  dist: number; // px
  dur: number; // seconds
}

/*
  ShootingStars renders occasional diagonal meteors with soft glowing tails.
  - Pure CSS animation + tiny React state
  - Randomized spawn time, position, angle, distance
  - Pointer-events: none so it never blocks UI
*/
export default function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const nextId = useRef(1);
  const timer = useRef<number | null>(null);

  const scheduleNext = () => {
    // Random between 5s and 22s for more irregular pacing
    const delay = 5000 + Math.random() * 17000;
    timer.current = window.setTimeout(() => {
      spawnStar();
      // 10% chance to trigger a companion star shortly after (cluster feel)
      if (Math.random() < 0.10) {
        window.setTimeout(() => spawnStar(), 1000 + Math.random() * 2000);
      }
      scheduleNext();
    }, delay) as unknown as number;
  };

  const spawnStar = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Start slightly off screen for cleaner entrance
    const directionRight = Math.random() < 0.5; // pick direction
    const startTop = vh * (Math.random() * 0.35); // upper ~35% of screen
    let startLeft: number;
    let angle: number; // degrees
    if (directionRight) {
      // Enter from left side heading to lower right
      startLeft = Math.random() < 0.6 ? -120 : vw * Math.random() * 0.25; // sometimes just off-screen
      angle = -(20 + Math.random() * 30); // -20 to -50 deg
    } else {
      // Enter from right side heading to lower left
      startLeft = vw * (0.75 + Math.random() * 0.25);
      angle = 200 + Math.random() * 40; // 200 to 240 deg
    }
    const dist = 900 + Math.random() * 1100; // 900-2000px longer trails
    const dur = 2.2 + Math.random() * 2.0; // slower: 2.2s - 4.2s

    const id = nextId.current++;
    const star: Star = { id, top: startTop, left: startLeft, angle, dist, dur };
    setStars((prev) => [...prev, star]);

    // Remove after it finishes
    window.setTimeout(() => {
      setStars((prev) => prev.filter((s) => s.id !== id));
    }, (dur * 1000) + 100);
  };

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="shooting-stars pointer-events-none absolute inset-0 -z-10">
      {stars.map((s) => (
        <div
          key={s.id}
          className="shooting-star"
          style={{
            top: `${s.top}px`,
            left: `${s.left}px`,
            ['--angle' as unknown as string]: `${s.angle}deg`,
            ['--dist' as unknown as string]: `${s.dist}px`,
            ['--dur' as unknown as string]: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
