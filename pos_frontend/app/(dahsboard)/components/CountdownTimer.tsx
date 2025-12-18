"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: Date;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0:00";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(
    targetTime.getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = targetTime.getTime() - Date.now();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const isOverdue = timeRemaining <= 0;
  const overdueMinutes = isOverdue
    ? Math.floor(Math.abs(timeRemaining) / 60000)
    : 0;

  return (
    <div
      className={`rounded-lg border p-4 mb-4 ${
        isOverdue
          ? "bg-red-50 border-red-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <h3
        className={`text-sm font-medium uppercase tracking-wide mb-2 ${
          isOverdue ? "text-red-600" : "text-blue-600"
        }`}
      >
        {isOverdue ? "Overdue" : "Time Remaining"}
      </h3>
      <p
        className={`text-3xl font-bold ${
          isOverdue ? "text-red-700" : "text-blue-700"
        }`}
      >
        {isOverdue
          ? `+${overdueMinutes} min overdue`
          : formatTimeRemaining(timeRemaining)}
      </p>
    </div>
  );
}
