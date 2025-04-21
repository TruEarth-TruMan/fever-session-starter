
import { useState } from 'react';

export const useExportState = () => {
  const [exportFormat, setExportFormat] = useState("mp3");
  const [exportQuality, setExportQuality] = useState("320");

  const handleExport = () => {
    console.log(`Exporting as ${exportFormat} with quality ${exportQuality}`);
  };

  const getExportPreset = () => {
    if (exportFormat === "wav") {
      return "YouTube Ready (WAV, 44.1kHz)";
    } else if (exportFormat === "mp3" && exportQuality === "320") {
      return "Streaming Optimized (MP3, 320kbps)";
    }
    return "Custom";
  };

  return {
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    handleExport,
    getExportPreset
  };
};
