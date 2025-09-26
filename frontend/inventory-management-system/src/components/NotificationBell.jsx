import React, { useEffect, useState } from 'react';
import { stockAlertService } from '@/lib/services/stockAlertService';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    try {
      // Fetch only unresolved alerts to avoid repeating historical items
      const all = await stockAlertService.listUnresolved();
      // De-duplicate by productId + alertType; keep latest by createdAt
      const latestByKey = new Map();
      for (const a of all) {
        const key = `${a.productId}:${a.alertType}`;
        const prev = latestByKey.get(key);
        if (!prev || new Date(a.createdAt) > new Date(prev.createdAt)) {
          latestByKey.set(key, { ...a, _count: (prev?._count || 0) + 1 });
        }
      }
      const deduped = Array.from(latestByKey.values()).sort(
        (x, y) => new Date(y.createdAt) - new Date(x.createdAt)
      );
      setNotifications(deduped);
      setUnreadCount(deduped.length);
    } catch (e) {
      // ignore for bell
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className='relative'>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none'
      >
        {/* Bell Icon */}
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
          />
        </svg>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50'>
          {/* Header */}
          <div className='px-4 py-3 border-b bg-gray-50 rounded-t-lg'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-800'>Notifications</h3>
            </div>
          </div>

          {/* Notification List */}
          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='px-4 py-8 text-center text-gray-500'>
                <svg
                  className='w-12 h-12 mx-auto mb-2 text-gray-300'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notification => (
                <div
                  key={notification.alertId}
                  className={`px-4 py-3 border-b hover:bg-gray-50`}
                >
                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0'>
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.isResolved
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm ${!notification.isResolved ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                      >
                        {notification.message}
                        {notification._count > 1 && (
                          <span className='ml-2 text-xs text-gray-500'>
                            (+{notification._count - 1} more)
                          </span>
                        )}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {new Date(notification.createdAt).toLocaleString()} ·{' '}
                        {notification.alertType}
                      </p>
                    </div>
                    {!notification.isResolved && (
                      <button
                        className='text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200'
                        onClick={async () => {
                          try {
                            await stockAlertService.resolve(
                              notification.alertId
                            );
                            setNotifications(prev =>
                              prev.map(x =>
                                x.alertId === notification.alertId
                                  ? { ...x, isResolved: true }
                                  : x
                              )
                            );
                            setUnreadCount(c => Math.max(0, c - 1));
                          } catch {}
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='px-4 py-3 border-t bg-gray-50 rounded-b-lg'>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/notifications';
                }}
                className='w-full text-sm text-blue-600 hover:text-blue-800 font-medium'
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
