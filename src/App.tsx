import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UserData } from "@/types/user";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  const [userData, setUserData] = useLocalStorage<UserData | null>("userData", null);
  const [, setStoredPin, removePin] = useLocalStorage<string | null>("userPin", null);
  const [, setAppState, removeAppState] = useLocalStorage("appState", {
    hasCompletedOnboarding: false,
    hasSetPin: false,
    isUnlocked: false,
  });

  const handleSaveUserData = (data: UserData) => {
    setUserData(data);
  };

  const handleSignOut = () => {
    setUserData(null);
    removePin();
    removeAppState();
    toast.success("Signed out successfully. Please restart the app.");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/profile" 
              element={
                userData ? (
                  <Profile userData={userData} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/settings" 
              element={
                userData ? (
                  <Settings 
                    userData={userData} 
                    onSave={handleSaveUserData}
                    onSignOut={handleSignOut}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
