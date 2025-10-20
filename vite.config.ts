import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8082,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Handle cookies properly to prevent invalid date format warnings
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove any Set-Cookie headers with invalid date formats
            if (proxyRes.headers['set-cookie']) {
              const cookies = Array.isArray(proxyRes.headers['set-cookie']) 
                ? proxyRes.headers['set-cookie'] 
                : [proxyRes.headers['set-cookie']];
              
              const validCookies = cookies.filter(cookie => {
                // Check if cookie has an Expires attribute with valid format
                const expiresMatch = cookie.match(/Expires=([^;]+)/);
                if (expiresMatch) {
                  const expiresDate = expiresMatch[1];
                  // Validate the date format (should be RFC 1123 format)
                  const date = new Date(expiresDate);
                  return !isNaN(date.getTime());
                }
                return true; // Keep cookies without Expires attribute
              });
              
              if (validCookies.length !== cookies.length) {
                console.warn('Filtered out cookies with invalid date formats');
              }
              
              proxyRes.headers['set-cookie'] = validCookies;
            }
          });
        }
      },
    },
    allowedHosts: [
      "obelisk.law"
    ]
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
