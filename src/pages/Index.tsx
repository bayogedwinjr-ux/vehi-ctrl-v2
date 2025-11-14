import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ControllerView } from "@/components/ControllerView";
import { CameraView } from "@/components/CameraView";
import { BlindSpotView } from "@/components/BlindSpotView";

const Index = () => {
  const [activeView, setActiveView] = useState<"controller" | "camera" | "blindspot">("controller");

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === "controller" && <ControllerView />}
      {activeView === "camera" && <CameraView />}
      {activeView === "blindspot" && <BlindSpotView />}
    </Layout>
  );
};

export default Index;
