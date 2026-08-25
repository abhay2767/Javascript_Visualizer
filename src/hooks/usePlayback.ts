import { useCallback, useEffect, useState } from "react";

export function usePlayback(total: number) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const safeCurrent = total > 0 ? Math.min(current, total - 1) : 0;

  useEffect(() => {
    if (!playing || total === 0) return;
    if (safeCurrent >= total - 1) {
      const timer = window.setTimeout(() => {
        setPlaying(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setCurrent((value) => Math.min(value + 1, total - 1));
    }, 1100 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, safeCurrent, speed, total]);

  const restart = useCallback(() => {
    setPlaying(false);
    setCurrent(0);
  }, []);

  return { current: safeCurrent, setCurrent, playing, setPlaying, speed, setSpeed, restart };
}

