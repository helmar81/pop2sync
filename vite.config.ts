import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      // 1. Base path: Critical for BrowserRouter to handle assets correctly on sub-routes
      base: '/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      
      plugins: [react()],
      
      build: {
        // 2. Enable sourcemaps for production debugging
        sourcemap: true, 
        
        // 3. Fix: Resolve "is not a constructor" errors in 3D libraries
        commonjsOptions: {
          transformMixedEsModules: true,
        },
        
        rollupOptions: {
          output: {
            // 4. Performance: Smart chunking to reduce main bundle size
            manualChunks: {
              'vendor': ['react', 'react-dom', 'react-router-dom'],
              'globe-engine': ['react-globe.gl', 'three']
            },
          },
        },
        
        // 5. Minification: Ensure the build is as small as possible
        minify: 'esbuild',
        target: 'esnext'
      },
      
      // 6. Pre-bundle large dependencies for faster dev and stable builds
      optimizeDeps: {
        include: ['react-globe.gl', 'three']
      },
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      
      resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});