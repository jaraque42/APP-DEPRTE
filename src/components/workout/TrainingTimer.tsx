import React, { useState, useEffect } from 'react';
import styles from './TrainingTimer.module.css';

export default function TrainingTimer({ initialSeconds = 60, onFinished }: { initialSeconds: number, onFinished?: () => void }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  // Restart timer if initialSeconds changes
  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      if (onFinished) onFinished();
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onFinished]);

  if (!isActive && seconds === 0) return null;

  return (
    <div className={`${styles.timerOverlay} ${styles.bounceSubtle}`}>
      <div className={styles.timerInfo}>
        <span className={styles.timerLabel}>Descanso</span>
        <span className={styles.timerDigits}>
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className={styles.timerActions}>
        <button onClick={() => setSeconds(s => s + 15)} className={styles.addTimeBtn}>+15s</button>
        <button onClick={() => setSeconds(0)} className={styles.skipBtn}>Saltar</button>
      </div>
    </div>
  );
}
