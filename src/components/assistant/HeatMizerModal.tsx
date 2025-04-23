
import { Dialog } from "@/components/ui/dialog";
import HeatMizerDraggableModal from "./HeatMizerDraggableModal";

interface HeatMizerModalProps {
  open: boolean;
  onClose: () => void;
}

const HeatMizerModal = ({ open, onClose }: HeatMizerModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <HeatMizerDraggableModal open={open} onClose={onClose} />
    </Dialog>
  );
};

export default HeatMizerModal;
