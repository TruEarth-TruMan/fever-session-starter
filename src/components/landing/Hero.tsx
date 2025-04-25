
import { Button } from "@/components/ui/button"
import { Download, Smartphone, Tablet } from "lucide-react"
import { toast } from "sonner"

export default function Hero() {
  const handleDownload = (platform: 'mac' | 'windows' | 'ios' | 'android') => {
    const downloadLinks = {
      mac: 'https://feverstudio.live/download/mac/Fever-Setup-1.0.0.dmg',
      windows: 'https://feverstudio.live/download/windows/Fever-Setup-1.0.0.exe',
      ios: 'https://apps.apple.com/app/fever-audio/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.fever.audioapp'
    };

    const link = downloadLinks[platform];
    
    // For mobile platforms, redirect to store
    if (platform === 'ios' || platform === 'android') {
      window.open(link, '_blank');
      return;
    }
    
    // For desktop platforms, check if file exists before attempting download
    fetch(link, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const a = document.createElement('a');
          a.href = link;
          a.download = `Fever-Setup-${platform === 'mac' ? 'macOS' : 'Windows'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          toast.success("Download started", {
            description: `Your ${platform === 'mac' ? 'macOS' : 'Windows'} download has begun.`,
            duration: 4000
          });
        } else {
          toast.error("Download currently unavailable", {
            description: "Please check back later or contact support.",
            duration: 4000
          });
        }
      })
      .catch(() => {
        toast.error("Download failed", {
          description: "Unable to download the installer. Please try again later.",
          duration: 4000
        });
      });
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 bg-gradient-to-br from-fever-black via-fever-dark to-fever-black/90 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[120px] rounded-full bg-fever-red/10 blur-2xl z-0 pointer-events-none pulse" aria-hidden="true" />
      <div className="mb-6 z-10">
        <div className="mx-auto bg-gradient-to-tr from-fever-red via-fever-amber to-fever-light rounded-full p-2 w-20 h-20 flex items-center justify-center shadow-lg">
          <span className="text-fever-black font-bold text-3xl tracking-tight font-orbitron">F</span>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold font-orbitron text-fever-light mb-3 tracking-tight drop-shadow-md">
        Built for <span className="text-fever-red">Scarlett</span>. Ready to Record.
      </h1>
      <p className="text-lg md:text-xl text-fever-light/80 mb-9 max-w-2xl mx-auto">
        The fastest way to record with your Focusrite Scarlett. No setup. No plugins. Just press record.
      </p>
      <div className="flex flex-col gap-6 relative z-10 w-full max-w-md">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => handleDownload('mac')} 
            className="w-full sm:w-auto rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-red to-fever-amber shadow-xl hover:from-fever-amber hover:to-fever-red transition-all focus-visible:ring-fever-red/60 ring-2 ring-fever-red/10 animate-pulse gap-2"
          >
            <Download size={22} />
            Download for macOS
          </Button>
          <Button 
            onClick={() => handleDownload('windows')} 
            className="w-full sm:w-auto rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-red to-fever-light shadow-xl hover:from-fever-amber hover:to-fever-red transition-all focus-visible:ring-fever-red/60 ring-2 ring-fever-red/10 gap-2"
          >
            <Download size={22} />
            Download for Windows
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => handleDownload('ios')} 
            className="w-full sm:w-auto rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-blue to-fever-light shadow-xl hover:from-fever-light hover:to-fever-blue transition-all focus-visible:ring-fever-blue/60 ring-2 ring-fever-blue/10 gap-2"
          >
            <Smartphone size={22} />
            Download for iOS
          </Button>
          <Button 
            onClick={() => handleDownload('android')} 
            className="w-full sm:w-auto rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-blue to-fever-light shadow-xl hover:from-fever-light hover:to-fever-blue transition-all focus-visible:ring-fever-blue/60 ring-2 ring-fever-blue/10 gap-2"
          >
            <Tablet size={22} />
            Download for Android
          </Button>
        </div>
      </div>
    </section>
  )
}
