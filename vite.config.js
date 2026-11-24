import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const imageMap = {
  '@loader-img1': path.resolve(
    __dirname,
    'src/assets/loader/Leave Only Footprints, Take Only Memories......#homefour #stonecladding #inferiordesign #Exferi.webp'
  ),
  '@loader-img2': path.resolve(
    __dirname,
    'src/assets/loader/Leave Only Footprints, Take Only Memories......#homefour #stonecladding #inferiordesign #Exferi (1).webp'
  ),
  '@loader-img3': path.resolve(
    __dirname,
    'src/assets/loader/Leave Only Footprints, Take Only Memories......#homefour #stonecladding #inferiordesign #Exferi (2).webp'
  ),
}

function loaderWebpPlugin() {
  let isBuild = false

  return {
    name: 'loader-webp-plugin',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    resolveId(id) {
      if (imageMap[id]) {
        return '\0virtual:' + id
      }
      return null
    },
    load(id) {
      if (id.startsWith('\0virtual:@loader-img')) {
        const alias = id.replace('\0virtual:', '')
        const filePath = imageMap[alias]
        if (filePath && fs.existsSync(filePath)) {
          if (isBuild) {
            const referenceId = this.emitFile({
              type: 'asset',
              name: `loader-${alias.slice(-1)}.webp`,
              source: fs.readFileSync(filePath),
            })
            return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`
          } else {
            const buffer = fs.readFileSync(filePath)
            const base64 = buffer.toString('base64')
            return `export default "data:image/webp;base64,${base64}";`
          }
        }
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [loaderWebpPlugin(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          gsap: ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
