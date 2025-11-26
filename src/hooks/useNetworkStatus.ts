import { useState, useEffect, useCallback } from 'react';
import { VEHICLE_CONFIG, buildUrl } from '@/config/vehicle';

/**
 * Hook to monitor network connectivity to the Raspberry Pi server
 * 
 * Periodically pings the Pi's health endpoint to verify:
 * 1. Device is connected to the vehicle's WiFi network
 * 2. Raspberry Pi is accessible
 * 3. Server is running
 * 
 * Returns:
 * - isConnected: Whether the Pi is reachable
 * - isChecking: Whether a check is in progress
 * - lastChecked: Timestamp of last successful check
 * - checkNow: Function to manually trigger a check
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setIsChecking(true);

      const url = buildUrl('raspberryPi', '/');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VEHICLE_CONFIG.requestTimeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsConnected(true);
        setLastChecked(new Date());
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      // Network error or timeout
      setIsConnected(false);
      console.log('Network check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Initial check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Periodic checks
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkConnection();
    }, VEHICLE_CONFIG.networkCheckInterval);

    return () => clearInterval(intervalId);
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    lastChecked,
    checkNow: checkConnection,
  };
};
