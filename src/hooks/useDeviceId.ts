import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';

/**
 * Hook to get a unique, persistent device identifier
 * 
 * On native platforms (iOS/Android):
 * - Uses Capacitor's Device.getId() which returns a UUID
 * 
 * On web:
 * - Falls back to a UUID stored in localStorage
 * 
 * The device ID persists across app restarts and is used
 * for device binding and authorization.
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDeviceId = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get device ID from Capacitor (works on native platforms)
        try {
          const info = await Device.getId();
          
          if (info.identifier) {
            setDeviceId(info.identifier);
            // Store as backup in localStorage
            localStorage.setItem('technodrive_device_id', info.identifier);
            setIsLoading(false);
            return;
          }
        } catch (capacitorError) {
          console.log('Capacitor Device ID not available, using fallback');
        }

        // Fallback for web: Use or create a UUID in localStorage
        let webDeviceId = localStorage.getItem('technodrive_device_id');
        
        if (!webDeviceId) {
          // Generate a new UUID for web
          webDeviceId = generateUUID();
          localStorage.setItem('technodrive_device_id', webDeviceId);
          console.log('Generated new web device ID:', webDeviceId);
        }

        setDeviceId(webDeviceId);
      } catch (err) {
        console.error('Error getting device ID:', err);
        setError(err instanceof Error ? err.message : 'Failed to get device ID');
      } finally {
        setIsLoading(false);
      }
    };

    getDeviceId();
  }, []);

  return { deviceId, isLoading, error };
};

/**
 * Generate a UUID v4
 * Used as fallback for web platform
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
