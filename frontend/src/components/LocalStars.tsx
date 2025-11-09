import Particles from "react-tsparticles";
import type { ISourceOptions } from "tsparticles-engine";
import { useMemo } from "react";

/*
  LocalStars adds a dense twinkling starfield confined to the AgentVisualizer box.
  It sits behind the white dwarf layers for extra depth around the agent.
*/

export default function LocalStars() {
  const options = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 220, density: { enable: true, area: 600 } },
      color: { value: ["#e7f5ff", "#dff0ff", "#bbdcff", "#a8c7ff"] },
      shape: { type: "circle" },
      size: { value: { min: 0.5, max: 1.8 } },
      opacity: {
        value: { min: 0.35, max: 0.95 },
        animation: { enable: true, speed: 0.25, minimumValue: 0.2, sync: false }
      },
      move: {
        enable: true,
        speed: 0.08,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        parallax: { enable: false, force: 10, smooth: 20 }
      },
      twinkle: {
        particles: { enable: true, color: { value: "#ffffff" }, frequency: 0.05, opacity: 1 }
      },
      links: { enable: false },
      collisions: { enable: false }
    },
    interactivity: {
      detectsOn: "window",
      events: { resize: true }
    }
  }), []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Particles id="local-stars" options={options} />
    </div>
  );
}
