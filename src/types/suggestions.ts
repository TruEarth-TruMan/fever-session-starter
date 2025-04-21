
export type SuggestionType = 'volume' | 'clipping' | 'dryVocals' | 'loopFatigue';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  message: string;
  action: () => void;
  dismissCount?: number;
}

export interface SuggestionTrigger {
  type: SuggestionType;
  condition: () => boolean;
  message: string;
  action: () => void;
}
