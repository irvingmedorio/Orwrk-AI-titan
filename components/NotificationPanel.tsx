import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    removeNotification,
    reminders,
    addReminder,
    removeReminder,
    pushNotification,
  } = useNotificationStore();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(rem => {
        if (new Date(rem.time) <= now) {
          pushNotification('info', `Meeting reminder: ${rem.title}`);
          removeReminder(rem.id);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, pushNotification, removeReminder]);

  const handleAddReminder = () => {
    if (title && time) {
      addReminder(title, time);
      setTitle('');
      setTime('');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Meeting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Button onClick={handleAddReminder}>Add</Button>
          </div>
          {reminders.length > 0 && (
            <ul className="space-y-1">
              {reminders.map(rem => (
                <li key={rem.id} className="flex justify-between">
                  <span>
                    {rem.title} - {new Date(rem.time).toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeReminder(rem.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul className="space-y-1">
              {notifications.map(n => (
                <li key={n.id} className="flex justify-between">
                  <span>{n.message}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeNotification(n.id)}
                  >
                    Dismiss
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPanel;
