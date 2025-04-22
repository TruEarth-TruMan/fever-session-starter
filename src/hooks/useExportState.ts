
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";

export interface ExportOptions {
  format: "mp3" | "wav" | "stems";
  quality: "128" | "256" | "320";
  range: "full" | "loop";
  name: string;
}

export const useExportState = () => {
  const [exportFormat, setExportFormat] = useState<ExportOptions["format"]>("mp3");
  const [exportQuality, setExportQuality] = useState<ExportOptions["quality"]>("320");
  const [exportRange, setExportRange] = useState<ExportOptions["range"]>("full");
  const [exportName, setExportName] = useState(() => {
    const now = new Date();
    return `Session-${now.toISOString().split('T')[0]}`;
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Exporting as ${exportFormat} with quality ${exportQuality}`);
      console.log(`Range: ${exportRange}`);
      console.log(`Name: ${exportName}`);
      
      toast.success("Export complete", {
        description: `Your session has been exported as ${exportName}.${exportFormat}`
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "There was an error exporting your session"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getExportPreset = () => {
    if (exportFormat === "wav") {
      return "YouTube Ready (WAV, 44.1kHz)";
    } else if (exportFormat === "mp3" && exportQuality === "320") {
      return "Streaming Optimized (MP3, 320kbps)";
    } else if (exportFormat === "stems") {
      return "Multi-track Production";
    }
    return "Custom";
  };

  return {
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    exportRange,
    setExportRange,
    exportName,
    setExportName,
    isExporting,
    handleExport,
    getExportPreset
  };
};
