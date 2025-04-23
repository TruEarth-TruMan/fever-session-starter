
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import HeatMizerAvatar from "@/components/assistant/onboarding/HeatMizerAvatar";
import { Volume2 } from "lucide-react";

type VoiceStyle = 'classic' | 'nerd' | '90s-dj';

export const HeatMizerProSection = () => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceStyle>('classic');

  const handleVoiceSelect = (value: VoiceStyle) => {
    setSelectedVoice(value);
    localStorage.setItem('heatMizer_voiceStyle', value);
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="flex items-center gap-4">
        <HeatMizerAvatar />
        <p className="text-fever-amber text-lg font-medium leading-relaxed">
          "Hey, I'm Heat Mizer. I don't do sugarcoating—I do sonic truth. You want pro sound? Let's bring the heat."
        </p>
      </div>

      {/* Voice Selector */}
      <div className="space-y-6">
        <h3 className="text-fever-amber font-semibold">Choose My Vibe</h3>
        <RadioGroup
          defaultValue={selectedVoice}
          onValueChange={(value) => handleVoiceSelect(value as VoiceStyle)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-fever-amber/20 hover:bg-fever-amber/5 transition-colors">
            <RadioGroupItem value="classic" id="classic" className="border-fever-amber text-fever-amber" />
            <Label htmlFor="classic" className="flex-1 cursor-pointer">
              <div className="text-fever-amber font-medium flex items-center gap-2">
                Classic <Volume2 className="h-4 w-4" />
              </div>
              <p className="text-fever-light/70 text-sm">Warm, honest feedback that cuts through the noise</p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-fever-amber/20 hover:bg-fever-amber/5 transition-colors">
            <RadioGroupItem value="nerd" id="nerd" className="border-fever-amber text-fever-amber" />
            <Label htmlFor="nerd" className="flex-1 cursor-pointer">
              <div className="text-fever-amber font-medium flex items-center gap-2">
                Nerd <Volume2 className="h-4 w-4" />
              </div>
              <p className="text-fever-light/70 text-sm">Technical deep-dives with witty commentary</p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-fever-amber/20 hover:bg-fever-amber/5 transition-colors">
            <RadioGroupItem value="90s-dj" id="90s-dj" className="border-fever-amber text-fever-amber" />
            <Label htmlFor="90s-dj" className="flex-1 cursor-pointer">
              <div className="text-fever-amber font-medium flex items-center gap-2">
                90s DJ <Volume2 className="h-4 w-4" />
              </div>
              <p className="text-fever-light/70 text-sm">Over-the-top hype with retro flair</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* CTA */}
      <Button 
        onClick={() => {}} 
        className="w-full bg-fever-amber hover:bg-fever-amber/90 text-fever-dark font-semibold py-6"
      >
        Enable Heat Mizer Pro
      </Button>
    </div>
  );
};
