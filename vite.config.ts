import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// In `npm run dev`, serve /api/breakdown from server/breakdown.ts (on Vercel it's api/breakdown.ts).
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
      server.middlewares.use('/api/breakdown', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const mod = await server.ssrLoadModule('/server/breakdown.ts')
        const request = new Request('http://localhost/api/breakdown', {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response: Response = await mod.handle(request)
        res.statusCode = response.status
        res.setHeader('content-type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  // The single-file preview build (VITE_DEMO=1) needs one bundle.
  build: process.env.VITE_DEMO ? { rollupOptions: { output: { inlineDynamicImports: true } } } : undefined,
})
