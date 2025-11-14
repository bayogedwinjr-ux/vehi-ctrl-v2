import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface SensorData {
  left: number | null; // 0 = no object, 1 = object detected
  right: number | null; // 0 = no object, 1 = object detected
}

export const BlindSpotView = () => {
  const [sensorData, setSensorData] = useState<SensorData>({ left: null, right: null });

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        // Fetch left sensor data
        const leftResponse = await fetch('http://192.168.0.226/data');
        const leftData = await leftResponse.json();
        
        // Fetch right sensor data
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

    // Fetch initially
    fetchSensorData();

    // Poll every 500ms for real-time updates
    const interval = setInterval(fetchSensorData, 500);

    return () => clearInterval(interval);
  }, []);

  const getDetectionStatus = (value: number | null) => {
    if (value === null) return 'offline';
    return value === 1 ? 'detected' : 'clear';
  };

  const leftStatus = getDetectionStatus(sensorData.left);
  const rightStatus = getDetectionStatus(sensorData.right);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Blind Spot Monitor</h2>
        <p className="text-sm text-muted-foreground">
          Real-time ultrasonic sensor data from rear blind spots
        </p>
      </div>

      {/* Car Visualization */}
      <Card className="p-8 bg-gradient-card border-border">
        <div className="relative max-w-md mx-auto">
          {/* Car Body (simplified rear view) */}
          <svg viewBox="0 0 300 400" className="w-full h-auto">
            {/* Car outline */}
            <rect x="50" y="50" width="200" height="300" rx="20" 
              className="fill-muted/50 stroke-foreground stroke-2" />
            
            {/* Rear window */}
            <rect x="70" y="70" width="160" height="100" rx="10" 
              className="fill-background/50 stroke-foreground" />
            
            {/* Left blind spot indicator */}
            <g className={`transition-all duration-300 ${
              leftStatus === 'detected' ? 'opacity-100' : 'opacity-30'
            }`}>
              <path d="M 30 150 Q 0 200 30 250" 
                className={`stroke-2 fill-none ${
                  leftStatus === 'detected' ? 'stroke-destructive' : 'stroke-primary'
                }`} 
                strokeWidth="3" />
            </g>
            
            {/* Right blind spot indicator */}
            <g className={`transition-all duration-300 ${
              rightStatus === 'detected' ? 'opacity-100' : 'opacity-30'
            }`}>
              <path d="M 270 150 Q 300 200 270 250" 
                className={`stroke-2 fill-none ${
                  rightStatus === 'detected' ? 'stroke-destructive' : 'stroke-primary'
                }`} 
                strokeWidth="3" />
            </g>
            
            {/* Tail lights - Left */}
            <rect x="60" y="330" width="30" height="15" rx="3" 
              className={`transition-all duration-300 ${
                leftStatus === 'detected' ? 'fill-destructive animate-pulse' : 'fill-muted/50'
              }`} />
            
            {/* Tail lights - Right */}
            <rect x="210" y="330" width="30" height="15" rx="3" 
              className={`transition-all duration-300 ${
                rightStatus === 'detected' ? 'fill-destructive animate-pulse' : 'fill-muted/50'
              }`} />
          </svg>

          {/* Status labels */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 text-center">
            <p className="text-xs text-muted-foreground mb-1">Left</p>
            <p className={`text-sm font-bold ${
              leftStatus === 'detected' ? 'text-destructive' :
              leftStatus === 'offline' ? 'text-muted-foreground' : 'text-success'
            }`}>
              {leftStatus === 'detected' ? 'ALERT' : leftStatus === 'offline' ? 'OFF' : 'CLEAR'}
            </p>
          </div>
          
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 text-center">
            <p className="text-xs text-muted-foreground mb-1">Right</p>
            <p className={`text-sm font-bold ${
              rightStatus === 'detected' ? 'text-destructive' :
              rightStatus === 'offline' ? 'text-muted-foreground' : 'text-success'
            }`}>
              {rightStatus === 'detected' ? 'ALERT' : rightStatus === 'offline' ? 'OFF' : 'CLEAR'}
            </p>
          </div>
        </div>
      </Card>

      {/* Sensor Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Sensor */}
        <Card className="p-4 bg-gradient-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Left Sensor</h3>
            <div className={`w-3 h-3 rounded-full ${
              leftStatus === 'offline' ? 'bg-muted' :
              leftStatus === 'detected' ? 'bg-destructive animate-pulse' : 'bg-success'
            }`} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">IP: 192.168.0.226</p>
          <p className="text-2xl font-bold mb-2">
            {sensorData.left !== null ? (sensorData.left === 1 ? 'Object Detected' : 'Clear') : 'Offline'}
          </p>
          {leftStatus === 'detected' && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Object in blind spot!</span>
            </div>
          )}
        </Card>

        {/* Right Sensor */}
        <Card className="p-4 bg-gradient-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Right Sensor</h3>
            <div className={`w-3 h-3 rounded-full ${
              rightStatus === 'offline' ? 'bg-muted' :
              rightStatus === 'detected' ? 'bg-destructive animate-pulse' : 'bg-success'
            }`} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">IP: 192.168.0.227</p>
          <p className="text-2xl font-bold mb-2">
            {sensorData.right !== null ? (sensorData.right === 1 ? 'Object Detected' : 'Clear') : 'Offline'}
          </p>
          {rightStatus === 'detected' && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Object in blind spot!</span>
            </div>
          )}
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-card/50 border-border">
        <p className="text-sm font-semibold mb-2">Detection Status</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Red: Object detected (&lt;1m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted/30" />
            <span className="text-muted-foreground">Gray: Clear / No object</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
