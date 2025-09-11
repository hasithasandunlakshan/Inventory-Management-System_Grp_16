// Notification Service for API calls
const API_BASE_URL = 'http://localhost:8085/api'; // Notification service URL

export const notificationService = {
  
  /**
   * Get notification history for a specific user
   * @param {number} userId - The user ID
   * @returns {Promise} - Promise with notification history
   */
  async getUserNotifications(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const notifications = await response.json();
      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
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
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedNotification = await response.json();
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  },
};
