// Notification Service for API calls
const API_BASE_URL = `${process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://34.136.119.127:8087'}/api`;

export const notificationService = {
  /**
   * Get notification history for a specific user
   * @param {number} userId - The user ID
   * @returns {Promise} - Promise with notification history
   */
  async getUserNotifications(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const notifications = await response.json();
      return notifications;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId - The notification ID
   * @returns {Promise} - Promise with updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedNotification = await response.json();
      return updatedNotification;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all notifications (admin function)
   * @returns {Promise} - Promise with all notifications
   */
  async getAllNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const notifications = await response.json();
      return notifications;
    } catch (error) {
      throw error;
    }
  },
};
