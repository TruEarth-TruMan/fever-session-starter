
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedbackDialog from './FeedbackDialog';
import { useState } from 'react';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Give Feedback</span>
      </Button>
      <FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default FeedbackButton;
