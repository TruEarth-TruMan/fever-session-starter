
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface HeatMizerModalProps {
  open: boolean;
  onClose: () => void;
}

type Message = {
  sender: "user" | "heatmizer";
  text: string;
};

const HEAT_MIZER_ICON = "/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png";

// Example witty/retro-modern responses
const exampleTips = [
  {
    question: "How do I add reverb?",
    answer:
      "Turn up the heat—this mix is ice cold. Select your vocals, open FX, and toss in some reverb. Warmth, guaranteed!",
  },
  {
    question: "Marketplace help",
    answer:
      "Looking to spice things up? Slide over to the Marketplace—there are FX chains hotter than my hair in there.",
  },
  {
    question: "Can't hear playback",
    answer:
      "Feeling frosty? Check your output device or reload your session—sometimes things just need a jumpstart.",
  },
];

const wittyDefaultReplies = [
  "I'm Mr. Heat Mizer! Need tips or a spark of inspiration?",
  "Throw me your questions—don’t let your session freeze up.",
  "Feeling stuck? I’ve handled more mixes than winter has snow.",
  "Let’s fire up your creativity! Ask away.",
];

const HeatMizerModal = ({ open, onClose }: HeatMizerModalProps) => {
  const [chat, setChat] = useState<Message[]>([
    {
      sender: "heatmizer",
      text: wittyDefaultReplies[0],
    },
  ]);
  const [userInput, setUserInput] = useState("");

  // Very simple canned responses (MVP, no AI backend yet)
  function handleSend() {
    if (!userInput.trim()) return;
    const _input = userInput.toLowerCase();
    let response: string | undefined = undefined;

    if (_input.includes("reverb")) {
      response = exampleTips[0].answer;
    } else if (_input.includes("marketplace") || _input.includes("fx")) {
      response = exampleTips[1].answer;
    } else if (_input.includes("can't hear") || _input.includes("no sound") || _input.includes("playback")) {
      response = exampleTips[2].answer;
    } else {
      // Random playful style fallback
      response = wittyDefaultReplies[Math.floor(Math.random() * wittyDefaultReplies.length)];
    }
    setChat((cur) => [
      ...cur,
      { sender: "user", text: userInput },
      { sender: "heatmizer", text: response! },
    ]);
    setUserInput("");
  }

  // Allow hitting enter to send
  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 bg-fever-dark/95 rounded-2xl shadow-2xl overflow-hidden glass-morphism">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-fever-red bg-fever-dark/90">
          <img src={HEAT_MIZER_ICON} alt="Heat Mizer" className="w-8 h-8 rounded-full" />
          <span className="font-orbitron text-fever-amber text-lg tracking-widest font-bold">Heat Mizer</span>
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
                <img src={HEAT_MIZER_ICON} alt="" className="w-6 h-6 rounded-full border border-fever-amber shadow" />
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
            className="flex-1 p-2 rounded-lg border border-fever-amber bg-fever-black text-fever-amber placeholder:text-fever-amber/60 outline-none focus:ring-2 focus:ring-fever-amber focus:border-fever-amber"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleInputKey}
            autoFocus
          />
          <button
            onClick={handleSend}
            className="bg-fever-amber text-fever-black px-3 py-2 rounded-lg font-bold transition-colors hover:bg-fever-amber/80 disabled:opacity-50"
            disabled={!userInput.trim()}
            aria-label="Send to Heat Mizer"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
        {/* Footer / Powered by */}
        <div className="flex items-center justify-center gap-2 pb-3 pt-1 text-xs text-fever-amber/80 bg-transparent font-orbitron tracking-wide">
          <img src={HEAT_MIZER_ICON} alt="" className="w-5 h-5" />
          Powered by Heat Mizer
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeatMizerModal;
