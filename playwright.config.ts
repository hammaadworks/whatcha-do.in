import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', {open: 'never'}]],
    use: {
        trace: 'on-first-retry',
        baseURL: 'http://127.0.0.1:3000', // Explicitly set baseURL
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox']},
        },
        {
            name: 'webkit',
            use: {...devices['Desktop Safari']},
        },
    ],
    webServer: {
        command: 'npm run dev', // Command to start your dev server
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
    },
});
