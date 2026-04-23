import type { Config } from 'vike/types'
import vikeReact from 'vike-react/config'

// https://vike.dev/config
export default {
  extends: [vikeReact],
  prerender: true,
} satisfies Config