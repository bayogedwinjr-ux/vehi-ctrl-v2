import { ReactNode } from "react";
import { Camera, Gauge, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children: ReactNode;
  activeView: "controller" | "camera" | "blindspot";
  onViewChange: (view: "controller" | "camera" | "blindspot") => void;
}

export const Layout = ({ children, activeView, onViewChange }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50 backdrop-blur-lg bg-card/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="VehiCtrl" className="w-10 h-10" />
            <h1 className="text-xl font-bold tracking-tight">VehiCtrl</h1>
          </div>
          
          {/* View Switcher */}
          <div className="flex gap-2">
            <Button
              variant={activeView === "controller" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("controller")}
              className="transition-all"
            >
              <Gauge className="h-5 w-5" />
            </Button>
            <Button
              variant={activeView === "camera" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("camera")}
              className="transition-all"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              variant={activeView === "blindspot" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("blindspot")}
              className="transition-all"
            >
              <Radio className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
