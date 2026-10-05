"use client";

import OnboardingScreenGate from "@/components/onboarding/OnboardingScreenGate";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import AthleteGameSelector from "@/components/onboarding/AthleteGameSelector";

export default function AthleteOnboardingPage() {
  return (
    <OnboardingScreenGate role="athlete">
      <OnboardingShell stepLabel="Athlete Onboarding" accent="brand">
        <AthleteGameSelector />
      </OnboardingShell>
    </OnboardingScreenGate>
  );
}
