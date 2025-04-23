
import { useState } from "react";
import HeatMizerModal from "./HeatMizerModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const HeatMizerButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-fever-dark/90 border-2 border-fever-red shadow-lg p-2 hover:scale-105 transition-all focus:outline-none"
            aria-label="Ask Heat Mizer"
            style={{
              width: 64,
              height: 64,
              boxShadow: "0 2px 20px rgba(200,16,46,0.18)",
            }}
          >
            <img
              src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png"
              alt="Heat Mizer Assistant"
              style={{ width: "100%", height: "100%" }}
              className="rounded-full"
              draggable={false}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-fever-dark text-fever-amber border-fever-amber font-semibold">
          Got a question? Ask Heat Mizer.
        </TooltipContent>
      </Tooltip>
      <HeatMizerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default HeatMizerButton;
