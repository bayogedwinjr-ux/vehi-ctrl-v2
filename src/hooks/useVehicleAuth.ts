import { useState, useCallback, useEffect } from 'react';
import { VEHICLE_CONFIG, buildUrl } from '@/config/vehicle';
import { useDeviceId } from './useDeviceId';

export type AuthState = 'checking' | 'verified' | 'unauthorized' | 'unregistered' | 'network_error';

interface RegistrationResponse {
  status?: string;
  message?: string;
  error?: string;
}

interface VerificationResponse {
  verified: boolean;
  vin?: string;
  reason?: string;
  message?: string;
}

/**
 * Hook to manage vehicle device registration and authorization
 * 
 * Handles:
 * - Device registration with VIN
 * - Device verification on app launch
 * - Authorization state management
 * 
 * Returns:
 * - authState: Current authorization state
 * - registerDevice: Function to register device with VIN
 * - verifyDevice: Function to verify device is authorized
 * - isLoading: Whether an operation is in progress
 * - error: Error message if any
 */
export const useVehicleAuth = () => {
  const { deviceId, isLoading: isLoadingDeviceId } = useDeviceId();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register device with VIN
   */
  const registerDevice = useCallback(async (vin: string): Promise<{ success: boolean; message: string }> => {
    if (!deviceId) {
      return { success: false, message: 'Device ID not available' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = buildUrl('raspberryPi', VEHICLE_CONFIG.raspberryPi.endpoints.register);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VEHICLE_CONFIG.requestTimeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin,
          device_id: deviceId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: RegistrationResponse = await response.json();

      if (response.ok) {
        setAuthState('verified');
        return {
          success: true,
          message: data.message || 'Registration successful',
        };
      } else if (response.status === 401) {
        // Invalid VIN
        return {
          success: false,
          message: data.message || 'Invalid VIN/Chassis number',
        };
      } else if (response.status === 409) {
        // Already registered to another device
        return {
          success: false,
          message: data.message || 'This VIN is already registered to another device',
        };
      } else {
        return {
          success: false,
          message: data.error || 'Registration failed',
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      setAuthState('network_error');
      return {
        success: false,
        message: 'Cannot connect to vehicle server. Make sure you are connected to the vehicle\'s WiFi network.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  /**
   * Verify device is authorized
   */
  const verifyDevice = useCallback(async (): Promise<boolean> => {
    if (!deviceId) {
      setAuthState('unregistered');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = buildUrl('raspberryPi', VEHICLE_CONFIG.raspberryPi.endpoints.verify);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VEHICLE_CONFIG.requestTimeout);

      const response = await fetch(`${url}?device_id=${encodeURIComponent(deviceId)}`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: VerificationResponse = await response.json();

      if (response.ok && data.verified) {
        setAuthState('verified');
        return true;
      } else if (response.status === 404) {
        // No registration found
        setAuthState('unregistered');
        return false;
      } else if (response.status === 403) {
        // Device not authorized
        setAuthState('unauthorized');
        setError(data.message || 'This device is not authorized for this vehicle');
        return false;
      } else {
        setAuthState('unauthorized');
        return false;
      }
    } catch (err) {
      console.error('Verification error:', err);
      setAuthState('network_error');
      setError('Cannot connect to vehicle server');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  // Auto-verify on mount when device ID is available
  useEffect(() => {
    if (deviceId && authState === 'checking') {
      verifyDevice();
    }
  }, [deviceId, authState, verifyDevice]);

  return {
    authState,
    registerDevice,
    verifyDevice,
    isLoading: isLoading || isLoadingDeviceId,
    error,
  };
};
