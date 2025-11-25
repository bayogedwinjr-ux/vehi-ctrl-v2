import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface ChangePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPin: string;
  onPinChanged: (newPin: string) => void;
}

export const ChangePinDialog = ({ open, onOpenChange, currentPin, onPinChanged }: ChangePinDialogProps) => {
  const [step, setStep] = useState<"verify" | "new" | "confirm">("verify");
  const [verifyPin, setVerifyPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const resetDialog = () => {
    setStep("verify");
    setVerifyPin("");
    setNewPin("");
    setConfirmPin("");
    setShowPin(false);
    setShakeError(false);
  };

  const handleVerifyComplete = async (value: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    
    if (value === currentPin) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setStep("new");
      toast.success("Current PIN verified");
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      setVerifyPin("");
      toast.error("Incorrect PIN. Please try again.");
    }
  };

  const handleNewPinComplete = async (value: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    setNewPin(value);
    setStep("confirm");
    toast.success("Now confirm your new PIN");
  };

  const handleConfirmComplete = async (value: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    
    if (value === newPin) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      onPinChanged(newPin);
      toast.success("PIN changed successfully!");
      onOpenChange(false);
      resetDialog();
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      setConfirmPin("");
      toast.error("PINs don't match. Please try again.");
      setStep("new");
      setNewPin("");
    }
  };

  const getCurrentValue = () => {
    switch (step) {
      case "verify": return verifyPin;
      case "new": return newPin;
      case "confirm": return confirmPin;
    }
  };

  const getTitle = () => {
    switch (step) {
      case "verify": return "Verify Current PIN";
      case "new": return "Enter New PIN";
      case "confirm": return "Confirm New PIN";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "verify": return "Enter your current PIN to continue";
      case "new": return "Create a new 6-digit PIN";
      case "confirm": return "Re-enter your new PIN to confirm";
    }
  };

  const handleComplete = (value: string) => {
    switch (step) {
      case "verify": handleVerifyComplete(value); break;
      case "new": handleNewPinComplete(value); break;
      case "confirm": handleConfirmComplete(value); break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className={shakeError ? "animate-shake" : ""}>
              <InputOTP
                maxLength={6}
                value={getCurrentValue()}
                onChange={(value) => {
                  switch (step) {
                    case "verify": setVerifyPin(value); break;
                    case "new": setNewPin(value); break;
                    case "confirm": setConfirmPin(value); break;
                  }
                }}
                onComplete={handleComplete}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-12 text-xl"
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

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetDialog();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
