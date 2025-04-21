
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { AnyAsset, FXChainAsset, LoopPackAsset, SessionTemplateAsset } from '@/types/marketplace';

export const useAssetInstaller = () => {
  const { toast } = useToast();
  const { assets, installedAssets } = useMarketplaceStore();
  
  const getInstalledAssets = (type?: AnyAsset['type']) => {
    const installed = assets.filter(asset => installedAssets.includes(asset.id));
    if (type) {
      return installed.filter(asset => asset.type === type);
    }
    return installed;
  };
  
  const getInstalledFXChains = () => {
    return getInstalledAssets('fxChain') as FXChainAsset[];
  };
  
  const getInstalledLoopPacks = () => {
    return getInstalledAssets('loopPack') as LoopPackAsset[];
  };
  
  const getInstalledSessionTemplates = () => {
    return getInstalledAssets('sessionTemplate') as SessionTemplateAsset[];
  };
  
  const applyFXChainToTrack = (fxChainId: string, trackId: string, updateTrack: (trackId: string, updates: any) => void) => {
    const fxChain = assets.find(asset => asset.id === fxChainId) as FXChainAsset | undefined;
    
    if (fxChain) {
      // Create unique IDs for each effect in the chain
      const fxWithUniqueIds = fxChain.effects.map(fx => ({
        ...fx,
        id: `${fx.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }));
      
      updateTrack(trackId, { fx: fxWithUniqueIds });
      
      toast({
        title: "FX Chain Applied",
        description: `'${fxChain.title}' has been applied to your track.`,
        variant: "default",
      });
      
      return true;
    }
    
    toast({
      title: "Error",
      description: "Couldn't find the FX chain to apply.",
      variant: "destructive",
    });
    
    return false;
  };
  
  return {
    getInstalledAssets,
    getInstalledFXChains,
    getInstalledLoopPacks,
    getInstalledSessionTemplates,
    applyFXChainToTrack
  };
};
