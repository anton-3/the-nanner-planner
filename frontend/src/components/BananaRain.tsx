import React, { useMemo } from "react";

interface BananaRainProps {
  count?: number;
}

// Renders many small banana images falling in the background with random
// positions, rotation, size, and speed.
const BananaRain = ({ count = 24 }: BananaRainProps) => {
  const drops = useMemo(() => {
    const arr = Array.from({ length: count }).map((_, i) => {
      // Use a simple seeded-ish randomness per index for stable layout
      const r = Math.sin(i * 9999) * 10000;
      const rand = (min: number, max: number) => min + (Math.abs(r + i * 13) % 1) * (max - min);

      const left = (Math.abs(Math.sin((i + 1) * 23.7)) % 1) * 100; // 0..100%
      const sizeRem = 1.1 + ((i * 37) % 10) * 0.18; // ~1.1rem..2.9rem
      const rot = Math.floor(((i * 53) % 240) - 120); // -120..120 deg (more variety)
  const duration = 6 + ((i * 17) % 60) * 0.09; // ~6..11.4s faster fall
      const delay = -rand(0, duration); // negative so stream already in progress
      const sway = Math.floor(((i * 97) % 80) - 40); // -40..40 px sway
      const flip = ((i * 31) % 2) < 1; // flip some
      return { id: i, left, sizeRem, rot, duration, delay, sway, flip };
    });
    return arr;
  }, [count]);

  return (
    <div className="banana-rain" aria-hidden>
      {drops.map((d) => (
        <div
          key={d.id}
          className="banana-drop"
          style={{
            left: `${d.left}%`,
            width: `${d.sizeRem}rem`,
            transform: `rotate(${d.rot}deg) scaleX(${d.flip ? -1 : 1})`,
            ['--dur' as unknown as string]: `${d.duration}s`,
            ['--delay' as unknown as string]: `${d.delay}s`,
          }}
        >
          <div
            className="banana-drop-anim"
            style={{
              ['--sway' as unknown as string]: `${d.sway}px`,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
            }}
          >
            <img src="/nanna.png" alt="" className="banana-drop-img" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BananaRain;
