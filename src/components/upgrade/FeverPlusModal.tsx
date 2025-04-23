import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HeatMizerAvatar from "@/components/assistant/onboarding/HeatMizerAvatar";
import { HeatMizerProSection } from "./HeatMizerProSection";
import { Sparkles, Zap } from "lucide-react";

interface FeverPlusModalProps {
  open: boolean;
  onClose: () => void;
}

const FeverPlusModal = ({ open, onClose }: FeverPlusModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-fever-dark border-fever-red border-2 max-w-xl p-0 overflow-hidden">
        <Tabs defaultValue="features" className="w-full">
          <div className="border-b border-fever-amber/20">
            <TabsList className="w-full bg-transparent border-b border-fever-amber/20">
              <TabsTrigger 
                value="features"
                className="flex-1 text-fever-amber data-[state=active]:text-fever-amber data-[state=active]:border-b-2 data-[state=active]:border-fever-amber rounded-none bg-transparent"
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="meet-mizer"
                className="flex-1 text-fever-amber data-[state=active]:text-fever-amber data-[state=active]:border-b-2 data-[state=active]:border-fever-amber rounded-none bg-transparent"
              >
                Meet Heat Mizer
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="features" className="p-8 space-y-8 mt-0">
            {/* Header */}
            <div className="flex items-center gap-6">
              <div className="animate-bounce">
                <HeatMizerAvatar />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-fever-amber flex items-center gap-2">
                  Fever+ <Sparkles className="text-fever-amber" />
                </h2>
                <p className="text-fever-amber/70">Power tools for serious creators.</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6 text-fever-light">
              <FeatureItem
                icon="🎛️"
                title="Smart FX Suggestions"
                description="Get context-aware recommendations from Heat Mizer—EQ tweaks, FX chains, mix bus polish."
              />
              <FeatureItem
                icon="📀"
                title="Session Templates & Loop Libraries"
                description="Access premium asset packs. From podcast to popwave, instantly launch into pro sessions."
              />
              <FeatureItem
                icon="🧠"
                title="Heat Mizer Pro"
                description="Your brutally honest session guide. 'Hot Takes' mode critiques your mix. Choose your vibe: Classic | Nerd | 90s DJ."
                highlight="Unlock custom voice packs & animated Mizer skins."
              />
              <FeatureItem
                icon="🔄"
                title="Cloud Sync & Multi-Device Support"
                description="Your sessions, wherever you roam."
              />
              <FeatureItem
                icon="🚀"
                title="Priority Access to New Features"
                description="Be the first to try new Fever features."
              />
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <Button 
                onClick={() => {}} 
                className="w-full bg-fever-amber hover:bg-fever-amber/90 text-fever-dark font-semibold py-6"
              >
                <Zap className="mr-2" />
                Upgrade to Fever+ – $9.99/mo
              </Button>
              <div className="flex gap-4">
                <Button 
                  onClick={() => {}} 
                  variant="outline"
                  className="flex-1 border-fever-amber/50 text-fever-amber hover:bg-fever-amber/10"
                >
                  Try 7 Days Free
                </Button>
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  className="flex-1 border-fever-light/20 text-fever-light/70 hover:bg-fever-light/5"
                >
                  Stay Basic
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meet-mizer" className="p-8 mt-0">
            <HeatMizerProSection />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
}

const FeatureItem = ({ icon, title, description, highlight }: FeatureItemProps) => (
  <div className="flex gap-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <h3 className="font-semibold text-fever-amber mb-1">{title}</h3>
      <p className="text-fever-light/80 text-sm leading-relaxed">{description}</p>
      {highlight && (
        <p className="text-fever-amber/90 text-sm mt-1 font-medium">{highlight}</p>
      )}
    </div>
  </div>
);

export default FeverPlusModal;
