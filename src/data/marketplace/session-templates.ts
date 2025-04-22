import { SessionTemplateAsset } from '@/types/marketplace';

export const sessionTemplateAssets: SessionTemplateAsset[] = [
  {
    id: 'template-001',
    title: 'Podcast Duo',
    description: 'Perfect setup for two-person podcast recording',
    imageUrl: '/assets/template-podcast.jpg',
    tags: [
      { name: 'Podcast', color: '#9b87f5' },
      { name: 'Voice', color: '#f58787' }
    ],
    type: 'sessionTemplate',
    isInstalled: false,
    createdAt: '2025-04-03',
    tracks: [
      {
        id: 'host-track',
        name: 'Host Mic',
        type: 'vocals',
        color: '#f58787',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'comp-host',
            name: 'Compressor',
            type: 'compressor',
            active: true,
            params: { threshold: -18, ratio: 2.0 }
          },
          {
            id: 'eq-host',
            name: 'EQ',
            type: 'eq',
            active: true,
            params: { low: 0.6, mid: 0.5, high: 0.4 }
          }
        ],
        waveform: []
      },
      {
        id: 'guest-track',
        name: 'Guest Mic',
        type: 'vocals',
        color: '#87b1f5',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'comp-guest',
            name: 'Compressor',
            type: 'compressor',
            active: true,
            params: { threshold: -18, ratio: 2.0 }
          },
          {
            id: 'eq-guest',
            name: 'EQ',
            type: 'eq',
            active: true,
            params: { low: 0.6, mid: 0.5, high: 0.4 }
          }
        ],
        waveform: []
      }
    ]
  },
  {
    id: 'template-002',
    title: 'LoFi Beat Session',
    description: 'Quick start for creating lofi hip hop beats',
    imageUrl: '/assets/template-lofi.jpg',
    tags: [
      { name: 'LoFi', color: '#f5cc87' },
      { name: 'Hip-Hop', color: '#9b87f5' }
    ],
    type: 'sessionTemplate',
    isInstalled: false,
    createdAt: '2025-04-12',
    tracks: [
      {
        id: 'drums',
        name: 'Drums',
        type: 'drums',
        color: '#f58787',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'comp-drums',
            name: 'Compressor',
            type: 'compressor',
            active: true,
            params: { threshold: -12, ratio: 3.0 }
          }
        ],
        waveform: []
      },
      {
        id: 'bass',
        name: 'Bass',
        type: 'bass',
        color: '#87f5e9',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'eq-bass',
            name: 'EQ',
            type: 'eq',
            active: true,
            params: { low: 0.7, mid: 0.5, high: 0.3 }
          }
        ],
        waveform: []
      },
      {
        id: 'keys',
        name: 'Rhodes',
        type: 'keys',
        color: '#d3f587',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'reverb-keys',
            name: 'Reverb',
            type: 'reverb',
            active: true,
            params: { mix: 0.3, decay: 1.5 }
          }
        ],
        waveform: []
      }
    ]
  },
  {
    id: 'template-003',
    title: 'Acoustic Guitar & Voice',
    description: 'Perfect for singer-songwriter recordings',
    imageUrl: '/assets/template-acoustic.jpg',
    tags: [
      { name: 'Acoustic', color: '#d3f587' },
      { name: 'Vocals', color: '#9b87f5' }
    ],
    type: 'sessionTemplate',
    isInstalled: false,
    createdAt: '2025-04-18',
    tracks: [
      {
        id: 'vocals',
        name: 'Lead Vocals',
        type: 'vocals',
        color: '#9b87f5',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'comp-vox',
            name: 'Compressor',
            type: 'compressor',
            active: true,
            params: { threshold: -18, ratio: 2.5 }
          },
          {
            id: 'reverb-vox',
            name: 'Reverb',
            type: 'reverb',
            active: true,
            params: { mix: 0.2, decay: 1.2 }
          }
        ],
        waveform: []
      },
      {
        id: 'guitar',
        name: 'Acoustic Guitar',
        type: 'instrument',
        color: '#d3f587',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        isRecording: false,
        inputMonitor: true,
        fx: [
          {
            id: 'eq-guitar',
            name: 'EQ',
            type: 'eq',
            active: true,
            params: { low: 0.6, mid: 0.5, high: 0.6 }
          }
        ],
        waveform: []
      }
    ]
  }
];
