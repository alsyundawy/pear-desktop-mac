import { ProviderNames } from './index';
import { LRCHub } from './LRCHub';
import { LRCLib } from './LRCLib';
import { MusixMatch } from './MusixMatch';
import { SimpMusic } from './SimpMusic';
import { YTMusic } from './YTMusic';

export const providers = {
  [ProviderNames.YTMusic]: new YTMusic(),
  [ProviderNames.LRCLib]: new LRCLib(),
  [ProviderNames.MusixMatch]: new MusixMatch(),
  [ProviderNames.LRCHub]: new LRCHub(),
  [ProviderNames.SimpMusic]: new SimpMusic(),
  // [ProviderNames.Megalobiz]: new Megalobiz(), // Disabled because it is too unstable and slow
} as const;
