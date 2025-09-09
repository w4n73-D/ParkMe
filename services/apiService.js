const API_BASE_URL = "https://94b3e384b81e.ngrok-free.app";

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
  }
};