
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import OnboardingDialog from './onboarding/OnboardingDialog';
import IntroStep from './onboarding/IntroStep';
import TutorialStep from './onboarding/TutorialStep';

interface HeatMizerOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const HeatMizerOnboarding = ({ open, onClose }: HeatMizerOnboardingProps) => {
  const [step, setStep] = useState<number>(1);

  const handleShowMeAround = () => {
    setStep(2);
  };

  const handleLeaveMeAlone = () => {
    localStorage.setItem('heatMizer_onboarded', 'true');
    onClose();
  };

  const handleMuteMizer = () => {
    localStorage.setItem('heatMizer_muted', 'true');
    localStorage.setItem('heatMizer_onboarded', 'true');
    
    toast({
      title: "Heat Mizer Muted",
      description: "You can unmute him in settings later",
      duration: 3000,
    });
    
    onClose();
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('heatMizer_onboarded', 'true');
    onClose();
  };

  return (
    <OnboardingDialog open={open} onClose={onClose}>
      {step === 1 ? (
        <IntroStep
          onShowMeAround={handleShowMeAround}
          onLeaveMeAlone={handleLeaveMeAlone}
          onMuteMizer={handleMuteMizer}
        />
      ) : (
        <TutorialStep onFinish={handleFinishOnboarding} />
      )}
    </OnboardingDialog>
  );
};

export default HeatMizerOnboarding;
