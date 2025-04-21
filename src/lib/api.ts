
import { Pack } from "@/types";

export const getMarketplacePacks = async (): Promise<Pack[]> => {
  // This is a mock function that would normally fetch from an API
  return [
    {
      id: "pack1",
      name: "Vocal FX Chain",
      description: "Professional vocal effects for studio-quality recordings",
      type: "fxChain",
      tags: ["Vocals", "Studio", "Professional"]
    },
    {
      id: "pack2",
      name: "Lo-Fi Beats",
      description: "Relaxing beats perfect for study and focus sessions",
      type: "loopPack",
      tags: ["Lo-Fi", "Chill", "Beats"]
    },
    {
      id: "pack3",
      name: "Podcast Setup",
      description: "Complete template for podcast recording and production",
      type: "sessionTemplate",
      tags: ["Podcast", "Voice", "Template"]
    }
  ];
};
