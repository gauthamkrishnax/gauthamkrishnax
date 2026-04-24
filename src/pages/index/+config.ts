import type { Config } from 'vike/types';
import { defaultSiteDescription, defaultSiteTitle } from '../../config/meta';

/** Home route: explicit defaults so this page stays self-contained if global config changes later. */
export default {
  title: defaultSiteTitle(),
  description: defaultSiteDescription(),
} satisfies Config;
