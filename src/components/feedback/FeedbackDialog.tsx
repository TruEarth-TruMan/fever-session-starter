
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackDialog = ({ open, onOpenChange }: FeedbackDialogProps) => {
  const [loved, setLoved] = useState("");
  const [frustrated, setFrustrated] = useState("");
  const [bugs, setBugs] = useState("");

  const handleSubmit = () => {
    // For now, just log to console. In the future, this would send to a backend
    console.log({
      loved,
      frustrated,
      bugs,
      timestamp: new Date().toISOString(),
    });

    toast({
      title: "Thank you for your feedback!",
      description: "Your input helps us improve Fever for everyone.",
    });

    // Reset form
    setLoved("");
    setFrustrated("");
    setBugs("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Help Us Improve Fever</DialogTitle>
          <DialogDescription>
            Your feedback helps us make Fever better for everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What did you love?</label>
            <Textarea
              value={loved}
              onChange={(e) => setLoved(e.target.value)}
              placeholder="Tell us what worked well..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">What frustrated you?</label>
            <Textarea
              value={frustrated}
              onChange={(e) => setFrustrated(e.target.value)}
              placeholder="Tell us what could be better..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Any bugs or crashes?</label>
            <Textarea
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Describe any technical issues..."
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
