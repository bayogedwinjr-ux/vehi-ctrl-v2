import { useState } from "react";
import { Power, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const RASPBERRY_PI_IP = "192.168.0.144";

export const ControllerView = () => {
  const [ignitionOn, setIgnitionOn] = useState(false);
  const [acOn, setAcOn] = useState(false);

  const handleIgnitionToggle = async () => {
    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ignition=${!ignitionOn ? '1' : '0'}`);
      if (response.ok) {
        setIgnitionOn(!ignitionOn);
        toast.success(ignitionOn ? "Ignition turned off" : "Ignition started");
      }
    } catch (error) {
      toast.error("Failed to control ignition");
      console.error('Ignition control error:', error);
    }
  };

  const handleAcToggle = async () => {
    try {
      const newAcState = !acOn;
      const response = await fetch(`http://${RASPBERRY_PI_IP}/control?ac=${newAcState ? '1' : '0'}`);
      if (response.ok) {
        setAcOn(newAcState);
        toast.success(newAcState ? "AC turned on" : "AC turned off");
      }
    } catch (error) {
      toast.error("Failed to control AC");
      console.error('AC control error:', error);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Status Banner */}
      <Card className="p-4 bg-gradient-card border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Vehicle Status</p>
            <p className="text-lg font-semibold text-primary">
              {ignitionOn ? "Running" : "Stopped"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ignitionOn && (
              <div className="flex items-center gap-2 text-success">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">Active</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Controls */}
      <div className="grid grid-cols-1 gap-4">
        {/* Ignition Control */}
        <Card className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${ignitionOn ? 'bg-success/20 text-success' : 'bg-muted'}`}>
                <Power className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ignition</h3>
                <p className="text-sm text-muted-foreground">
                  {ignitionOn ? "Engine running" : "Engine stopped"}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleIgnitionToggle}
            variant={ignitionOn ? "destructive" : "default"}
            className="w-full h-14 text-lg font-semibold shadow-control hover:shadow-glow transition-all"
          >
            {ignitionOn ? "Stop Engine" : "Start Engine"}
          </Button>
        </Card>

        {/* AC Control */}
        <Card className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${acOn ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                <Wind className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Air Conditioner</h3>
                <p className="text-sm text-muted-foreground">
                  {acOn ? "Running" : "AC is off"}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAcToggle}
            variant={acOn ? "secondary" : "default"}
            className="w-full h-14 text-lg font-semibold shadow-control hover:shadow-glow transition-all"
          >
            {acOn ? "Turn Off AC" : "Turn On AC"}
          </Button>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="p-4 bg-card/50 border-border">
        <p className="text-xs text-muted-foreground text-center">
          All controls are connected to your vehicle's automation system
        </p>
      </Card>
    </div>
  );
};
