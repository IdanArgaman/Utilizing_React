import { useEffect, useRef, useState } from 'react';

// A counter that ticks up once per second from 0 to a user-set limit, then
// stops itself. Demonstrates a common interval pattern: driving
// setInterval from an effect keyed on a `isRunning` flag, reading the
// latest state via the setCounter functional updater (so the effect
// doesn't need `counter` in its dependency array), and always cleaning up
// the interval on unmount/re-run via the effect's return function.
function CounterTimer() {
  const [limit, setLimit] = useState<number>(10);
  const [counter, setCounter] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setCounter((prev) => {
        if (prev >= limit) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, limit]);

  const handleStart = () => {
    setCounter(0);
    setIsRunning(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        marginTop: '50px',
        fontFamily: 'Arial',
      }}
    >
      <h2>Counter Timer</h2>

      <input
        type="number"
        value={limit}
        min={0}
        onChange={(e) => setLimit(Number(e.target.value))}
      />

      <button onClick={handleStart} disabled={isRunning}>
        Start
      </button>

      <h1>{counter}</h1>
    </div>
  );
}

export default CounterTimer;
