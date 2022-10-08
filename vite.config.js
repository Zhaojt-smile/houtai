import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        // hmr:true,
        proxy: {
            '/api': {
                target: "http://c.m.163.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    plugins: [vue()],
    base: './',
    alias: {
        'vue': 'vue/dist/vue.esm-bundler.js' // 定义vue的别名，如果使用其他的插件，可能会用到别名
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "view": path.resolve(__dirname, "src/view"),
            "components": path.resolve(__dirname, "src/components"),
            "assets": path.resolve(__dirname, "src/assets")
        },
    }

})