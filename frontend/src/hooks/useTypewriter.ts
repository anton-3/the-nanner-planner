import { useEffect, useRef, useState } from "react";

export function useTypewriter(fullText: string, speedMs = 24) {
  const [typed, setTyped] = useState("");
  const textRef = useRef(fullText);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    textRef.current = fullText || "";
    setTyped("");

    if (!textRef.current) return;

    const start = () => {
      let i = 0;
      const tick = () => {
        if (i >= textRef.current.length) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;
          return;
        }
        i += 1;
        setTyped(textRef.current.slice(0, i));
      };
      timerRef.current = window.setInterval(tick, speedMs);
    };

    start();

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fullText, speedMs]);

  return typed;
}
