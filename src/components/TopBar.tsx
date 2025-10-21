import { useState, useEffect } from 'react';
import { User } from '../types';

interface TopBarProps {
  user: User;
  onLogoClick: () => void;
}

export default function TopBar({ user, onLogoClick }: TopBarProps) {
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - user.loginTime.getTime()) / 1000);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [user.loginTime]);

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const formatSessionTime = (seconds: number) => {
    const remaining = 1800 - seconds;
    if (remaining <= 0) return '00:00';
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = (remaining % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="app-logo" onClick={onLogoClick}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="4" fill="#666" />
            <rect x="8" y="8" width="16" height="16" rx="2" fill="#fff" />
            <rect x="11" y="11" width="10" height="2" fill="#666" />
            <rect x="11" y="15" width="10" height="2" fill="#666" />
            <rect x="11" y="19" width="6" height="2" fill="#666" />
          </svg>
        </div>
      </div>

      <div className="top-bar-center">
        <span>Login Time: {formatDate(user.loginTime)}</span>
        <span className="session-timer">Session Timer: {formatSessionTime(sessionTime)}</span>
      </div>

      <div className="top-bar-right">
        <div className="user-avatar">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#999" />
            <circle cx="16" cy="12" r="5" fill="#fff" />
            <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" fill="#fff" />
          </svg>
        </div>
        <span className="user-name">{user.username}</span>
      </div>
    </div>
  );
}
