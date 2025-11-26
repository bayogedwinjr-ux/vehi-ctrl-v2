import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface PinSetupProps {
  onComplete: (pin: string) => void;
}

export const PinSetup = ({ onComplete }: PinSetupProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [showPin, setShowPin] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const handlePinComplete = async (value: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    
    if (step === "create") {
      setPin(value);
      setStep("confirm");
      setConfirmPin("");
      toast.success("Now confirm your PIN");
    } else {
      setConfirmPin(value);
    }
  };

  const handleConfirm = async () => {
    if (pin === confirmPin) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      toast.success("PIN created successfully!");
      onComplete(pin);
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      
      toast.error("PINs don't match. Please try again.");
      setStep("create");
      setPin("");
      setConfirmPin("");
    }
  };

  const currentValue = step === "create" ? pin : confirmPin;
  const isComplete = currentValue.length === 6;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Security Setup</h1>
            <p className="text-muted-foreground">
              {step === "create" 
                ? "Create a 6-digit PIN to secure your app"
                : "Confirm your PIN"}
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className={shakeError ? "animate-shake" : ""}>
                <InputOTP
                  maxLength={6}
                  value={currentValue}
                  onChange={(value) => {
                    if (step === "create") {
                      setPin(value);
                    } else {
                      setConfirmPin(value);
                    }
                  }}
                  onComplete={handlePinComplete}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-12 h-14 text-2xl"
                        masked={!showPin}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="text-muted-foreground"
              >
                {showPin ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide PIN
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show PIN
                  </>
                )}
              </Button>
            </div>

          </div>

          {step === "confirm" && (
            <Button
              onClick={handleConfirm}
              disabled={!isComplete}
              className="w-full"
              size="lg"
            >
              Confirm PIN
            </Button>
          )}

          {step === "create" && (
            <div className="text-center text-sm text-muted-foreground">
              Enter 6 digits to create your PIN
            </div>
          )}
        </Card>

        <Card className="p-4 bg-card/50 border-primary/20">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Security Notice</p>
              <p>Your PIN is stored securely on your device. You'll need it every time you open the app.</p>
            </div>
          </div>
        </Card>

        <footer className="pt-8 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              TechnoDrive System v1.0
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by: Reggienald Labayen
            </p>
            <p className="text-xs text-muted-foreground">
              • All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
