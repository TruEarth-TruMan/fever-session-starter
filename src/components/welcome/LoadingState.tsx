
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  verificationProgress: number;
}

export const LoadingState = ({ verificationProgress }: LoadingStateProps) => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <div className="space-y-2">
        <Progress value={verificationProgress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          Verifying your subscription...
        </p>
      </div>
      <div className="space-y-4 mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
};
