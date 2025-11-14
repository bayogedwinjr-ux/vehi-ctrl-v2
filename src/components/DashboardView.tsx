import { useEffect, useState } from "react";
import { Power, Wind, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RASPBERRY_PI_IP = "192.168.0.144";

interface SensorData {
  left: number | null;
  right: number | null;
}

interface DashboardViewProps {
  onCameraClick: () => void;
}

export const DashboardView = ({ onCameraClick }: DashboardViewProps) => {
  const [ignitionOn, setIgnitionOn] = useState(false);
  const [acOn, setAcOn] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ left: null, right: null });
  const [isIgnitionPressed, setIsIgnitionPressed] = useState(false);
  const [isAcPressed, setIsAcPressed] = useState(false);

  // Fetch blindspot sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const leftResponse = await fetch('http://192.168.0.226/data');
        const leftData = await leftResponse.json();
        
        const rightResponse = await fetch('http://192.168.0.227/data');
        const rightData = await rightResponse.json();
        
        setSensorData({
          left: leftData.distance || null,
          right: rightData.distance || null,
        });
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 500);
    return () => clearInterval(interval);
  }, []);

  const handleIgnitionPress = async () => {
    setIsIgnitionPressed(true);
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ignition=1`);
      if (response.ok) {
        setIgnitionOn(true);
        toast.success("Ignition started");
      }
    } catch (error) {
      toast.error("Failed to control ignition");
      console.error('Ignition control error:', error);
    }
  };

  const handleIgnitionRelease = async () => {
    if (!isIgnitionPressed) return; // Only release if button was pressed
    setIsIgnitionPressed(false);
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ignition=0`);
      if (response.ok) {
        setIgnitionOn(false);
        toast.success("Ignition turned off");
      }
    } catch (error) {
      toast.error("Failed to control ignition");
      console.error('Ignition control error:', error);
    }
  };

  const handleAcPress = async () => {
    setIsAcPressed(true);
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ac=1`);
      if (response.ok) {
        setAcOn(true);
        toast.success("AC turned on");
      }
    } catch (error) {
      toast.error("Failed to control AC");
      console.error('AC control error:', error);
    }
  };

  const handleAcRelease = async () => {
    if (!isAcPressed) return; // Only release if button was pressed
    setIsAcPressed(false);
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ac=0`);
      if (response.ok) {
        setAcOn(false);
        toast.success("AC turned off");
      }
    } catch (error) {
      toast.error("Failed to control AC");
      console.error('AC control error:', error);
    }
  };

  const getDetectionStatus = (value: number | null) => {
    if (value === null) return 'offline';
    return value === 1 ? 'detected' : 'clear';
  };

  const leftStatus = getDetectionStatus(sensorData.left);
  const rightStatus = getDetectionStatus(sensorData.right);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto relative">
          {/* Blindspot Detection Waves - Left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
            {leftStatus === 'detected' ? (
              <div className="flex flex-col gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-0.5 bg-success rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      opacity: 1 - i * 0.2,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-0.5 bg-muted rounded-full"
                    style={{ opacity: 0.4 - i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Blindspot Detection Waves - Right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            {rightStatus === 'detected' ? (
              <div className="flex flex-col gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-0.5 bg-success rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      opacity: 1 - i * 0.2,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-0.5 bg-muted rounded-full"
                    style={{ opacity: 0.4 - i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Main Control Buttons */}
          <div className="space-y-4">
            {/* Ignition Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group">
                  <button
                    onMouseDown={handleIgnitionPress}
                    onMouseUp={handleIgnitionRelease}
                    onMouseLeave={handleIgnitionRelease}
                    onTouchStart={handleIgnitionPress}
                    onTouchEnd={handleIgnitionRelease}
                    className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                      isIgnitionPressed || ignitionOn
                        ? 'bg-gradient-primary scale-95'
                        : 'bg-card border-2 border-border hover:border-primary/50'
                    }`}
                  >
                    <Power className={`h-12 w-12 transition-all ${
                      isIgnitionPressed || ignitionOn ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </button>
                  {(leftStatus === 'detected' || rightStatus === 'detected') && (
                    <div className="absolute top-3 right-1/4 w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hold to start ignition</p>
              </TooltipContent>
            </Tooltip>

            {/* AC Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onMouseDown={handleAcPress}
                  onMouseUp={handleAcRelease}
                  onMouseLeave={handleAcRelease}
                  onTouchStart={handleAcPress}
                  onTouchEnd={handleAcRelease}
                  className={`w-36 h-36 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                    isAcPressed || acOn
                      ? 'bg-gradient-primary scale-95'
                      : 'bg-card border-2 border-border hover:border-primary/50'
                  }`}
                >
                  <Wind className={`h-10 w-10 transition-all ${
                    isAcPressed || acOn ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hold to activate AC</p>
              </TooltipContent>
            </Tooltip>

            {/* Camera Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCameraClick}
                  className="w-32 h-32 mx-auto rounded-full bg-card border-2 border-border hover:border-primary/50 transition-all shadow-control hover:shadow-glow flex items-center justify-center group"
                >
                  <Video className="h-9 w-9 text-muted-foreground group-hover:text-primary transition-all" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open 360° camera view</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status Text */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              {ignitionOn ? "Engine Running" : "Engine Stopped"}
            </p>
            {(leftStatus === 'detected' || rightStatus === 'detected') && (
              <p className="text-xs text-success font-medium animate-pulse">
                ⚠️ Blindspot Detection Active
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground">
            VehiCtrl System v1.0 • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};
