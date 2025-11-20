import { useEffect, useState } from "react";
import { Power, Wind, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RASPBERRY_PI_IP = "192.168.8.101";

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

  // Fetch blindspot sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const leftResponse = await fetch('http://192.168.8.226/data');
        const leftData = await leftResponse.json();
        
        const rightResponse = await fetch('http://192.168.8.227/data');
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

  const handleAcToggle = async () => {
    const newAcState = !acOn;
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ac=${newAcState ? 1 : 0}`);
      if (response.ok) {
        setAcOn(newAcState);
        toast.success(newAcState ? "AC turned on" : "AC turned off");
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
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
          {/* Blindspot Detection - Car Tail Lights Style */}
          <div className="flex items-center justify-between w-full max-w-xs">
            {/* Left Tail Light */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-20 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
                leftStatus === 'detected' 
                  ? 'bg-destructive/90 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                  : 'bg-muted/30 border-border'
              }`}>
                {/* Inner glow effect */}
                <div className={`absolute inset-2 rounded transition-all duration-300 ${
                  leftStatus === 'detected' 
                    ? 'bg-destructive/40 shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                    : 'bg-muted/20'
                }`} />
                {/* Reflective bars */}
                <div className="absolute inset-x-0 top-1/3 h-0.5 bg-foreground/10" />
                <div className="absolute inset-x-0 bottom-1/3 h-0.5 bg-foreground/10" />
              </div>
              <div className="text-[10px] text-center text-muted-foreground font-medium">
                <div className={leftStatus === 'detected' ? 'text-destructive font-semibold' : ''}>
                  {leftStatus === 'detected' ? 'DETECTED' : 'CLEAR'}
                </div>
              </div>
            </div>

            {/* Right Tail Light */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-16 h-20 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
                rightStatus === 'detected' 
                  ? 'bg-destructive/90 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                  : 'bg-muted/30 border-border'
              }`}>
                {/* Inner glow effect */}
                <div className={`absolute inset-2 rounded transition-all duration-300 ${
                  rightStatus === 'detected' 
                    ? 'bg-destructive/40 shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                    : 'bg-muted/20'
                }`} />
                {/* Reflective bars */}
                <div className="absolute inset-x-0 top-1/3 h-0.5 bg-foreground/10" />
                <div className="absolute inset-x-0 bottom-1/3 h-0.5 bg-foreground/10" />
              </div>
              <div className="text-[10px] text-center text-muted-foreground font-medium">
                <div className={rightStatus === 'detected' ? 'text-destructive font-semibold' : ''}>
                  {rightStatus === 'detected' ? 'DETECTED' : 'CLEAR'}
                </div>
              </div>
            </div>
          </div>

          {/* Main Control Buttons - All Equal Size */}
          <div className="flex flex-col items-center gap-3">
            {/* Ignition Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                  <button
                    onMouseDown={handleIgnitionPress}
                    onMouseUp={handleIgnitionRelease}
                    onMouseLeave={handleIgnitionRelease}
                    onTouchStart={handleIgnitionPress}
                    onTouchEnd={handleIgnitionRelease}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                      isIgnitionPressed || ignitionOn
                        ? 'bg-gradient-primary scale-95'
                        : 'bg-card border-2 border-border hover:border-primary/50'
                    }`}
                  >
                    <Power className={`h-10 w-10 transition-all ${
                      isIgnitionPressed || ignitionOn ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hold to start ignition</p>
              </TooltipContent>
            </Tooltip>

            {/* AC Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAcToggle}
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                    acOn
                      ? 'bg-gradient-primary scale-95'
                      : 'bg-card border-2 border-border hover:border-primary/50'
                  }`}
                >
                  <Wind className={`h-10 w-10 transition-all ${
                    acOn ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle AC on/off</p>
              </TooltipContent>
            </Tooltip>

            {/* Camera Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCameraClick}
                  className="w-32 h-32 rounded-full bg-card border-2 border-border hover:border-primary/50 transition-all shadow-control hover:shadow-glow flex items-center justify-center group"
                >
                  <Video className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-all" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open 360° camera view</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="pb-2 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {ignitionOn ? "Engine Running" : "Engine Stopped"}
        </p>
        {(leftStatus === 'detected' || rightStatus === 'detected') && (
          <p className="text-xs text-destructive font-medium animate-pulse">
            ⚠️ Blindspot Alert
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="py-2 border-t border-border/50 flex-shrink-0">
        <div className="container mx-auto px-4">
          <p className="text-[10px] text-center text-muted-foreground">
            VehiCtrl System v1.0 • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};
