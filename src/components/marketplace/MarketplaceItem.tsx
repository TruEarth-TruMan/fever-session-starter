
import { Button } from "@/components/ui/button";
import { Pack } from "@/types";

interface MarketplaceItemProps {
  pack: Pack;
  installed: boolean;
  onInstall: (packId: string) => void;
  onUninstall: (packId: string) => void;
}

const MarketplaceItem = ({ pack, installed, onInstall, onUninstall }: MarketplaceItemProps) => {
  return (
    <div className="border border-fever-light/20 rounded-md p-4 bg-fever-dark/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-fever-light">{pack.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {pack.tags.map((tag) => (
              <span 
                key={tag} 
                className="bg-fever-light/10 text-fever-light/80 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          {installed ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 border-red-500/50"
              onClick={() => onUninstall(pack.id)}
            >
              Uninstall
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onInstall(pack.id)}
            >
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItem;
