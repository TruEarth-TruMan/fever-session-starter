
import { Button } from "@/components/ui/button";
import HeatMizerAvatar from "./HeatMizerAvatar";

interface TutorialStepProps {
  onFinish: () => void;
}

const TutorialStep = ({ onFinish }: TutorialStepProps) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <HeatMizerAvatar />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-fever-amber font-orbitron tracking-wider">Heat Mizer</h2>
          <p className="text-fever-amber/70 text-sm">Your personal mix assistant</p>
        </div>
      </div>

      <div className="space-y-4 text-fever-amber">
        <p className="text-lg font-medium leading-relaxed">
          "I'll walk you through the good stuff: tracks, loops, FX chains, and where to bury your bad takes."
        </p>
        <p className="text-lg font-medium leading-relaxed">
          "Click the 🔴 button to record. Click my face for help. And remember: 'Undo' is your best friend."
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onFinish}
          className="bg-fever-amber hover:bg-fever-amber/80 text-fever-black"
        >
          Got it
        </Button>
      </div>
    </>
  );
};

export default TutorialStep;
