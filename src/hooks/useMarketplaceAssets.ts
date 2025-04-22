
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { allAssets } from '@/data/marketplace-assets';
import { AnyAsset } from '@/types/marketplace';

export const useMarketplaceAssets = () => {
  const { toast } = useToast();
  const { installAsset, uninstallAsset, isAssetInstalled } = useMarketplaceStore();

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['marketplaceAssets'],
    queryFn: async (): Promise<AnyAsset[]> => {
      // In a real app, this would be an API call
      return allAssets;
    }
  });

  const handleInstall = async (asset: AnyAsset) => {
    try {
      installAsset(asset.id);
      toast({
        title: "Asset Installed",
        description: `${asset.title} has been added to your library.`
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "There was an error installing the asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUninstall = async (asset: AnyAsset) => {
    try {
      uninstallAsset(asset.id);
      toast({
        title: "Asset Uninstalled",
        description: `${asset.title} has been removed from your library.`
      });
    } catch (error) {
      toast({
        title: "Uninstall Failed",
        description: "There was an error removing the asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    assets,
    isLoading,
    error,
    handleInstall,
    handleUninstall,
    isAssetInstalled
  };
};
