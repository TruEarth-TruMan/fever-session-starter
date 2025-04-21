
import { desktopCapturer } from 'electron';

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  deviceId: string;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private inputStream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async initialize(deviceId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      this.inputStream = stream;
      this.audioContext = new AudioContext({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });

      return true;
    } catch (error) {
      console.error('Error initializing audio engine:', error);
      return false;
    }
  }

  startRecording() {
    if (!this.inputStream) return false;

    this.chunks = [];
    this.recorder = new MediaRecorder(this.inputStream);

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.start();
    return true;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) {
        resolve(new Blob());
        return;
      }

      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/wav' });
        this.chunks = [];
        resolve(blob);
      };

      this.recorder.stop();
    });
  }

  async getInputLevel(): Promise<number> {
    if (!this.inputStream || !this.audioContext) return 0;

    const source = this.audioContext.createMediaStreamSource(this.inputStream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    return average / 255; // Normalize to 0-1
  }

  cleanup() {
    if (this.recorder) {
      if (this.recorder.state === 'recording') {
        this.recorder.stop();
      }
      this.recorder = null;
    }

    if (this.inputStream) {
      this.inputStream.getTracks().forEach(track => track.stop());
      this.inputStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioEngine = new AudioEngine();
