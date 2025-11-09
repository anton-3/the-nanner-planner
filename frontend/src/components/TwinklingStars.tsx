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
      number: { value: 3200, density: { enable: true, area: 800 } },
      color: { value: ["#b9d7ff", "#dff0ff", "#a8c7ff", "#c9e8ff"] },
      shape: { type: "circle" },
      size: { value: { min: 0.5, max: 3.5 } },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false }
      },
      move: {
        enable: true,
        speed: 0.08,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        parallax: { enable: true, force: 10, smooth: 20 }
      },
      twinkle: {
        particles: { enable: true, color: { value: "#ffffff" }, frequency: 0.05, opacity: 1 }
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
      number: { value: 3400, density: { enable: true, area: 800 } },
      color: { value: ["#e7f5ff", "#dff0ff", "#bbdcff"] },
      shape: { type: "circle" },
      size: { value: { min: 1.5, max: 6.0 } },
      opacity: {
        value: { min: 0.2, max: 1 },
        animation: { enable: true, speed: 1.0, minimumValue: 0.15, sync: false }
      },
      move: {
        enable: true,
        speed: 0.16,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        parallax: { enable: true, force: 20, smooth: 20 }
      },
      twinkle: {
        particles: { enable: true, color: { value: "#ffffff" }, frequency: 0.06, opacity: 1 }
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
