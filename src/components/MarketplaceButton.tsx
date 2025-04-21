
import { useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketplaceDrawer from './marketplace/MarketplaceDrawer';

const MarketplaceButton = () => {
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  
  return (
    <>
      <Button
        variant="outline"
        className="border-fever-light/20 bg-fever-dark flex gap-2"
        onClick={() => setIsMarketplaceOpen(true)}
      >
        <PackageOpen className="h-4 w-4" />
        <span>Assets</span>
      </Button>
      
      <MarketplaceDrawer 
        open={isMarketplaceOpen} 
        onOpenChange={setIsMarketplaceOpen} 
      />
    </>
  );
};

export default MarketplaceButton;
