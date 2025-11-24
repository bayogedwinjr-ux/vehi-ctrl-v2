import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, Shield, Video, Wind } from "lucide-react";
import logo from "@/assets/logo.png";

interface WelcomeProps {
  onGetStarted: () => void;
}

export const Welcome = ({ onGetStarted }: WelcomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <img src={logo} alt="TechnoDrive" className="w-24 h-24 object-contain relative" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">TechnoDrive</h1>
            <p className="text-muted-foreground">Smart Vehicle Control System</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          <Card className="p-4 bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Remote Control</h3>
                <p className="text-sm text-muted-foreground">Control ignition, starter, and AC from your device</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">360° Camera View</h3>
                <p className="text-sm text-muted-foreground">Real-time monitoring with blindspot detection</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Secure Access</h3>
                <p className="text-sm text-muted-foreground">PIN-protected for maximum security</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Get Started Button */}
        <Button 
          onClick={onGetStarted}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          Get Started
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to set up your vehicle profile
        </p>
      </div>
    </div>
  );
};
