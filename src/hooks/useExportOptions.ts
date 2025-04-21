
import { useState } from 'react';

export const useExportOptions = () => {
  const [exportFormat, setExportFormat] = useState("mp3");
  const [exportQuality, setExportQuality] = useState("320");

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
    getExportPreset
  };
};
