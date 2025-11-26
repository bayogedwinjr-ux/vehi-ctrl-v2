import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { DashboardView } from "@/components/DashboardView";
import { CameraView } from "@/components/CameraView";
import { Welcome } from "./Welcome";
import { Registration } from "./Registration";
import { PinSetup } from "./PinSetup";
import { PinEntry } from "./PinEntry";
import { NetworkStatusOverlay } from "@/components/NetworkStatusOverlay";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useVehicleAuth } from "@/hooks/useVehicleAuth";
import { UserData, AppState } from "@/types/user";

const Index = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "camera">("dashboard");
  const [acOn, setAcOn] = useState(false);
  
  // Network and auth hooks
  const { isConnected, checkNow: retryConnection, hasInitialCheck } = useNetworkStatus();
  const { authState, verifyDevice } = useVehicleAuth();
  
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

  // Lock app on initial mount only - not on navigation
  useEffect(() => {
    const hasInitialized = sessionStorage.getItem('appInitialized');
    
    if (!hasInitialized && storedPin && appState.hasCompletedOnboarding) {
      setAppState(prev => ({ ...prev, isUnlocked: false }));
      sessionStorage.setItem('appInitialized', 'true');
    }
  }, []);

  // Verify device authorization on mount (if onboarding completed)
  useEffect(() => {
    if (appState.hasCompletedOnboarding && authState === 'checking') {
      verifyDevice();
    }
  }, [appState.hasCompletedOnboarding, authState, verifyDevice]);

  // Handle retry connection
  const handleRetry = () => {
    retryConnection();
    if (appState.hasCompletedOnboarding) {
      verifyDevice();
    }
  };

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
    return (
      <>
        <PinEntry storedPin={storedPin} onSuccess={handlePinEntrySuccess} />
      <NetworkStatusOverlay 
        isConnected={isConnected}
        authState={authState}
        onRetry={handleRetry}
        hasInitialCheck={hasInitialCheck}
      />
      </>
    );
  }

  // Show main app
  return (
    <>
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
      
      <NetworkStatusOverlay 
        isConnected={isConnected}
        authState={authState}
        onRetry={handleRetry}
        hasInitialCheck={hasInitialCheck}
      />
    </>
  );
};

export default Index;
