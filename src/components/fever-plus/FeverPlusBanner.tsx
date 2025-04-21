
import { Star } from 'lucide-react';

const FeverPlusBanner = () => {
  return (
    <div className="bg-[#FEF7CD]/10 border border-[#FEF7CD]/20 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-[#FEF7CD]" />
        <h3 className="font-medium">Fever+ Features (Coming Soon)</h3>
      </div>
      
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FEF7CD]" />
          Unlimited Session Templates
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FEF7CD]" />
          Exclusive FX Chains
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FEF7CD]" />
          Premium Loop Packs
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FEF7CD]" />
          Smart Mastering (Coming Soon)
        </li>
      </ul>
      
      <p className="text-xs text-muted-foreground">
        Currently included in beta - enjoy these premium features!
      </p>
    </div>
  );
};

export default FeverPlusBanner;
