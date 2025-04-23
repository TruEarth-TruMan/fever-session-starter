
import { DialogContent } from "@/components/ui/dialog";
import { MessageCircle, MicOff, Mic, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { cn } from "@/lib/utils";
import { useHeatMizerPrompter } from "@/hooks/useHeatMizerPrompter";
import { Badge } from "@/components/ui/badge";
import FeverPlusBanner from "@/components/fever-plus/FeverPlusBanner";

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
  },
  {
    icon: "🎚️",
    text: "My levels are too low",
    response: "Crank that knob! But stay out of the red, unless you want your track to sound like it's on fire—and not in the good way."
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
  const [showPro, setShowPro] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { isMuted, toggleMute } = useHeatMizerPrompter();

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

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

  const toggleProFeatures = () => {
    setShowPro(!showPro);
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
        <div className="modal-handle flex items-center justify-between px-4 py-3 border-b border-fever-red bg-fever-dark/90 cursor-grab">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" 
              alt="Heat Mizer" 
              className="w-8 h-8 rounded-full"
            />
            <span className="font-orbitron text-fever-amber text-lg tracking-widest font-bold">
              Heat Mizer's Console
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={toggleMute} 
              className="p-1.5 rounded-full hover:bg-fever-amber/10 text-fever-amber transition-colors"
              aria-label={isMuted ? "Unmute Heat Mizer" : "Mute Heat Mizer"}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button 
              onClick={toggleProFeatures} 
              className={cn(
                "p-1.5 rounded-full hover:bg-fever-amber/10 text-fever-amber transition-colors",
                showPro && "bg-fever-amber/20"
              )}
              aria-label="Heat Mizer Pro features"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {showPro ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-fever-amber font-bold text-lg">Heat Mizer Pro</h3>
              <Badge variant="outline" className="bg-[#FEF7CD]/10 text-[#FEF7CD] border-[#FEF7CD]/30">
                Fever+ Exclusive
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">Basic Tips</span>
                <span className="text-fever-amber">✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">FX Chain Suggestions</span>
                <span className="text-fever-amber/50">Fever+ Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">Session-Specific Mix Advice</span>
                <span className="text-fever-amber/50">Fever+ Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">Voice Response On/Off</span>
                <span className="text-fever-amber">✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">Voice Customizer</span>
                <span className="text-fever-amber/50">Fever+ Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">Heat Mizer Skins</span>
                <span className="text-fever-amber/50">Fever+ Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fever-amber">"Hot Takes" Mode</span>
                <span className="text-fever-amber/50">Fever+ Only</span>
              </div>
            </div>
            
            <button
              onClick={toggleProFeatures}
              className="w-full bg-fever-amber text-fever-black px-3 py-2 rounded-lg font-bold transition-colors 
                        hover:bg-fever-amber/80 mt-4"
            >
              Back to Chat
            </button>

            <FeverPlusBanner />
          </div>
        ) : (
          <>
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
            <div 
              ref={chatContainerRef}
              className="flex flex-col gap-3 p-4 max-h-72 overflow-y-auto"
            >
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
          </>
        )}

        {/* Footer / Powered by */}
        <div className="flex items-center justify-center gap-2 pb-3 pt-1 text-xs text-fever-amber/80 bg-transparent font-orbitron tracking-wide">
          <img src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" alt="" className="w-5 h-5" />
          {showPro ? "Heat Mizer Pro" : "Powered by Heat Mizer"}
        </div>
      </DialogContent>
    </Draggable>
  );
};

export default HeatMizerDraggableModal;
