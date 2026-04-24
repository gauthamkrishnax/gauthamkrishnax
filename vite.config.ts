import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import vike from 'vike/plugin'
import mdx from '@mdx-js/rollup'
import { allowRobotsInThisBuild, robotsTxtPlugin } from './vite/robotsBuildPolicy'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_ALLOW_ROBOTS__: JSON.stringify(allowRobotsInThisBuild()),
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    mdx(),
    vike(),
    robotsTxtPlugin(),
  ]
})
