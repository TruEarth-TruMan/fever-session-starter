
import { Button } from "@/components/ui/button";
import HeatMizerAvatar from "./HeatMizerAvatar";

interface IntroStepProps {
  onShowMeAround: () => void;
  onLeaveMeAlone: () => void;
  onMuteMizer: () => void;
}

const IntroStep = ({ onShowMeAround, onLeaveMeAlone, onMuteMizer }: IntroStepProps) => {
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
          "Hey. I'm Heat Mizer. And if you're here to make microwave beats or elevator loops, you're gonna need me more than you know."
        </p>
        <p className="text-lg font-medium leading-relaxed">
          "Don't worry—I won't nag… unless you really mess something up."
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button 
          onClick={onShowMeAround}
          className="bg-fever-amber hover:bg-fever-amber/80 text-fever-black"
        >
          Show me around
        </Button>
        <Button 
          onClick={onLeaveMeAlone}
          variant="outline"
          className="border-fever-amber text-fever-amber hover:bg-fever-amber/10"
        >
          Leave me alone
        </Button>
        <Button 
          onClick={onMuteMizer}
          variant="ghost"
          className="text-fever-amber/60 hover:text-fever-amber/80 hover:bg-transparent"
        >
          Mute me (rude)
        </Button>
      </div>
    </>
  );
};

export default IntroStep;
