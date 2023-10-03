import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {RemoteConfig} from "vite-remote-config-plugin";

export default defineConfig({
    plugins: [
        vue(),
        RemoteConfig({
            injectTransform: true,
        }),
    ],
})
