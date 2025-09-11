import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

/**
 * Custom hook for managing notifications
 * @param {number} userId - The user ID
 * @returns {Object} - Notification data and methods
 */
export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const fetchedNotifications = await notificationService.getUserNotifications(userId);
      setNotifications(fetchedNotifications);
      
      // Calculate unread count
      const unread = fetchedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification =>
          notificationService.markAsRead(notification.id)
        )
      );
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  // Add a new notification (for real-time updates)
  const addNotification = (newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Get recent notifications (last 5)
  const getRecentNotifications = () => {
    return notifications.slice(0, 5);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    getRecentNotifications,
    getUnreadNotifications,
  };
};
