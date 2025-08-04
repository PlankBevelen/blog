import { defineStore } from "pinia";
import { cookie } from "@/utils/cookie";

const THEME_KEY = 'theme'
const DARK_THEME = 'dark'
const LIGHT_THEME = 'light'

export const useTheme = defineStore('theme', {
    state() {
        return {
            isDark: false
        }
    },
    getters: {
        currentTheme: (state) => state.isDark ? DARK_THEME : LIGHT_THEME
    },
    actions: {
        // 初始化主题
        initTheme() {
            const savedTheme = cookie.get(THEME_KEY)
            if (savedTheme) {
                this.isDark = savedTheme === DARK_THEME
            } else {
                // 如果没有保存的主题，检查系统偏好
                this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            }
            this.applyTheme()
            this.watchSystemTheme()
        },
        
        // 切换主题
        toggleTheme() {
            this.isDark = !this.isDark
            console.log(this.isDark);
            this.saveTheme()
            this.applyTheme()
        },
        
        // 设置主题
        setTheme(theme: 'dark' | 'light') {
            this.isDark = theme === DARK_THEME
            this.saveTheme()
            this.applyTheme()
        },
        
        // 保存主题到cookie
        saveTheme() {
            cookie.set(THEME_KEY, this.currentTheme, { expires: 365 })
        },
        
        // 应用主题到DOM
        applyTheme() {
            const html = document.documentElement
            if (this.isDark) {
                html.classList.add('dark')
                html.setAttribute('data-theme', DARK_THEME)
            } else {
                html.classList.remove('dark')
                html.setAttribute('data-theme', LIGHT_THEME)
            }
        },
        
        // 监听系统主题变化
        watchSystemTheme() {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
                // 只有在没有用户手动设置主题时才跟随系统
                if (!cookie.get(THEME_KEY)) {
                    this.isDark = e.matches
                    this.applyTheme()
                }
            }
            mediaQuery.addEventListener('change', handleChange)
        }
    },
})