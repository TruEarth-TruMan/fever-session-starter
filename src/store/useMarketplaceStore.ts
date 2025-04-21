
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnyAsset } from '@/types/marketplace';

interface MarketplaceState {
  assets: AnyAsset[];
  installedAssets: string[]; // Array of asset IDs
  installAsset: (assetId: string) => void;
  uninstallAsset: (assetId: string) => void;
  isAssetInstalled: (assetId: string) => boolean;
  getInstalledAssets: (type?: AnyAsset['type']) => AnyAsset[];
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      assets: [],
      installedAssets: [],
      installAsset: (assetId) => {
        set((state) => ({
          installedAssets: [...state.installedAssets, assetId],
          assets: state.assets.map((asset) =>
            asset.id === assetId ? { ...asset, isInstalled: true } : asset
          ),
        }));
      },
      uninstallAsset: (assetId) => {
        set((state) => ({
          installedAssets: state.installedAssets.filter((id) => id !== assetId),
          assets: state.assets.map((asset) =>
            asset.id === assetId ? { ...asset, isInstalled: false } : asset
          ),
        }));
      },
      isAssetInstalled: (assetId) => {
        return get().installedAssets.includes(assetId);
      },
      getInstalledAssets: (type) => {
        const { assets, installedAssets } = get();
        const installed = assets.filter((asset) => installedAssets.includes(asset.id));
        
        if (type) {
          return installed.filter((asset) => asset.type === type);
        }
        return installed;
      },
    }),
    {
      name: 'fever-marketplace-storage',
    }
  )
);
