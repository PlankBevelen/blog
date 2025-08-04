<template>
    <div class="header">
        <div class="header__logo">
            <a href="/">
                <img src="@/assets/icons/logo.svg" alt="logo"></img>
            </a>
        </div>
        <div class="header__nav">
            <ul class="header__nav__list">
                <li v-for="(item, index) in navItems" :key="index" 
                    :class="{'active': activeIndex === index}"
                    @click="handleNavClick(item, index)">  
                    <svg-icon :name="item.name"/>
                    <span>{{ item.title }}</span>
                </li>
                <li class="login-box" @click="handleLoginClick">
                    <img :src="userStore.userAvatar" alt="" />
                    <span>{{ userStore.userName }}</span>
                </li>
                <li class="theme-switch">
                    <el-switch
                        v-model="isDarkMode"
                        active-color="#409eff"
                        inactive-color="#dcdfe6"
                        size="default"
                        inline-prompt
                        :active-icon="Sunny"
                        :inactive-icon="Moon"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useTheme } from '@/stores/useTheme'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const activeIndex = ref(0)
const themeStore = useTheme()
const userStore = useUserStore()

// 创建计算属性来处理主题状态
const isDarkMode = computed({
    get: () => themeStore.isDark,
    set: (value: boolean) => {
        if (value !== themeStore.isDark) {
            themeStore.toggleTheme()
        }
    }
})

const navItems = [
    { name : 'home', path: '/', title: '主页' },
    { name : 'talk', path: '/talk', title: '说说' },
    { name : 'article', path: '/article', title: '文章' },
    { name : 'album', path: '/album', title: '相册' },
    { name : 'message', path: '/message', title: '留言' }
]

// 根据当前路由更新activeIndex
const updateActiveIndex = () => {
    const currentPath = route.path
    const index = navItems.findIndex(item => item.path === currentPath)
    activeIndex.value = index >= 0 ? index : 0
}

// 导航点击处理
const handleNavClick = (item: any, index: number) => {
    activeIndex.value = index
    router.push(item.path)
}

const handleLoginClick = () => {
    console.log(userStore.isLoggedIn)
    if (userStore.isLoggedIn) {
        router.push('/profile')
    } else {
        router.push('/login')
    }
}

// 监听路由变化
watch(() => route.path, updateActiveIndex)

// 组件挂载时更新当前激活项
onMounted(() => {
    updateActiveIndex()
})

</script>

<style scoped lang="less">
.header {
    height: var(--text-light-color);
    padding: 4px 4em;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.45);
    color: var(--text-light-color);
    transform: translateY(0);
    z-index: 999;

    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    &__logo {
        height: 100%;
        img {
            height: 100%;
            width: auto;
            object-fit: cover;
        }
    }
    &__nav {
        display: inline-flex;
        align-items: center;
        &__list {
            display: flex;
            align-items: center;
            
            li {
                float: left;
                margin-right: 20px;
                text-align: center;
                vertical-align: middle;
                display: flex;
                align-items: center;
                gap: 4px;

                .svg-icon {
                    color: var(--text-light-color) !important;
                }
                
                &:last-child {
                    margin-right: 0;
                }
                
                &:hover, &.active {
                    color: var(--primary-color);
                    cursor: pointer;
                    .svg-icon {
                        color: var(--primary-color) !important;
                    }
                }        
            }

            .login-box {
                img {
                    width: 2em;
                    height: 2em;
                    border: 1px solid var(--primary-color);
                    border-radius: 50%;
                    object-fit: cover;
                }
            }

            /* .login-box {

                height: 100%;

                .avatar-img {
                    height: 100%;
                    width: auto;
                    object-fit: cover;
                    border-radius: 50%;
                    border: 2px solid var(--primary-color);
                }
            } */
        }
    }
}
</style>
