import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/ui', testMatch:'*.spec.ts', fullyParallel:false,
  use:{baseURL:'http://127.0.0.1:4174',channel:process.env.PLAYWRIGHT_CHANNEL||undefined,trace:'retain-on-failure'},
  webServer:{command:'npx vite --config tests/ui/vite.config.ts',url:'http://127.0.0.1:4174/tests/ui/index.html',reuseExistingServer:!process.env.CI},
});
