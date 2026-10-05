"use client";

import OnboardingScreenGate from "@/components/onboarding/OnboardingScreenGate";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OrganizerSetupForm from "@/components/onboarding/OrganizerSetupForm";

export default function OrganizerOnboardingPage() {
  return (
    <OnboardingScreenGate role="organizer">
      <OnboardingShell stepLabel="Organizer Onboarding" accent="amber">
        <OrganizerSetupForm />
      </OnboardingShell>
    </OnboardingScreenGate>
  );
}
