import type { Config } from 'vike/types';
import vikeReact from 'vike-react/config';
import ogImage from '../assets/images/me.jpg';
import { defaultSiteDescription, defaultSiteTitle } from '../config/meta';

// https://vike.dev/config
export default {
  extends: [vikeReact],
  prerender: true,
  title: defaultSiteTitle(),
  description: defaultSiteDescription(),
  image: ogImage,
  favicon: '/favicon.svg',
  lang: 'en',
} satisfies Config;