
import { Download, Check, Layers, Headphones, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AnyAsset } from '@/types/marketplace';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { useToast } from '@/hooks/use-toast';

interface AssetCardProps {
  asset: AnyAsset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const { installAsset, uninstallAsset, isAssetInstalled } = useMarketplaceStore();
  const { toast } = useToast();
  
  const isInstalled = isAssetInstalled(asset.id);
  
  const handleToggleInstall = () => {
    if (isInstalled) {
      uninstallAsset(asset.id);
      toast({
        title: "Asset Uninstalled",
        description: `${asset.title} has been removed from your library.`,
        variant: "default",
      });
    } else {
      installAsset(asset.id);
      toast({
        title: "Asset Installed",
        description: `${asset.title} has been added to your library.`,
        variant: "default",
      });
    }
  };
  
  // Get the appropriate icon based on asset type
  const getAssetIcon = () => {
    switch(asset.type) {
      case 'fxChain':
        return <Layers className="h-4 w-4" />;
      case 'loopPack':
        return <Headphones className="h-4 w-4" />;
      case 'sessionTemplate':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Get type display name
  const getAssetTypeName = () => {
    switch(asset.type) {
      case 'fxChain':
        return 'FX Chain';
      case 'loopPack':
        return 'Loop Pack';
      case 'sessionTemplate':
        return 'Session Template';
      default:
        return 'Asset';
    }
  };

  return (
    <Card className="overflow-hidden bg-fever-black/60 border-fever-light/10 hover:border-fever-light/30 transition-all duration-200">
      <div className="h-32 bg-fever-black relative">
        <div 
          className="w-full h-full bg-cover bg-center opacity-70"
          style={{ 
            backgroundImage: `url(${asset.imageUrl || '/placeholder.svg'})` 
          }}
        />
        
        <div className="absolute top-2 right-2 flex gap-1">
          {isInstalled && (
            <span className="bg-fever-red text-white text-xs px-2 py-0.5 rounded-full">
              Installed
            </span>
          )}
        </div>
        
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="bg-fever-dark/80 text-fever-light text-xs px-2 py-0.5 rounded-full flex items-center">
            {getAssetIcon()}
            <span className="ml-1">{getAssetTypeName()}</span>
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-fever-light">{asset.title}</h3>
          <p className="text-xs text-fever-light/70 line-clamp-2">{asset.description}</p>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags.map(tag => (
              <span 
                key={tag.name}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${tag.color}30`,
                  color: tag.color,
                  border: `1px solid ${tag.color}50`
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-fever-light/70"
        >
          Preview
        </Button>
        
        <Button
          variant={isInstalled ? "outline" : "default"} 
          size="sm"
          className={isInstalled 
            ? "border-fever-red text-fever-red hover:bg-fever-red/20" 
            : "bg-fever-red text-white hover:bg-fever-red/90"
          }
          onClick={handleToggleInstall}
        >
          {isInstalled ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Installed
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Install
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssetCard;
