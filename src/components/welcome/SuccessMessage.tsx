
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SessionDetails } from '@/types/subscription';

interface SuccessMessageProps {
  sessionDetails: SessionDetails | null;
  userEmail: string | undefined;
}

export const SuccessMessage = ({ sessionDetails, userEmail }: SuccessMessageProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center">
      <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">
        Thanks for subscribing{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!
      </h1>
      
      <p className="text-xl mb-6">
        Your account has been upgraded to {sessionDetails?.subscription_tier || 'Fever+'}
      </p>
      
      <div className="bg-muted p-4 rounded-md mb-8 text-left">
        <h3 className="font-medium mb-2">Subscription Details:</h3>
        <ul className="space-y-1 text-sm">
          <li><span className="font-medium">Status:</span> {sessionDetails?.subscription_status || 'Active'}</li>
          <li><span className="font-medium">Plan:</span> {sessionDetails?.subscription_tier || 'Fever+'}</li>
          <li><span className="font-medium">Email:</span> {sessionDetails?.customer_email || userEmail}</li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate('/sessions')}>
          Create New Session
        </Button>
      </div>
    </div>
  );
};
