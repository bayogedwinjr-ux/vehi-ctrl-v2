import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserData } from "@/types/user";
import { toast } from "sonner";
import { LogOut, Save, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsProps {
  userData: UserData;
  onSave: (userData: UserData) => void;
  onSignOut: () => void;
}

export const Settings = ({ userData, onSave, onSignOut }: SettingsProps) => {
  const [formData, setFormData] = useState<UserData>(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<UserData>>({});

  const validate = () => {
    const newErrors: Partial<UserData> = {};

    if (!formData.vinNumber.trim()) {
      newErrors.vinNumber = "VIN/Chassis number is required";
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      setIsEditing(false);
      toast.success("Settings saved successfully!");
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

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
    setErrors({});
  };

  return (
    <Layout showBackButton onBackClick={() => window.history.back()}>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vinNumber">VIN/Chassis Number</Label>
              <Input
                id="vinNumber"
                value={formData.vinNumber}
                onChange={(e) => handleChange("vinNumber", e.target.value)}
                disabled={!isEditing}
                className={errors.vinNumber ? "border-destructive" : ""}
              />
              {errors.vinNumber && (
                <p className="text-xs text-destructive">{errors.vinNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                disabled={!isEditing}
                className={errors.ownerName ? "border-destructive" : ""}
              />
              {errors.ownerName && (
                <p className="text-xs text-destructive">{errors.ownerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                disabled={!isEditing}
                className={errors.mobileNumber ? "border-destructive" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Your app is protected with a 6-digit PIN</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-destructive/20">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Signing out will clear all your data and require you to set up again
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out & Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all your profile information and security PIN. 
                    You'll need to complete the setup process again when you next open the app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onSignOut} className="bg-destructive hover:bg-destructive/90">
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
