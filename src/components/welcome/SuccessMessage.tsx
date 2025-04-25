
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SessionDetails } from "@/types/subscription";
import { Check } from "lucide-react";

interface SuccessMessageProps {
  sessionDetails: SessionDetails | null;
  userEmail: string;
}

export const SuccessMessage = ({ sessionDetails, userEmail }: SuccessMessageProps) => {
  if (!sessionDetails || !sessionDetails.success) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          We couldn't verify your subscription. Please try again or contact support.
        </p>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const email = sessionDetails.customer_email || userEmail;
  const tier = sessionDetails.subscription_tier || "Fever+";
  const formattedTier = tier.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Welcome to {formattedTier}!</h1>
        <p className="text-muted-foreground mt-2">
          Your subscription has been activated for {email}.
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 text-left">
        <h2 className="font-medium mb-2">Your subscription includes:</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Premium session templates</li>
          <li>• Advanced audio effects</li>
          <li>• Priority support</li>
          <li>• Cloud storage for your projects</li>
        </ul>
      </div>
      <Button asChild size="lg">
        <Link to="/dashboard">Continue to Dashboard</Link>
      </Button>
    </div>
  );
};
