
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface FallbackMessageProps {
  isSubscribed: boolean;
  tier: string;
}

export const FallbackMessage = ({ isSubscribed, tier }: FallbackMessageProps) => {
  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {isSubscribed 
            ? "You're already subscribed to Fever+" 
            : "Welcome to Fever"}
        </h1>
        <p className="text-muted-foreground">
          {isSubscribed 
            ? `You're currently on the ${tier.replace('_', ' ')} plan.` 
            : "Ready to upgrade your music production experience?"}
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button asChild>
          <Link to="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
        
        {!isSubscribed && (
          <Button asChild variant="outline" className="gap-2">
            <Link to="/marketplace">
              <Sparkles className="h-4 w-4" />
              Explore Fever+
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
