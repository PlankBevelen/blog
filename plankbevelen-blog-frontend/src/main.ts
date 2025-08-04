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

import '@/assets/styles/base.less'
import '@/assets/styles/common.less'
import '@/assets/styles/themes.less'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.component('svg-icon', SvgIcon)

app.mount('#app')

// 初始化主题
const themeStore = useTheme()
themeStore.initTheme()

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserState()
