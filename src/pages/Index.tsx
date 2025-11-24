import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { DashboardView } from "@/components/DashboardView";
import { CameraView } from "@/components/CameraView";
import { Welcome } from "./Welcome";
import { Registration } from "./Registration";
import { PinSetup } from "./PinSetup";
import { PinEntry } from "./PinEntry";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UserData, AppState } from "@/types/user";

const Index = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "camera">("dashboard");
  const [acOn, setAcOn] = useState(false);
  
  // Local storage state
  const [userData, setUserData] = useLocalStorage<UserData | null>("userData", null);
  const [storedPin, setStoredPin] = useLocalStorage<string | null>("userPin", null);
  const [appState, setAppState] = useLocalStorage<AppState>("appState", {
    hasCompletedOnboarding: false,
    hasSetPin: false,
    isUnlocked: false,
  });

  // Onboarding flow state
  const [onboardingStep, setOnboardingStep] = useState<"welcome" | "registration" | "pinSetup">("welcome");

  // Lock app on mount if PIN exists but not unlocked
  useEffect(() => {
    if (storedPin && !appState.isUnlocked) {
      setAppState(prev => ({ ...prev, isUnlocked: false }));
    }
  }, []);

  // Handle registration completion
  const handleRegistrationComplete = (data: UserData) => {
    setUserData(data);
    setOnboardingStep("pinSetup");
  };

  // Handle PIN setup completion
  const handlePinSetupComplete = (pin: string) => {
    setStoredPin(pin);
    setAppState({
      hasCompletedOnboarding: true,
      hasSetPin: true,
      isUnlocked: true,
    });
  };

  // Handle PIN entry success
  const handlePinEntrySuccess = () => {
    setAppState(prev => ({ ...prev, isUnlocked: true }));
  };

  // Show onboarding if not completed
  if (!appState.hasCompletedOnboarding) {
    if (onboardingStep === "welcome") {
      return <Welcome onGetStarted={() => setOnboardingStep("registration")} />;
    }
    if (onboardingStep === "registration") {
      return (
        <Registration
          onComplete={handleRegistrationComplete}
          onBack={() => setOnboardingStep("welcome")}
        />
      );
    }
    if (onboardingStep === "pinSetup") {
      return <PinSetup onComplete={handlePinSetupComplete} />;
    }
  }

  // Show PIN entry if app is locked
  if (storedPin && !appState.isUnlocked) {
    return <PinEntry storedPin={storedPin} onSuccess={handlePinEntrySuccess} />;
  }

  // Show main app
  return (
    <Layout 
      showBackButton={activeView === "camera"}
      onBackClick={() => setActiveView("dashboard")}
    >
      {activeView === "dashboard" && (
        <DashboardView 
          onCameraClick={() => setActiveView("camera")}
          acOn={acOn}
          setAcOn={setAcOn}
        />
      )}
      {activeView === "camera" && <CameraView />}
    </Layout>
  );
};

export default Index;
