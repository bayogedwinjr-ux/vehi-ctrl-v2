import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { UserData } from "@/types/user";
import { User, Mail, Phone, Car } from "lucide-react";

interface ProfileProps {
  userData: UserData;
}

export const Profile = ({ userData }: ProfileProps) => {
  return (
    <Layout>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your vehicle and owner information</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="p-4 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData.ownerName}</h2>
              <p className="text-sm text-muted-foreground">Vehicle Owner</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">VIN/Chassis Number</p>
                <p className="font-semibold">{userData.vinNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-semibold">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Mobile Number</p>
                <p className="font-semibold">{userData.mobileNumber}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-primary/20">
          <p className="text-sm text-muted-foreground">
            To update your information, go to Settings and edit your profile details.
          </p>
        </Card>
      </div>
    </Layout>
  );
};
