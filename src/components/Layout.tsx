import { ReactNode } from "react";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Layout = ({ children, showBackButton, onBackClick }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50 backdrop-blur-lg bg-card/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {showBackButton && onBackClick ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center p-1.5 shadow-glow">
                <img src={logo} alt="VehiCtrl" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">VehiCtrl</h1>
            </div>
          )}
          
          {/* Profile & Settings */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="transition-all hover:bg-primary/10 hover:text-primary"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="transition-all hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
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
