import { useEffect, useState } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-02-08T17:30:00-06:00');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 text-white text-center mb-1">
        <div className="text-5xl font-light glow-text tracking-wider">
          {timeLeft.days.toString().padStart(2, '0')}
        </div>
        <div className="text-5xl font-light glow-text tracking-wider">
          {timeLeft.hours.toString().padStart(2, '0')}
        </div>
        <div className="text-5xl font-light glow-text tracking-wider">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </div>
        <div className="text-5xl font-light glow-text tracking-wider">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="text-xs tracking-[0.5em] text-white uppercase glow-text">
        days hours minutes seconds
      </div>
    </div>
  );
}