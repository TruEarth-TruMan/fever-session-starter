import { FXChainAsset } from '@/types/marketplace';

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
