
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import FeverPlusModal from "./FeverPlusModal";

const UpgradeButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-fever-amber hover:bg-fever-amber/90 text-fever-dark"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Upgrade
      </Button>

      <FeverPlusModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default UpgradeButton;
