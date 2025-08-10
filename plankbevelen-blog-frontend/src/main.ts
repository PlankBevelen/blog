import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'   
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import { useTheme } from '@/stores/useTheme'
import { useUserStore } from '@/stores/user'
import VueLazyload from 'vue3-lazy'

import '@/assets/styles/base.less'
import '@/assets/styles/common.less'
import '@/assets/styles/themes.less'

async function initApp() {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)
    app.use(ElementPlus)
    app.use(VueLazyload, {
        loading: '/loading.gif',        // 加载中显示的图片
        error: '/loading.gif',          // 加载失败显示的图片
        attempt: 1,                     // 尝试加载次数
        preLoad: 1.3,                   // 预加载高度比例
        throttleWait: 500               // 节流等待时间
    })
    app.component('svg-icon', SvgIcon)

    // 初始化主题
    const themeStore = useTheme()
    themeStore.initTheme()

    // 初始化用户状态
    const userStore = useUserStore()
    await userStore.initUserState()

    app.mount('#app')
}

initApp()
