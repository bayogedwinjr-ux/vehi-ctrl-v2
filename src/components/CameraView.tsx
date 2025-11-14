import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const cameraIPs = [
  { ip: "192.168.0.222", position: "Front" },
  { ip: "192.168.0.223", position: "Rear" },
  { ip: "192.168.0.224", position: "Left" },
  { ip: "192.168.0.225", position: "Right" },
];

export const CameraView = () => {
  const [cameraStatus, setCameraStatus] = useState<Record<string, boolean>>({});
  const [loadStreams, setLoadStreams] = useState(false);

  // Only load camera streams when component is mounted and visible
  useEffect(() => {
    setLoadStreams(true);
    
    // Cleanup: stop loading streams when component unmounts
    return () => {
      setLoadStreams(false);
    };
  }, []);

  const handleImageLoad = (ip: string) => {
    setCameraStatus(prev => ({ ...prev, [ip]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, ip: string) => {
    setCameraStatus(prev => ({ ...prev, [ip]: false }));
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message flex flex-col items-center justify-center gap-2 text-muted-foreground';
      errorDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <span class="text-sm">Camera offline</span>
      `;
      parent.appendChild(errorDiv);
    }
  };
  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">360° Camera View</h2>
        <p className="text-sm text-muted-foreground">
          Real-time video streams from all ESP32 cameras
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameraIPs.map((camera) => (
          <Card
            key={camera.ip}
            className="overflow-hidden bg-gradient-card border-border hover:border-primary/50 transition-all"
          >
            <div className="aspect-video bg-muted/50 relative flex items-center justify-center">
              {/* Camera Stream - Only load when component is visible */}
              {loadStreams ? (
                <img
                  src={`http://${camera.ip}/stream`}
                  alt={`${camera.position} camera`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(camera.ip)}
                  onError={(e) => handleImageError(e, camera.ip)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-6 w-6" />
                  <span className="text-sm">Initializing camera...</span>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{camera.position}</p>
                  <p className="text-xs text-muted-foreground">{camera.ip}</p>
                </div>
                {cameraStatus[camera.ip] && (
                  <div className="flex items-center gap-1 text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs">Live</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-card/50 border-border flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Camera System Info</p>
          <p>Make sure all ESP32 cameras are powered on and connected to the network. Streams refresh automatically.</p>
        </div>
      </Card>
    </div>
  );
};
