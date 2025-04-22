
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AssetCard from '@/components/marketplace/AssetCard';
import { useMarketplaceAssets } from '@/hooks/useMarketplaceAssets';
import { AnyAsset } from '@/types/marketplace';

type AssetType = AnyAsset['type'];

export default function Marketplace() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const { assets, isLoading, handleInstall, handleUninstall, isAssetInstalled } = useMarketplaceAssets();

  const filteredAssets = selectedType === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === selectedType);

  const types: { value: AssetType | 'all'; label: string; }[] = [
    { value: 'all', label: 'All Assets' },
    { value: 'fxChain', label: 'FX Chains' },
    { value: 'loopPack', label: 'Loop Packs' },
    { value: 'sessionTemplate', label: 'Templates' }
  ];

  return (
    <div className="min-h-screen bg-fever-black p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            className="text-fever-light" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-fever-light">Marketplace</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {types.map(type => (
            <Badge
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-fever-red/90"
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="text-fever-light">Loading assets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onInstall={() => handleInstall(asset)}
                onUninstall={() => handleUninstall(asset)}
                installed={isAssetInstalled(asset.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
