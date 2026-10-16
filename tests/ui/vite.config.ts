import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const file = (name: string) => fileURLToPath(new URL(name, import.meta.url));
export default defineConfig({
  plugins: [react()],
  optimizeDeps: { entries: ['tests/ui/index.html'] },
  resolve: { alias: [
    { find: /^@mysten\/dapp-kit-react$/, replacement: file('./wallet.ts') },
    { find: /^\.\.\/useExecuteTransaction$/, replacement: file('./executor.ts') },
    { find: /^\.\.\/bragChain$/, replacement: file('./chain.ts') },
    { find: /^\.\.\/gameLobby$/, replacement: file('./lobby.ts') },
  ] },
  server: { host: '127.0.0.1', port: 4174, strictPort: true },
});
