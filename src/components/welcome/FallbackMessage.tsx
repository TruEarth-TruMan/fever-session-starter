
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FallbackMessageProps {
  isSubscribed: boolean;
  tier: string;
}

export const FallbackMessage = ({ isSubscribed, tier }: FallbackMessageProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Fever+</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-4">
          {isSubscribed 
            ? "You're already subscribed to Fever+!"
            : "It looks like you might have refreshed the page or arrived here directly."}
        </p>
        <p className="text-muted-foreground">
          {isSubscribed 
            ? `Your current plan: ${tier}`
            : "If you've just completed checkout, please check your email for confirmation."}
        </p>
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
        {!isSubscribed && (
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            View Plans
          </Button>
        )}
      </div>
    </div>
  );
};
