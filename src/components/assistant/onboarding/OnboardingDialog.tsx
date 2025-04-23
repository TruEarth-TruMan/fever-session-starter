
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface OnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const OnboardingDialog = ({ open, onClose, children }: OnboardingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "bg-fever-dark border border-fever-red relative max-w-md p-0 overflow-hidden",
          "fixed left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <div className="p-6 flex flex-col gap-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
