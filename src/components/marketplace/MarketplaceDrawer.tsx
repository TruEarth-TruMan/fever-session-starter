import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getMarketplacePacks } from "@/lib/api";
import { Pack } from "@/types";
import { toast } from "@/components/ui/use-toast";
import MarketplaceItem from "./MarketplaceItem";
import FeverPlusBanner from "../fever-plus/FeverPlusBanner";

interface MarketplaceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketplaceDrawer = ({ open, onOpenChange }: MarketplaceDrawerProps) => {
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);

  useEffect(() => {
    // Load installed packs from local storage
    const storedPacks = localStorage.getItem('installedPacks');
    if (storedPacks) {
      setInstalledPacks(JSON.parse(storedPacks));
    }
  }, []);

  const { data: packs, isLoading, isError } = useQuery({
    queryKey: ["marketplacePacks"],
    queryFn: getMarketplacePacks,
  });

  const handleInstall = (packId: string) => {
    if (installedPacks.includes(packId)) {
      toast({
        title: "Already Installed",
        description: "You have already installed this pack.",
      });
      return;
    }

    setInstalledPacks([...installedPacks, packId]);
    localStorage.setItem('installedPacks', JSON.stringify([...installedPacks, packId]));

    toast({
      title: "Pack Installed",
      description: "Successfully installed the pack. Check your session templates.",
    });
  };

  const handleUninstall = (packId: string) => {
    const updatedPacks = installedPacks.filter((id) => id !== packId);
    setInstalledPacks(updatedPacks);
    localStorage.setItem('installedPacks', JSON.stringify(updatedPacks));

    toast({
      title: "Pack Uninstalled",
      description: "Successfully uninstalled the pack.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Asset Marketplace</SheetTitle>
          <SheetDescription>
            Browse and install content packs for your sessions
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <FeverPlusBanner />
        </div>

        <div className="grid gap-4">
          {isLoading && <div>Loading packs...</div>}
          {isError && <div>Error loading packs. Please try again.</div>}
          {packs?.map((pack: Pack) => (
            <MarketplaceItem
              key={pack.id}
              pack={pack}
              installed={installedPacks.includes(pack.id)}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MarketplaceDrawer;
