import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
import logo from "@/assets/logo.png";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { BiometricAuth, BiometryType } from "@aparajita/capacitor-biometric-auth";

interface PinEntryProps {
  storedPin: string;
  onSuccess: () => void;
}

export const PinEntry = ({ storedPin, onSuccess }: PinEntryProps) => {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutSeconds === 0 && attempts >= 3) {
      // Reset attempts when countdown reaches 0
      setAttempts(0);
    }
  }, [lockoutSeconds, attempts]);

  const checkBiometricAvailability = async () => {
    try {
      const result = await BiometricAuth.checkBiometry();
      setBiometricAvailable(result.isAvailable && 
        (result.biometryType === BiometryType.fingerprintAuthentication || 
         result.biometryType === BiometryType.faceAuthentication));
      
      // Auto-trigger biometric on mount if available
      if (result.isAvailable) {
        handleBiometricAuth();
      }
    } catch (error) {
      console.log("Biometric not available");
    }
  };

  const handleBiometricAuth = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      await BiometricAuth.authenticate({
        reason: "Authenticate to access TechnoDrive",
        cancelTitle: "Cancel",
        iosFallbackTitle: "Use PIN",
        androidTitle: "Biometric Authentication",
        androidSubtitle: "Verify your identity",
      });

      // If we reach here, authentication was successful
      await Haptics.impact({ style: ImpactStyle.Heavy });
      toast.success("Authentication successful!");
      onSuccess();
    } catch (error) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      console.log("Biometric auth failed or cancelled");
    }
  };

  const handlePinComplete = async (value: string) => {
    if (value === storedPin) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      toast.success("Access granted!");
      onSuccess();
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      
      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      
      if (newAttempts >= 3) {
        setLockoutSeconds(30);
        toast.error("Too many failed attempts. Locked for 30 seconds.");
      } else {
        toast.error(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleNumPress = async (num: number | string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    
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
  };

  const isLocked = attempts >= 3 && lockoutSeconds > 0;

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
            <div className={shakeError ? "animate-shake" : ""}>
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
            </div>

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

            {biometricAvailable && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleBiometricAuth}
                disabled={isLocked}
                className="w-full"
              >
                <Fingerprint className="mr-2 h-5 w-5" />
                Use Biometric Authentication
              </Button>
            )}

            {isLocked && (
              <div className="text-center space-y-1">
                <p className="text-sm text-destructive font-semibold">
                  Too many failed attempts
                </p>
                <p className="text-xs text-muted-foreground">
                  Please wait {lockoutSeconds} second{lockoutSeconds !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, idx) => (
              <Button
                key={idx}
                variant={num === "" ? "ghost" : "outline"}
                size="lg"
                disabled={num === "" || isLocked || pin.length >= 6}
                onClick={() => handleNumPress(num)}
                className="h-14 text-lg font-semibold"
              >
                {num}
              </Button>
            ))}
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
