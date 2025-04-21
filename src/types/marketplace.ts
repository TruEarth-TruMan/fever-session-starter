
import { Effect, Track } from '@/types';

export interface AssetTag {
  name: string;
  color?: string;
}

export interface MarketplaceAsset {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: AssetTag[];
  type: 'fxChain' | 'loopPack' | 'sessionTemplate';
  isInstalled: boolean;
  createdAt: string;
}

export interface FXChainAsset extends MarketplaceAsset {
  type: 'fxChain';
  effects: Effect[];
}

export interface LoopPackAsset extends MarketplaceAsset {
  type: 'loopPack';
  loops: {
    name: string;
    url: string;
    tempo: number;
    key?: string;
    instrument: string;
  }[];
}

export interface SessionTemplateAsset extends MarketplaceAsset {
  type: 'sessionTemplate';
  tracks: Track[];
}

export type AnyAsset = FXChainAsset | LoopPackAsset | SessionTemplateAsset;
