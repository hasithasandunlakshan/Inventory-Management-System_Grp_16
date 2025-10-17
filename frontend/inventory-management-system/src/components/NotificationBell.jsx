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
    <div className='relative z-[100]'>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 text-white hover:text-white/80 focus:outline-none transition-all hover:scale-110 z-[100]'
        aria-label='Notifications'
      >
        {/* Bell Icon */}
        <svg
          className='w-7 h-7'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
          />
        </svg>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse z-[101]'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className='absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-[200] overflow-hidden'>
          {/* Header */}
          <div
            className='px-5 py-4 border-b'
            style={{
              background: 'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
            }}
          >
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-white text-lg'>Notifications</h3>
              {unreadCount > 0 && (
                <span
                  className='bg-white text-xs px-2 py-1 rounded-full font-bold'
                  style={{ color: '#2A7CC7' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='px-4 py-12 text-center text-gray-500'>
                <svg
                  className='w-16 h-16 mx-auto mb-3 text-gray-300'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                </svg>
                <p className='font-medium text-gray-700 mb-1'>All caught up!</p>
                <p className='text-sm text-gray-400'>
                  No notifications at the moment
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notification => (
                <div
                  key={notification.alertId}
                  className={`px-5 py-4 border-b hover:bg-blue-50 transition-colors ${
                    !notification.isResolved ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-1'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          !notification.isResolved
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm ${
                          !notification.isResolved
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}
                      >
                        {notification.message}
                        {notification._count > 1 && (
                          <span
                            className='ml-2 text-xs px-2 py-0.5 rounded-full font-medium'
                            style={{
                              backgroundColor: 'rgba(42, 124, 199, 0.1)',
                              color: '#2A7CC7',
                            }}
                          >
                            +{notification._count - 1} more
                          </span>
                        )}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <p className='text-xs text-gray-500'>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        <span className='text-gray-300'>•</span>
                        <span
                          className='text-xs font-medium'
                          style={{ color: '#2A7CC7' }}
                        >
                          {notification.alertType}
                        </span>
                      </div>
                    </div>
                    {!notification.isResolved && (
                      <button
                        className='text-xs px-3 py-1.5 rounded-md text-white font-medium transition-colors shadow-sm'
                        style={{
                          background:
                            'linear-gradient(135deg, #2A7CC7 0%, #245e91ff 100%)',
                        }}
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
            <div className='px-5 py-4 border-t bg-gray-50'>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = '/notifications';
                }}
                className='w-full text-sm font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors'
                style={{ color: '#2A7CC7' }}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className='fixed inset-0 z-[150]'
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
