
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Effect, Track } from '@/types';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface FXDrawerProps {
  track: Track | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFXChange?: (trackId: string, fxId: string, param: string, value: number) => void;
  onFXToggle?: (trackId: string, fxId: string) => void;
}

const FXDrawer = ({ 
  track, 
  open, 
  onOpenChange, 
  onFXChange, 
  onFXToggle 
}: FXDrawerProps) => {
  const [localFX, setLocalFX] = useState<Effect[]>([]);
  
  // Sync local FX state with the track's FX when track changes
  useEffect(() => {
    if (track) {
      setLocalFX(track.fx);
    }
  }, [track]);
  
  if (!track) return null;
  
  const handleToggleFX = (fxId: string) => {
    if (track && onFXToggle) {
      onFXToggle(track.id, fxId);
    }
  };
  
  const handleParamChange = (fxId: string, param: string, value: number[]) => {
    if (track && onFXChange) {
      onFXChange(track.id, fxId, param, value[0]);
    }
  };
  
  const getParamDisplay = (param: string, value: number): string => {
    switch(param) {
      case 'threshold':
        return `${value} dB`;
      case 'ratio':
        return `${value}:1`;
      case 'amount':
      case 'drive':
      case 'tone':
      case 'feedback':
        return `${Math.round(value * 100)}%`;
      case 'time':
        return `${Math.round(value * 1000)} ms`;
      case 'decay':
        return `${value} s`;
      case 'low':
      case 'high':
        return `${Math.round((value - 0.5) * 24)} dB`;
      default:
        return `${value}`;
    }
  };
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-fever-dark border-fever-light/10 text-fever-light">
        <div className="container max-w-4xl mx-auto">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-12 rounded-sm" 
                  style={{ backgroundColor: track.color }} 
                />
                <DrawerTitle className="text-xl font-bold text-fever-light">
                  {track.name} FX
                </DrawerTitle>
              </div>
              <DrawerClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-fever-light hover:bg-fever-black"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {localFX.map((effect) => (
              <div 
                key={effect.id} 
                className="bg-fever-black/60 rounded-lg p-4 border border-fever-light/10"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{effect.name}</h3>
                  <Switch 
                    checked={effect.active} 
                    onCheckedChange={() => handleToggleFX(effect.id)}
                    className="data-[state=checked]:bg-fever-red"
                  />
                </div>
                
                {effect.active && (
                  <div className="space-y-4">
                    {Object.entries(effect.params).map(([param, value]) => (
                      <div key={`${effect.id}-${param}`} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize">{param}</span>
                          <span className="text-xs font-space">{getParamDisplay(param, value)}</span>
                        </div>
                        <Slider
                          value={[value]}
                          min={param === 'threshold' ? -60 : 0}
                          max={param === 'threshold' ? 0 : param === 'ratio' ? 20 : 1}
                          step={param === 'threshold' ? 1 : param === 'ratio' ? 0.5 : 0.01}
                          onValueChange={(val) => handleParamChange(effect.id, param, val)}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FXDrawer;
