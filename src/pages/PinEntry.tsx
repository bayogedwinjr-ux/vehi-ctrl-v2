import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

interface PinEntryProps {
  storedPin: string;
  onSuccess: () => void;
}

export const PinEntry = ({ storedPin, onSuccess }: PinEntryProps) => {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showPin, setShowPin] = useState(false);

  const handlePinComplete = (value: string) => {
    if (value === storedPin) {
      toast.success("Access granted!");
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      
      if (newAttempts >= 3) {
        toast.error("Too many failed attempts. Please wait 30 seconds.");
        setTimeout(() => setAttempts(0), 30000);
      } else {
        toast.error(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const isLocked = attempts >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <img src={logo} alt="TechnoDrive" className="w-20 h-20 object-contain relative" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">TechnoDrive</h1>
            <p className="text-muted-foreground">Enter your PIN to continue</p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={setPin}
              onComplete={handlePinComplete}
              disabled={isLocked}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPin(!showPin)}
              className="text-muted-foreground"
              disabled={isLocked}
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

            {isLocked && (
              <p className="text-sm text-destructive text-center">
                Too many failed attempts. Please wait 30 seconds.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, idx) => (
              <Button
                key={idx}
                variant={num === "" ? "ghost" : "outline"}
                size="lg"
                disabled={num === "" || isLocked || pin.length >= 6}
                onClick={() => {
                  if (num === "⌫") {
                    setPin(prev => prev.slice(0, -1));
                  } else if (typeof num === "number") {
                    if (pin.length < 6) {
                      const newPin = pin + num;
                      setPin(newPin);
                      if (newPin.length === 6) {
                        handlePinComplete(newPin);
                      }
                    }
                  }
                }}
                className="h-14 text-lg font-semibold"
              >
                {num}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
