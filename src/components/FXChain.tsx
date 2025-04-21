
import { Effect } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface FXChainProps {
  fx: Effect[];
  onFXChange?: (fxId: string, param: string, value: number) => void;
  onFXToggle?: (fxId: string) => void;
}

const FXChain = ({ fx, onFXChange, onFXToggle }: FXChainProps) => {
  const handleToggle = (id: string) => {
    if (onFXToggle) {
      onFXToggle(id);
    }
  };

  const handleParamChange = (fxId: string, param: string, value: number[]) => {
    if (onFXChange) {
      onFXChange(fxId, param, value[0]);
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
    <div className="space-y-2 mt-2">
      {fx.map((effect) => (
        <div key={effect.id} className="bg-fever-black/30 rounded-md p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-space tracking-tight">{effect.name}</span>
            <Switch 
              checked={effect.active} 
              onCheckedChange={() => handleToggle(effect.id)} 
              className="data-[state=checked]:bg-fever-red" 
            />
          </div>
          
          {effect.active && (
            <div className="space-y-2">
              {Object.entries(effect.params).map(([param, value]) => (
                <div key={`${effect.id}-${param}`} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-fever-light/70 capitalize">{param}</span>
                    <span className="text-xs font-space">{getParamDisplay(param, value)}</span>
                  </div>
                  <Slider
                    defaultValue={[value]}
                    min={param === 'threshold' ? -60 : 0}
                    max={param === 'threshold' ? 0 : param === 'ratio' ? 20 : 1}
                    step={param === 'threshold' ? 1 : param === 'ratio' ? 0.5 : 0.01}
                    className="w-full"
                    onValueChange={(val) => handleParamChange(effect.id, param, val)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FXChain;
