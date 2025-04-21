
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExportDialogProps {
  exportFormat: string;
  setExportFormat: (format: string) => void;
  exportQuality: string;
  setExportQuality: (quality: string) => void;
  handleExport: () => void;
  getExportPreset: () => string;
}

const ExportDialog = ({
  exportFormat,
  setExportFormat,
  exportQuality,
  setExportQuality,
  handleExport,
  getExportPreset
}: ExportDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-fever-light/20 bg-fever-dark flex gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-fever-dark border-fever-light/20">
        <DialogHeader>
          <DialogTitle className="text-fever-light">Export Options</DialogTitle>
          <DialogDescription className="text-fever-light/70">
            Choose your preferred export format and settings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format" className="text-fever-light">
              Format
            </Label>
            <Select 
              value={exportFormat} 
              onValueChange={setExportFormat}
            >
              <SelectTrigger id="format" className="bg-fever-black/40 border-fever-light/20 text-fever-light">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-fever-dark border-fever-light/20">
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="stems">STEMS (Individual tracks)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {exportFormat === "mp3" && (
            <div className="space-y-2">
              <Label htmlFor="quality" className="text-fever-light">
                Bitrate
              </Label>
              <Select 
                value={exportQuality} 
                onValueChange={setExportQuality}
              >
                <SelectTrigger id="quality" className="bg-fever-black/40 border-fever-light/20 text-fever-light">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="bg-fever-dark border-fever-light/20">
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="256">256 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="preset" className="text-fever-light">
              Preset
            </Label>
            <div className="px-3 py-2 bg-fever-black/40 border border-fever-light/20 rounded-md text-fever-light">
              {getExportPreset()}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-fever-light/20 text-fever-light">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            className="bg-fever-amber text-fever-black hover:bg-fever-amber/80"
            onClick={handleExport}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
