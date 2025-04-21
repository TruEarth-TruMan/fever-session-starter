
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const helpTopics = [
  {
    question: "How to Start a Session",
    answer: "Click the 'New Session' button and choose a template that matches your needs. Templates are pre-configured with the right tracks and effects for different recording scenarios.",
  },
  {
    question: "How to Use FX",
    answer: "Each track has an FX button that opens the effects drawer. You can add multiple effects like reverb, compression, and EQ. Adjust the sliders to fine-tune each effect to your liking.",
  },
  {
    question: "What is Loop Mode?",
    answer: "Loop mode lets you record multiple takes over a specific section. Enable it by clicking the loop icon, then set your loop points. Perfect for practicing parts or layering ideas.",
  },
  {
    question: "Can I export my music?",
    answer: "Yes! Click the export button to save your session. Choose between MP3 or WAV formats, and select the quality that best suits your needs.",
  },
];

const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Start Guide</DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full">
          {helpTopics.map((topic, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-white font-bold hover:text-white/80">
                {topic.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/95 text-sm">
                {topic.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
