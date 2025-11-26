import { AlertCircle, Wifi, WifiOff, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VEHICLE_CONFIG } from "@/config/vehicle";
import type { AuthState } from "@/hooks/useVehicleAuth";

interface NetworkStatusOverlayProps {
  isConnected: boolean;
  authState: AuthState;
  onRetry: () => void;
}

export const NetworkStatusOverlay = ({
  isConnected,
  authState,
  onRetry,
}: NetworkStatusOverlayProps) => {
  // Don't show overlay if everything is fine
  if (isConnected && authState === 'verified') {
    return null;
  }

  // Determine what to show based on state
  const getOverlayContent = () => {
    // Network issue takes priority
    if (!isConnected || authState === 'network_error') {
      return {
        icon: <WifiOff className="h-16 w-16 text-destructive" />,
        title: "No Connection to Vehicle",
        message: `Connect to the vehicle's WiFi network (${VEHICLE_CONFIG.networkSSID}) to use this app.`,
        details: `Looking for server at ${VEHICLE_CONFIG.raspberryPi.ip}`,
        showRetry: true,
      };
    }

    // Device not authorized
    if (authState === 'unauthorized') {
      return {
        icon: <ShieldAlert className="h-16 w-16 text-destructive" />,
        title: "Device Not Authorized",
        message: "This device is not registered to this vehicle.",
        details: "This app is registered to another device. Each vehicle can only be controlled by one device.",
        showRetry: false,
      };
    }

    // Checking state
    if (authState === 'checking') {
      return {
        icon: <Shield className="h-16 w-16 text-muted-foreground animate-pulse" />,
        title: "Verifying Device...",
        message: "Checking authorization with vehicle server.",
        details: null,
        showRetry: false,
      };
    }

    // Default fallback
    return null;
  };

  const content = getOverlayContent();

  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 text-center">
        <div className="flex justify-center">
          {content.icon}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{content.title}</h2>
          <p className="text-muted-foreground">
            {content.message}
          </p>
          {content.details && (
            <p className="text-sm text-muted-foreground/70 pt-2">
              {content.details}
            </p>
          )}
        </div>

        {content.showRetry && (
          <Button onClick={onRetry} size="lg" className="w-full">
            Retry Connection
          </Button>
        )}

        {!isConnected && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4" />
              <span>WiFi: {VEHICLE_CONFIG.networkSSID}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <AlertCircle className="h-3 w-3" />
              <span>Server: {VEHICLE_CONFIG.raspberryPi.ip}:{VEHICLE_CONFIG.raspberryPi.port}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
