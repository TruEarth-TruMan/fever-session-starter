
import { fxChainAssets } from './fx-chains';
import { loopPackAssets } from './loop-packs';
import { sessionTemplateAssets } from './session-templates';

export const allAssets = [...fxChainAssets, ...loopPackAssets, ...sessionTemplateAssets];

export {
  fxChainAssets,
  loopPackAssets,
  sessionTemplateAssets
};
