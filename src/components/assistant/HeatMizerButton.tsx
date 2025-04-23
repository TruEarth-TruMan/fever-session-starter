
import { useState, useEffect } from "react";
import HeatMizerModal from "./HeatMizerModal";
import HeatMizerOnboarding from "./HeatMizerOnboarding";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHeatMizerPrompter } from "@/hooks/useHeatMizerPrompter";

const HeatMizerButton = () => {
  const [open, setOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isMuted } = useHeatMizerPrompter();
  
  // Check if user has seen onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('heatMizer_onboarded') === 'true';
    if (!hasOnboarded) {
      // Show onboarding after a short delay to let the app load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "rounded-full bg-fever-dark/90 border-2 border-fever-red shadow-lg p-2 hover:scale-105 transition-all focus:outline-none",
              "relative"
            )}
            aria-label="Ask Heat Mizer"
            style={{
              width: 64,
              height: 64,
              boxShadow: "0 2px 20px rgba(200,16,46,0.18)",
            }}
          >
            <img
              src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png"
              alt="Heat Mizer Assistant"
              style={{ width: "100%", height: "100%" }}
              className="rounded-full"
              draggable={false}
            />
            {isMuted && (
              <div className="absolute -top-1 -right-1 bg-fever-dark rounded-full p-1 border border-fever-red">
                <MicOff size={10} className="text-fever-amber" />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-fever-dark text-fever-amber border-fever-amber font-semibold">
          Got a question? Ask Heat Mizer.
        </TooltipContent>
      </Tooltip>
      
      <HeatMizerModal open={open} onClose={() => setOpen(false)} />
      <HeatMizerOnboarding open={showOnboarding} onClose={handleOnboardingClose} />
    </>
  );
};

// Import missing dependency
import { cn } from "@/lib/utils"; 
import { MicOff } from "lucide-react";

export default HeatMizerButton;
