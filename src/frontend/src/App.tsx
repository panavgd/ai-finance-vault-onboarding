import { useState } from "react";
import { OnboardingLayout } from "./components/onboarding/OnboardingLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { VaultHome } from "./pages/VaultHome";
import { Step1Welcome } from "./pages/steps/Step1Welcome";
import { Step2Identity } from "./pages/steps/Step2Identity";
import { Step3FinancialSetup } from "./pages/steps/Step3FinancialSetup";
import { Step3PersonalContext } from "./pages/steps/Step3PersonalContext";
import { Step4AssetAllocation } from "./pages/steps/Step4AssetAllocation";
import { Step5VaultReady } from "./pages/steps/Step5VaultReady";
import { Step7Security } from "./pages/steps/Step7Security";
import { StepCreateVault } from "./pages/steps/StepCreateVault";
import { useOnboardingStore } from "./store/onboardingStore";

const STEPS = [
  Step1Welcome, // 1 — Getting started
  Step2Identity, // 2 — What are you building?
  StepCreateVault, // 3 — Create your vault
  Step3PersonalContext, // 4 — Tell us about you
  Step3FinancialSetup, // 5 — Your financial setup
  Step4AssetAllocation, // 6 — Analyzing your wealth structure
  Step7Security, // 7 — Secure your vault
  Step5VaultReady, // 8 — Your vault is ready
] as const;

export default function App() {
  const { currentStep, reset } = useOnboardingStore();
  const [inVault, setInVault] = useState(false);

  const handleEnterVault = () => {
    setInVault(true);
  };

  const handleExitVault = () => {
    setInVault(false);
    reset();
  };

  if (inVault) {
    return (
      <ThemeProvider>
        <div style={{ minHeight: "100dvh", background: "var(--app-bg)" }}>
          <VaultHome onExit={handleExitVault} />
        </div>
      </ThemeProvider>
    );
  }

  const StepComponent = STEPS[currentStep - 1];

  return (
    <ThemeProvider>
      <div style={{ minHeight: "100dvh", background: "var(--app-bg)" }}>
        <OnboardingLayout>
          {currentStep === 8 ? (
            <Step5VaultReady
              key={currentStep}
              onEnterVault={handleEnterVault}
            />
          ) : (
            <StepComponent key={currentStep} />
          )}
        </OnboardingLayout>
      </div>
    </ThemeProvider>
  );
}
