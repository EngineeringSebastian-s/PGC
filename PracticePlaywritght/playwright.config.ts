import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    retries: 0,
    workers: 7,
    timeout: 20_000,
    reporter: 'html',
    use: {
        baseURL: 'https://practicesoftwaretesting.com/',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        locale: 'en-ES',
        testIdAttribute: 'data-test',
    },

    projects: [
        {
            name: 'chromium',
            use: {
                channel: 'chromium',
                viewport: null,
                launchOptions: {
                    args: ['--start-maximized'],
                }
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
