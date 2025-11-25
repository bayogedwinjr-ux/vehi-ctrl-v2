import { useEffect, useState } from "react";
import { Power, Wind, Video, Key, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ESP32_IP1 = "192.168.8.220";
const ESP32_IP2 = "192.168.8.221";

interface SensorData {
  left: number | null;
  right: number | null;
}

interface DashboardViewProps {
  onCameraClick: () => void;
  acOn: boolean;
  setAcOn: (value: boolean) => void;
}

export const DashboardView = ({ onCameraClick, acOn, setAcOn }: DashboardViewProps) => {
  const [ignitionOn, setIgnitionOn] = useState(false);
  const [starterOn, setStarterOn] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ left: null, right: null });
  const [isIgnitionPressed, setIsIgnitionPressed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if this is first dashboard visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

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
    if (!starterOn) return; // Can't use ignition without starter
    setIsIgnitionPressed(true);
    try {
      const response = await fetch(`http://${ESP32_IP1}/control?ignition=1`);
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
      const response = await fetch(`http://${ESP32_IP1}/control?ignition=0`);
      if (response.ok) {
        setIgnitionOn(false);
        toast.success("Ignition turned off");
      }
    } catch (error) {
      toast.error("Failed to control ignition");
      console.error('Ignition control error:', error);
    }
  };

  const handleStarterToggle = async () => {
    const newStarterState = !starterOn;
    try {
      const response = await fetch(`http://${ESP32_IP1}/control?starter=${newStarterState ? 1 : 0}`);
      if (response.ok) {
        setStarterOn(newStarterState);
        toast.success(newStarterState ? "Starter enabled" : "Starter disabled");
      }
    } catch (error) {
      toast.error("Failed to control starter");
      console.error('Starter control error:', error);
    }
  };

  const handleAcToggle = async () => {
    const newAcState = !acOn;
    try {
      const response = await fetch(`http://${ESP32_IP2}/control?ac=${newAcState ? 1 : 0}`);
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
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-primary rounded-full animate-pulse">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Welcome to TechnoDrive! 🚗</DialogTitle>
            <DialogDescription className="text-center space-y-3 pt-2">
              <p className="text-base">
                Your vehicle control system is now ready to use.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
                <p className="font-semibold text-foreground">Quick Guide:</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• <span className="text-foreground">Starter</span> - Enable to unlock ignition</li>
                  <li>• <span className="text-foreground">Ignition</span> - Hold to start the engine</li>
                  <li>• <span className="text-foreground">AC</span> - Control climate system</li>
                  <li>• <span className="text-foreground">Camera</span> - View 360° surroundings</li>
                  <li>• <span className="text-foreground">Blindspot</span> - Red tail lights alert you</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Your app is secured with biometric authentication and PIN protection.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWelcome(false)} className="w-full" size="lg">
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 sm:gap-6">
          {/* Blindspot Detection - Car Tail Lights Style */}
          <div className="flex items-center justify-between w-full max-w-xs">
            {/* Left Tail Light */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-16 sm:w-16 sm:h-20 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
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
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-16 sm:w-16 sm:h-20 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
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
          <div className="flex flex-col items-center gap-2.5 sm:gap-3">
            {/* Ignition Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                  <button
                    onMouseDown={handleIgnitionPress}
                    onMouseUp={handleIgnitionRelease}
                    onMouseLeave={handleIgnitionRelease}
                    onTouchStart={handleIgnitionPress}
                    onTouchEnd={handleIgnitionRelease}
                    disabled={!starterOn}
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-control ${
                      !starterOn
                        ? 'bg-muted/50 border-2 border-border/50 cursor-not-allowed opacity-50'
                        : isIgnitionPressed || ignitionOn
                        ? 'bg-gradient-primary scale-95'
                        : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-glow'
                    }`}
                  >
                    <Power className={`h-8 w-8 sm:h-10 sm:w-10 transition-all ${
                      !starterOn ? 'text-muted-foreground/50' : isIgnitionPressed || ignitionOn ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{starterOn ? 'Hold to start ignition' : 'Enable starter first'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Starter Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleStarterToggle}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-control hover:shadow-glow ${
                    starterOn
                      ? 'bg-gradient-primary scale-95'
                      : 'bg-card border-2 border-border hover:border-primary/50'
                  }`}
                >
                  <Key className={`h-8 w-8 sm:h-10 sm:w-10 transition-all ${
                    starterOn ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enable starter system</p>
              </TooltipContent>
            </Tooltip>

            {/* AC Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAcToggle}
                  disabled={!ignitionOn && !starterOn}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-control ${
                    !ignitionOn && !starterOn
                      ? 'bg-muted/50 border-2 border-border/50 cursor-not-allowed opacity-50'
                      : acOn
                      ? 'bg-gradient-primary scale-95'
                      : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-glow'
                  }`}
                >
                  <Wind className={`h-8 w-8 sm:h-10 sm:w-10 transition-all ${
                    !ignitionOn && !starterOn ? 'text-muted-foreground/50' : acOn ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{!ignitionOn && !starterOn ? 'Enable starter or ignition first' : 'Toggle AC on/off'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Camera Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCameraClick}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-card border-2 border-border hover:border-primary/50 transition-all shadow-control hover:shadow-glow flex items-center justify-center group"
                >
                  <Video className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground group-hover:text-primary transition-all" />
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
      <div className="pb-3 sm:pb-2 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {ignitionOn ? "Engine Running" : starterOn ? "Starter Enabled" : "System Locked"}
        </p>
        {(leftStatus === 'detected' || rightStatus === 'detected') && (
          <p className="text-xs text-destructive font-medium animate-pulse">
            ⚠️ Blindspot Alert
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="py-3 sm:py-2 border-t border-border/50 flex-shrink-0">
        <div className="container mx-auto px-4">
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
            TechnoDrive System v1.0 • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
    </>
  );
};
