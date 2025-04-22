import { LoopPackAsset } from '@/types/marketplace';

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
