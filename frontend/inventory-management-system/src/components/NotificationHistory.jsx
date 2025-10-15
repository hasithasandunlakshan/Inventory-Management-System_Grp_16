import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationHistory = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotificationHistory();
  }, [userId]);

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const history = await notificationService.getUserNotifications(userId);
      setNotifications(history);
      setError(null);
    } catch (err) {
      setError('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update the local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {}
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleString();
  };

  const getNotificationIcon = type => {
    switch (type.toUpperCase()) {
      case 'ORDER':
        return '🛍️';
      case 'INVENTORY':
        return '📦';
      case 'PAYMENT':
        return '💳';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center p-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        <span className='ml-2'>Loading notification history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        <p>{error}</p>
        <button
          onClick={fetchNotificationHistory}
          className='mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='notification-history max-w-4xl mx-auto p-4'>
      <h2 className='text-2xl font-bold mb-4'>Notification History</h2>

      {notifications.length === 0 ? (
        <div className='text-center text-gray-500 py-8'>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.isRead
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
                  <span className='text-2xl'>
                    {getNotificationIcon(notification.type)}
                  </span>

                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <h3 className='font-semibold text-lg'>
                        {notification.type} Notification
                      </h3>
                      {!notification.isRead && (
                        <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                          New
                        </span>
                      )}
                    </div>

                    <p className='text-gray-700 mt-1'>{notification.message}</p>

                    <div className='flex items-center justify-between mt-3'>
                      <span className='text-sm text-gray-500'>
                        {formatTimestamp(notification.timestamp)}
                      </span>

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className='text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors'
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchNotificationHistory}
        className='mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors'
      >
        Refresh
      </button>
    </div>
  );
};

export default NotificationHistory;
