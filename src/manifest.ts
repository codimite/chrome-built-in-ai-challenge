import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
    name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
    description: packageData.description,
    version: packageData.version,
    manifest_version: 3,
    icons: {
        16: 'img/int-blue-16.png',
        32: 'img/int-blue-34.png',
        48: 'img/int-blue-48.png',
        128: 'img/int-blue-128.png',
    },
    action: {
        default_popup: 'popup.html',
        default_icon: 'img/int-blue-48.png',
    },
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['http://*/*', 'https://*/*'],
            js: ['src/contentScript/index.tsx'],
            css: ['src/contentScript/styles.css'],
        },
    ],
    web_accessible_resources: [
        {
            resources: [
                'assets/*',
                'img/int-blue-16.png',
                'img/int-blue-34.png',
                'img/int-blue-48.png',
                'img/int-blue-128.png',
                'img/int-w-128.png',
                'img/darkmode-dark.png',
                'src/contentScript/styles.css',
            ],
            matches: ['<all_urls>'],
        },
    ],
    permissions: ['activeTab', 'scripting', 'storage', 'tabs'],
})
