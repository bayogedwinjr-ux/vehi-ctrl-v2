/**
 * Vehicle Configuration
 * 
 * This file contains the embedded VIN and all network configuration
 * for the TechnoDrive system. This ensures exclusive device binding
 * and network-specific operation.
 */

export const VEHICLE_CONFIG = {
  // Authorized VIN/Chassis Number (Embedded)
  authorizedVIN: "EE90-9073699",
  
  // Network Configuration
  networkSSID: "HUAWEI-E5330-4D63", // For reference only
  
  // Raspberry Pi (Registration & Auth Server)
  raspberryPi: {
    ip: "192.168.8.101",
    port: 5000,
    endpoints: {
      register: "/register",
      verify: "/verify",
      status: "/status",
      reset: "/reset",
    }
  },
  
  // ESP32 Controllers
  esp32Control: {
    ip: "192.168.8.220",
    endpoints: {
      control: "/control"
    }
  },
  
  esp32AC: {
    ip: "192.168.8.221",
    endpoints: {
      control: "/control"
    }
  },
  
  // ESP32 Blindspot Sensors
  esp32LeftSensor: {
    ip: "192.168.8.226",
    endpoints: {
      sensor: "/sensor"
    }
  },
  
  esp32RightSensor: {
    ip: "192.168.8.227",
    endpoints: {
      sensor: "/sensor"
    }
  },
  
  // Network check interval (milliseconds)
  networkCheckInterval: 3000,
  
  // Request timeout (milliseconds)
  requestTimeout: 5000,
} as const;

// Helper function to build full URLs
export const buildUrl = (device: keyof typeof VEHICLE_CONFIG, endpoint?: string) => {
  const config = VEHICLE_CONFIG[device];
  
  if (typeof config === 'object' && 'ip' in config && 'port' in config) {
    const baseUrl = `http://${config.ip}:${config.port}`;
    return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
  }
  
  if (typeof config === 'object' && 'ip' in config) {
    const baseUrl = `http://${config.ip}`;
    return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
  }
  
  return '';
};
