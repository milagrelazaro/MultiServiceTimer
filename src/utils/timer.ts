import { Activity } from '../types';

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateElapsedTime = (activity: Activity): number => {
  if (!activity.startedAt) return 0;

  const now = Date.now();
  let endTime = activity.completedAt || now;
  
  if (activity.status === 'paused') {
    const lastPause = activity.pauses[activity.pauses.length - 1];
    if (lastPause && !lastPause.end) {
      endTime = lastPause.start;
    }
  }

  const elapsed = (endTime - activity.startedAt - activity.totalPausedTime) / 1000;
  return Math.max(0, Math.floor(elapsed));
};

export const calculateTotalTime = (activity: Activity): number => {
  if (activity.status === 'completed' && activity.completedAt && activity.startedAt) {
    return Math.floor((activity.completedAt - activity.startedAt - activity.totalPausedTime) / 1000);
  }
  return calculateElapsedTime(activity);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
  }).format(value);
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

export const formatShortDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
};
