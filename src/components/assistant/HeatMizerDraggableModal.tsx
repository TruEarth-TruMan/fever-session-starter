
import { DialogContent } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { cn } from "@/lib/utils";

interface HeatMizerDraggableModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultPrompts = [
  {
    icon: "🔥",
    text: "How do I get started?",
    response: "First time bringing the heat? Let's start by setting up your tracks and getting those levels right!"
  },
  {
    icon: "🧊",
    text: "Why can't I hear anything?",
    response: "Check your output device and make sure nothing's frozen up. I've seen this more times than snow in July!"
  },
  {
    icon: "🎛️",
    text: "Show me a cool FX chain",
    response: "How about my signature 'Summer Heat' chain? Compression → Tape Saturation → Touch of Reverb. Guaranteed to warm up any track!"
  }
];

const HeatMizerDraggableModal = ({ open, onClose }: HeatMizerDraggableModalProps) => {
  const [chat, setChat] = useState<{ sender: "user" | "heatmizer"; text: string }[]>([
    {
      sender: "heatmizer",
      text: "Welcome to my console! What's cooking?"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDefaultPrompt = (prompt: typeof defaultPrompts[0]) => {
    setChat((cur) => [
      ...cur,
      { sender: "user", text: prompt.text },
      { sender: "heatmizer", text: prompt.response }
    ]);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    setChat((cur) => [
      ...cur,
      { sender: "user", text: userInput },
      { 
        sender: "heatmizer", 
        text: "Stay tuned! I'm still heating up my full response capabilities. But keep that creative fire burning! 🔥"
      }
    ]);
    setUserInput("");
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <Draggable
      handle=".modal-handle"
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
    >
      <DialogContent className={cn(
        "fixed left-[unset] right-4 top-[unset] bottom-20 transform-none !max-w-md p-0",
        "bg-fever-dark/95 rounded-2xl shadow-2xl overflow-hidden glass-morphism",
        "animate-in slide-in-from-bottom-5 duration-300",
        isDragging && "cursor-grabbing"
      )}>
        {/* Header */}
        <div className="modal-handle flex items-center gap-2 px-4 py-3 border-b border-fever-red bg-fever-dark/90 cursor-grab">
          <img 
            src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" 
            alt="Heat Mizer" 
            className="w-8 h-8 rounded-full"
          />
          <span className="font-orbitron text-fever-amber text-lg tracking-widest font-bold">
            Heat Mizer's Help Console
          </span>
        </div>

        {/* Default Prompts */}
        <div className="p-4 border-b border-fever-red/20">
          <div className="flex flex-wrap gap-2">
            {defaultPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleDefaultPrompt(prompt)}
                className="bg-fever-dark/80 hover:bg-fever-dark text-fever-amber border border-fever-amber/30 
                          rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                {prompt.icon} {prompt.text}
              </button>
            ))}
          </div>
        </div>

        {/* Chat content */}
        <div className="flex flex-col gap-3 p-4 max-h-72 overflow-y-auto">
          {chat.map((msg, i) =>
            msg.sender === "user" ? (
              <div key={i} className="self-end bg-fever-blue text-fever-black rounded-lg px-4 py-2 max-w-xs text-right shadow">
                {msg.text}
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2 self-start">
                <img 
                  src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" 
                  alt="" 
                  className="w-6 h-6 rounded-full border border-fever-amber shadow" 
                />
                <div className="bg-fever-amber/10 border border-fever-amber rounded-lg px-4 py-2 max-w-xs text-fever-amber font-medium shadow text-sm">
                  {msg.text}
                </div>
              </div>
            )
          )}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 p-4 border-t border-fever-red bg-fever-dark/80">
          <input
            className="flex-1 p-2 rounded-lg border border-fever-amber bg-fever-black text-fever-amber 
                     placeholder:text-fever-amber/60 outline-none focus:ring-2 focus:ring-fever-amber focus:border-fever-amber"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleInputKey}
          />
          <button
            onClick={handleSend}
            className="bg-fever-amber text-fever-black px-3 py-2 rounded-lg font-bold transition-colors 
                     hover:bg-fever-amber/80 disabled:opacity-50"
            disabled={!userInput.trim()}
            aria-label="Send to Heat Mizer"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Footer / Powered by */}
        <div className="flex items-center justify-center gap-2 pb-3 pt-1 text-xs text-fever-amber/80 bg-transparent font-orbitron tracking-wide">
          <img src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" alt="" className="w-5 h-5" />
          Powered by Heat Mizer
        </div>
      </DialogContent>
    </Draggable>
  );
};

export default HeatMizerDraggableModal;
