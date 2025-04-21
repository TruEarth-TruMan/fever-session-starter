
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpDialog from './HelpDialog';
import { useState } from 'react';

const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Quick Start</span>
      </Button>
      <HelpDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default HelpButton;
