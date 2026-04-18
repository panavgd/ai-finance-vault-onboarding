import { create } from "zustand";
import type { OnboardingData } from "../types/onboarding";
import { INITIAL_ONBOARDING_DATA } from "../types/onboarding";

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  direction: "forward" | "backward";
  aiTransitionActive: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  setAiTransitionActive: (active: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: INITIAL_ONBOARDING_DATA,
  direction: "forward",
  aiTransitionActive: false,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 8),
      direction: "forward",
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
      direction: "backward",
    })),

  updateData: (updates) =>
    set((state) => ({
      data: { ...state.data, ...updates },
    })),

  setAiTransitionActive: (active) => set({ aiTransitionActive: active }),

  reset: () =>
    set({
      currentStep: 1,
      data: INITIAL_ONBOARDING_DATA,
      direction: "forward",
      aiTransitionActive: false,
    }),
}));
