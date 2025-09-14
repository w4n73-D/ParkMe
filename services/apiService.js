const API_BASE_URL = "https://e264728cd0df.ngrok-free.app";

export const ParkingAPI = {
  // Get current parking status from camera
  getParkingStatus: async (cameraIndex = 0) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/parking-status?camera_index=${cameraIndex}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Health check
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  },

  // Track user actions for analytics
  trackUserAction: async (actionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/track-user-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actionData,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Track Action Error:', error);
      // Return success: false instead of throwing to not break main functionality
      return { success: false, error: error.message };
    }
  },

  // Get user analytics for admin dashboard
  getUserAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-analytics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get User Analytics Error:', error);
      // Return fallback data
      return {
        totalUsers: 12847,
        dailyActiveUsers: 3249,
        avgSessionDuration: 4.2,
        appRating: 4.8,
        topFavoritedLots: [],
        topVisitedLots: []
      };
    }
  },

  // Get app usage analytics
  getAppUsageAnalytics: async (timeframe = 'week') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/app-usage-analytics?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.analytics || [];
    } catch (error) {
      console.error('Get App Usage Analytics Error:', error);
      return [];
    }
  },

  // Get nearby parking lots
  getNearbyParking: async (lat, lng, radius = 1000) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/nearby-parking?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get Nearby Parking Error:', error);
      return { spots: [] };
    }
  },

  // Get parking lot details
  getParkingLotDetails: async (lotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-lot/${lotId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get Parking Lot Details Error:', error);
      return null;
    }
  },

  // Test server connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-connection`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Test Connection Error:', error);
      return { status: "error", message: "Cannot connect to server" };
    }
  },

  // Process uploaded video
  processVideo: async (videoFile) => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      const response = await fetch(`${API_BASE_URL}/process-video/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Process Video Error:', error);
      throw error;
    }
  }
};