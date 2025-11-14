import { useState } from "react";
import { Layout } from "@/components/Layout";
import { DashboardView } from "@/components/DashboardView";
import { CameraView } from "@/components/CameraView";

const Index = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "camera">("dashboard");

  return (
    <Layout 
      showBackButton={activeView === "camera"}
      onBackClick={() => setActiveView("dashboard")}
    >
      {activeView === "dashboard" && <DashboardView onCameraClick={() => setActiveView("camera")} />}
      {activeView === "camera" && <CameraView />}
    </Layout>
  );
};

export default Index;
