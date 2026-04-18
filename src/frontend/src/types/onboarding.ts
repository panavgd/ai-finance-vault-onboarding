export type AgeRange = "20" | "30" | "40" | "50" | "60" | "70" | "80" | "";
export type MaritalStatus = "married" | "single" | "";
export type MonthlyIncome = "0-5l" | "5-10" | "10-30" | "50+" | "";
export type BuildingGoal = "personal_wealth" | "business" | "family" | "legacy";
export type AssetType =
  | "property"
  | "stocks"
  | "savings"
  | "crypto"
  | "bonds"
  | "business"
  | "other";

export interface OnboardingData {
  // Step 1: Welcome
  fullName: string;
  phone: string;

  // Step 2: Identity
  buildingGoals: BuildingGoal[];
  ageRange: AgeRange;
  maritalStatus: MaritalStatus;

  // Step 3: Financial Profile
  income: MonthlyIncome;
  assets: number;
  cars: number;
  dependents: number;
  hasDocuments: boolean | null;
  isInsured: boolean | null;

  // Step 4: Asset Allocation
  selectedAssets: AssetType[];

  // Step 7: Security
  pinCode?: string;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  fullName: "",
  phone: "",
  buildingGoals: [],
  ageRange: "",
  maritalStatus: "",
  income: "",
  assets: 3,
  cars: 1,
  dependents: 2,
  hasDocuments: null,
  isInsured: null,
  selectedAssets: [],
};

export const STEP_TITLES = [
  "Securing your vault",
  "About you",
  "Your identity",
  "Tell us about you",
  "Financial setup",
  "Your assets",
  "Secure your vault",
  "All done",
] as const;

export const TOTAL_STEPS = STEP_TITLES.length; // 8
