export interface AudioDevice {
  id: string;
  name: string; // ← Add this line to match what's used in audioDevices.ts
  type: 'input' | 'output';
  isScarlettInterface: boolean;
}
