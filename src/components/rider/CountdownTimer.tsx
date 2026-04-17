import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { reassignOrder } from '../../services/firestore';

interface CountdownTimerProps {
  expiresAt: string;
  orderId: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, orderId, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        handleExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleExpire = async () => {
    // Only the first one to call this for a specific orderId will successfully "reassign"
    // In a real app, this would be server-side.
    await reassignOrder(orderId);
    if (onExpire) onExpire();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg font-mono font-bold text-[9px] uppercase tracking-wider ${
      timeLeft < 30 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-500'
    }`}>
      <Clock className="w-2.5 h-2.5" />
      <span>{timeLeft > 0 ? formatTime(timeLeft) : 'Reassigning...'}</span>
    </div>
  );
}
