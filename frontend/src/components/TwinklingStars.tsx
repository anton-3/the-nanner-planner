import Particles from "react-tsparticles";
import type { Engine, ISourceOptions } from "tsparticles-engine";
import { useMemo } from "react";

/*
  TwinklingStars renders a high-density star field with subtle parallax and twinkle.
  Uses react-tsparticles for GPU-accelerated canvas animation.
  This layer is pointer-events:none and fully transparent behind UI.
*/

export default function TwinklingStars() {
  const far = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
  number: { value: 270, density: { enable: true, area: 800 } },
      color: { value: ["#b9d7ff", "#dff0ff", "#a8c7ff", "#c9e8ff"] },
      shape: { type: "circle" },
      size: { value: { min: 0.4, max: 1.2 } },
      opacity: {
        value: { min: 0.35, max: 0.95 },
        animation: { enable: true, speed: 0.25, minimumValue: 0.2, sync: false }
      },
      move: {
        enable: true,
        speed: 0.06,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        parallax: { enable: true, force: 8, smooth: 20 }
      },
      twinkle: {
        particles: { enable: true, color: { value: "#ffffff" }, frequency: 0.035, opacity: 1 }
      },
      links: { enable: false },
      collisions: { enable: false }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: false, mode: [] },
        onClick: { enable: false, mode: [] },
        resize: true
      }
    }
  }), []);

  const near = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
  number: { value: 290, density: { enable: true, area: 800 } },
      color: { value: ["#e7f5ff", "#dff0ff", "#bbdcff"] },
      shape: { type: "circle" },
      size: { value: { min: 0.8, max: 2.6 } },
      opacity: {
        value: { min: 0.35, max: 1 },
        animation: { enable: true, speed: 0.35, minimumValue: 0.2, sync: false }
      },
      move: {
        enable: true,
        speed: 0.14,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        parallax: { enable: true, force: 18, smooth: 20 }
      },
      twinkle: {
        particles: { enable: true, color: { value: "#ffffff" }, frequency: 0.045, opacity: 1 }
      },
      links: { enable: false },
      collisions: { enable: false }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: false, mode: [] },
        onClick: { enable: false, mode: [] },
        resize: true
      }
    }
  }), []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Particles id="twinkling-stars-far" options={far} />
      <Particles id="twinkling-stars-near" options={near} />
    </div>
  );
}
