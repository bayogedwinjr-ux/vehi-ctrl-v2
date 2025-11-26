import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserData } from "@/types/user";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface RegistrationProps {
  onComplete: (userData: UserData) => void;
  onBack: () => void;
}

export const Registration = ({ onComplete, onBack }: RegistrationProps) => {
  const [formData, setFormData] = useState<UserData>({
    vinNumber: "",
    ownerName: "",
    email: "",
    mobileNumber: "",
  });

  const [errors, setErrors] = useState<Partial<UserData>>({});

  const validate = () => {
    const newErrors: Partial<UserData> = {};

    if (!formData.vinNumber.trim()) {
      newErrors.vinNumber = "VIN/Chassis number is required";
    } else if (formData.vinNumber.length < 5) {
      newErrors.vinNumber = "VIN must be at least 5 characters";
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      toast.success("Registration successful!");
      onComplete(formData);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Setup</h1>
          <p className="text-muted-foreground">Enter your vehicle and owner details</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vinNumber">VIN/Chassis Number *</Label>
              <Input
                id="vinNumber"
                value={formData.vinNumber}
                onChange={(e) => handleChange("vinNumber", e.target.value)}
                placeholder="Enter VIN or chassis number"
                className={errors.vinNumber ? "border-destructive" : ""}
              />
              {errors.vinNumber && (
                <p className="text-xs text-destructive">{errors.vinNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                placeholder="Enter your full name"
                className={errors.ownerName ? "border-destructive" : ""}
              />
              {errors.ownerName && (
                <p className="text-xs text-destructive">{errors.ownerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                placeholder="+1 (234) 567-8900"
                className={errors.mobileNumber ? "border-destructive" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue to Security Setup
            </Button>
          </form>
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
