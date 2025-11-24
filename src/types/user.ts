export interface UserData {
  vinNumber: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  hasSetPin: boolean;
  isUnlocked: boolean;
}
