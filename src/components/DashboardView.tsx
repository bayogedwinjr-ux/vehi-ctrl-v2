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
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md mx-auto relative flex items-center justify-center">
          {/* Blindspot Detection - Left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 flex flex-col items-center gap-2">
            <div className="flex flex-col-reverse gap-1">
              {[60, 75, 90].map((height, i) => (
                <svg key={i} width="32" height={height} viewBox={`0 0 32 ${height}`}>
                  <path
                    d={`M 28 ${height} Q 22 ${height * 0.6} 22 0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${
                      leftStatus === 'detected' 
                        ? 'text-success' 
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </svg>
              ))}
            </div>
            <div className="text-[11px] text-center text-muted-foreground font-medium">
              <div>Left</div>
              <div className={leftStatus === 'detected' ? 'text-success font-semibold' : ''}>
                {leftStatus === 'detected' ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>

          {/* Blindspot Detection - Right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 flex flex-col items-center gap-2">
            <div className="flex flex-col-reverse gap-1">
              {[60, 75, 90].map((height, i) => (
                <svg key={i} width="32" height={height} viewBox={`0 0 32 ${height}`}>
                  <path
                    d={`M 4 ${height} Q 10 ${height * 0.6} 10 0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${
                      rightStatus === 'detected' 
                        ? 'text-success' 
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </svg>
              ))}
            </div>
            <div className="text-[11px] text-center text-muted-foreground font-medium">
              <div>Right</div>
              <div className={rightStatus === 'detected' ? 'text-success font-semibold' : ''}>
                {rightStatus === 'detected' ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>

          {/* Main Control Buttons - All Equal Size */}
          <div className="flex flex-col items-center gap-4">
            {/* Ignition Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <button
                    onMouseDown={handleIgnitionPress}
                    onMouseUp={handleIgnitionRelease}
                    onMouseLeave={handleIgnitionRelease}
                    onTouchStart={handleIgnitionPress}
                    onTouchEnd={handleIgnitionRelease}
                    className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                      isIgnitionPressed || ignitionOn
                        ? 'bg-gradient-primary scale-95'
                        : 'bg-card border-2 border-border hover:border-primary/50'
                    }`}
                  >
                    <Power className={`h-11 w-11 transition-all ${
                      isIgnitionPressed || ignitionOn ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </button>
                  {(leftStatus === 'detected' || rightStatus === 'detected') && (
                    <div className="absolute top-2 right-8 w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
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
                  className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                    isAcPressed || acOn
                      ? 'bg-gradient-primary scale-95'
                      : 'bg-card border-2 border-border hover:border-primary/50'
                  }`}
                >
                  <Wind className={`h-11 w-11 transition-all ${
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
                  className="w-36 h-36 rounded-full bg-card border-2 border-border hover:border-primary/50 transition-all shadow-control hover:shadow-glow flex items-center justify-center group"
                >
                  <Video className="h-11 w-11 text-muted-foreground group-hover:text-primary transition-all" />
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
      <div className="pb-3 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {ignitionOn ? "Engine Running" : "Engine Stopped"}
        </p>
        {(leftStatus === 'detected' || rightStatus === 'detected') && (
          <p className="text-xs text-success font-medium animate-pulse">
            ⚠️ Blindspot Detection Active
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
