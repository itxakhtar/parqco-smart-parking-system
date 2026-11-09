import { useEffect, useState } from 'react';

/** Counts down from `start` seconds. Call `restart()` to begin again. */
export default function useCountdown(start = 60) {
  const [left, setLeft] = useState(start);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return [left, () => setLeft(start)];
}
