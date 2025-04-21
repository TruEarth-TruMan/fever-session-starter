
import { useState, useEffect } from 'react';
import { X, Layers, Headphones, FileText, Search } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { allAssets } from '@/data/marketplace-assets';
import AssetCard from './AssetCard';
import { AnyAsset } from '@/types/marketplace';

interface MarketplaceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketplaceDrawer = ({ open, onOpenChange }: MarketplaceDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<AnyAsset[]>(allAssets);
  const [activeTab, setActiveTab] = useState('all');
  
  // In a real implementation, this would fetch from an API or similar
  useEffect(() => {
    useMarketplaceStore.setState({ assets: allAssets });
  }, []);

  // Filter assets based on search query and active tab
  useEffect(() => {
    let assets = allAssets;
    
    if (searchQuery) {
      assets = assets.filter(asset => 
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (activeTab !== 'all') {
      assets = assets.filter(asset => asset.type === activeTab);
    }
    
    setFilteredAssets(assets);
  }, [searchQuery, activeTab]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-fever-dark border-fever-light/10 text-fever-light max-h-[90vh]">
        <div className="container max-w-5xl mx-auto">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <DrawerTitle className="text-2xl font-bold text-fever-light">
                Asset Marketplace
              </DrawerTitle>
              <DrawerClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-fever-light hover:bg-fever-black"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <p className="text-sm text-fever-light/70 mt-2">
              Browse and download free content packs to enhance your sessions
            </p>
          </DrawerHeader>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-fever-light/50" />
              <Input
                placeholder="Search assets..."
                className="pl-10 bg-fever-black/60 border-fever-light/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-fever-black/60">
                <TabsTrigger value="all" className="data-[state=active]:bg-fever-red">
                  All
                </TabsTrigger>
                <TabsTrigger value="fxChain" className="data-[state=active]:bg-fever-red">
                  <Layers className="h-4 w-4 mr-2" />
                  FX Chains
                </TabsTrigger>
                <TabsTrigger value="loopPack" className="data-[state=active]:bg-fever-red">
                  <Headphones className="h-4 w-4 mr-2" />
                  Loop Packs
                </TabsTrigger>
                <TabsTrigger value="sessionTemplate" className="data-[state=active]:bg-fever-red">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="fxChain" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets
                    .filter(asset => asset.type === 'fxChain')
                    .map(asset => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="loopPack" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets
                    .filter(asset => asset.type === 'loopPack')
                    .map(asset => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="sessionTemplate" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets
                    .filter(asset => asset.type === 'sessionTemplate')
                    .map(asset => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  }
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MarketplaceDrawer;
