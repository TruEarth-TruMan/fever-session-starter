
import { FXChainAsset, LoopPackAsset, SessionTemplateAsset } from '@/types/marketplace';

export const fxChainAssets: FXChainAsset[] = [
  {
    id: 'fx-001',
    title: 'LoFi Vocals',
    description: 'Warm, vintage vocal processing with room reverb and tape saturation',
    imageUrl: '/assets/fx-lofi.jpg',
    tags: [
      { name: 'Vocals', color: '#9b87f5' },
      { name: 'LoFi', color: '#f5cc87' }
    ],
    type: 'fxChain',
    isInstalled: false,
    createdAt: '2025-04-01',
    effects: [
      {
        id: 'reverb-1',
        name: 'Reverb',
        type: 'reverb',
        active: true,
        params: { mix: 0.3, decay: 1.2 }
      },
      {
        id: 'eq-1',
        name: 'EQ',
        type: 'eq',
        active: true,
        params: { low: 0.4, mid: 0.5, high: 0.6 }
      },
      {
        id: 'compressor-1',
        name: 'Compressor',
        type: 'compressor',
        active: true,
        params: { threshold: -12, ratio: 2.5 }
      }
    ]
  },
  {
    id: 'fx-002',
    title: 'Trap Beat Processing',
    description: 'Heavy compression and saturation perfect for modern trap beats',
    imageUrl: '/assets/fx-trap.jpg',
    tags: [
      { name: 'Drums', color: '#f58787' },
      { name: 'Trap', color: '#87f5e9' }
    ],
    type: 'fxChain',
    isInstalled: false,
    createdAt: '2025-04-05',
    effects: [
      {
        id: 'compressor-2',
        name: 'Compressor',
        type: 'compressor',
        active: true,
        params: { threshold: -18, ratio: 4.0 }
      },
      {
        id: 'distortion-1',
        name: 'Distortion',
        type: 'distortion',
        active: true,
        params: { drive: 0.4, tone: 0.6 }
      }
    ]
  },
  {
    id: 'fx-003',
    title: 'Ambient Guitar',
    description: 'Lush, spacious effects for atmospheric guitar textures',
    imageUrl: '/assets/fx-ambient.jpg',
    tags: [
      { name: 'Guitar', color: '#87b1f5' },
      { name: 'Ambient', color: '#d3f587' }
    ],
    type: 'fxChain',
    isInstalled: false,
    createdAt: '2025-04-10',
    effects: [
      {
        id: 'delay-1',
        name: 'Delay',
        type: 'delay',
        active: true,
        params: { time: 0.5, feedback: 0.65, mix: 0.4 }
      },
      {
        id: 'reverb-2',
        name: 'Reverb',
        type: 'reverb',
        active: true,
        params: { mix: 0.6, decay: 4.5 }
      }
    ]
  }
];

export const loopPackAssets: LoopPackAsset[] = [
  {
    id: 'loop-001',
    title: 'Chill Hip-Hop Drums',
    description: '10 laid-back drum loops perfect for chill beats',
    imageUrl: '/assets/loop-hiphop.jpg',
    tags: [
      { name: 'Hip-Hop', color: '#9b87f5' },
      { name: 'Drums', color: '#f58787' }
    ],
    type: 'loopPack',
    isInstalled: false,
    createdAt: '2025-04-02',
    loops: [
      {
        name: 'ChillBeat_01',
        url: '/loops/chill/beat_01.mp3',
        tempo: 85,
        instrument: 'Drums'
      },
      {
        name: 'ChillBeat_02',
        url: '/loops/chill/beat_02.mp3',
        tempo: 90,
        instrument: 'Drums'
      },
      {
        name: 'ChillBeat_03',
        url: '/loops/chill/beat_03.mp3',
        tempo: 92,
        instrument: 'Drums'
      }
    ]
  },
  {
    id: 'loop-002',
    title: 'Neo Soul Keys',
    description: 'Warm Rhodes and electric piano loops in various keys',
    imageUrl: '/assets/loop-neosoul.jpg',
    tags: [
      { name: 'Neo Soul', color: '#f5cc87' },
      { name: 'Keys', color: '#87f5e9' }
    ],
    type: 'loopPack',
    isInstalled: false,
    createdAt: '2025-04-07',
    loops: [
      {
        name: 'Rhodes_Cmaj7',
        url: '/loops/neosoul/rhodes_cmaj7.mp3',
        tempo: 82,
        key: 'C',
        instrument: 'Rhodes'
      },
      {
        name: 'EP_Progression_Dm',
        url: '/loops/neosoul/ep_dm.mp3',
        tempo: 78,
        key: 'D minor',
        instrument: 'Electric Piano'
      }
    ]
  },
  {
    id: 'loop-003',
    title: 'Analog Synth Textures',
    description: 'Evolving synthesizer textures for electronic music',
    imageUrl: '/assets/loop-synth.jpg',
    tags: [
      { name: 'Electronic', color: '#d3f587' },
      { name: 'Synth', color: '#87b1f5' }
    ],
    type: 'loopPack',
    isInstalled: false,
    createdAt: '2025-04-15',
    loops: [
      {
        name: 'Pad_Atmosphere',
        url: '/loops/synth/pad_atmos.mp3',
        tempo: 100,
        instrument: 'Synth Pad'
      },
      {
        name: 'Arp_Sequence',
        url: '/loops/synth/arp_seq.mp3',
        tempo: 120,
        instrument: 'Arpeggiator'
      }
    ]
  }
];

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

export const allAssets = [...fxChainAssets, ...loopPackAssets, ...sessionTemplateAssets];
