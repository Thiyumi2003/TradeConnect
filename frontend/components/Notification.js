"use client";

import { useEffect, useState } from 'react';

export default function Notification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    function handleNotify(event) {
      setNotification(event.detail);
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }

    window.addEventListener('notify', handleNotify);
    return () => window.removeEventListener('notify', handleNotify);
  }, []);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const className = isSuccess ? 'notification notification-success' : 'notification notification-error';

  return <div className={className}>{notification.message}</div>;
}
