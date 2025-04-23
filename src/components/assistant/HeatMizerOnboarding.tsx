
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
    // Save preference to localStorage so we don't show this again
    localStorage.setItem('heatMizer_onboarded', 'true');
    onClose();
  };

  const handleMuteMizer = () => {
    // Save the muted preference to localStorage
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
    // Save preference to localStorage so we don't show this again
    localStorage.setItem('heatMizer_onboarded', 'true');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-fever-dark border border-fever-red relative max-w-md p-0 overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" 
              alt="Heat Mizer" 
              className="w-16 h-16 rounded-full border-2 border-fever-amber" 
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-fever-amber font-orbitron tracking-wider">Heat Mizer</h2>
              <p className="text-fever-amber/70 text-sm">Your personal mix assistant</p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="space-y-4 text-fever-amber">
                <p className="text-lg font-medium leading-relaxed">
                  "Hey. I'm Heat Mizer. And if you're here to make microwave beats or elevator loops, you're gonna need me more than you know."
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  "Don't worry—I won't nag… unless you really mess something up."
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleShowMeAround}
                  className="bg-fever-amber hover:bg-fever-amber/80 text-fever-black"
                >
                  Show me around
                </Button>
                <Button 
                  onClick={handleLeaveMeAlone}
                  variant="outline"
                  className="border-fever-amber text-fever-amber hover:bg-fever-amber/10"
                >
                  Leave me alone
                </Button>
                <Button 
                  onClick={handleMuteMizer}
                  variant="ghost"
                  className="text-fever-amber/60 hover:text-fever-amber/80 hover:bg-transparent"
                >
                  Mute me (rude)
                </Button>
              </div>
            </>
          ) : (
            <>
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
                  onClick={handleFinishOnboarding}
                  className="bg-fever-amber hover:bg-fever-amber/80 text-fever-black"
                >
                  Got it
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeatMizerOnboarding;
