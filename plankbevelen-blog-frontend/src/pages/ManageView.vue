<template>
    <div class="manage">
        <!-- 左侧导航栏 -->
        <div class="manage-sidebar">
            <div class="logo">
                <h3>管理后台</h3>
            </div>
            <nav class="manage-nav">
                <div class="nav-item" :class="{ active: activeMenu === 'articles' }" @click="setActiveMenu('articles')">
                    <i class="icon">📄</i>
                    <span>文章管理</span>
                </div>
                <div class="nav-item" :class="{ active: activeMenu === 'talks' }" @click="setActiveMenu('talks')">
                    <i class="icon">📝</i>
                    <span>说说管理</span>
                </div>
                <div class="nav-item" :class="{ active: activeMenu === 'albums' }" @click="setActiveMenu('albums')">
                    <i class="icon">📷</i>
                    <span>相册管理</span>
                </div>
                <div class="nav-item" :class="{ active: activeMenu === 'friends' }" @click="setActiveMenu('friends')">
                    <i class="icon">🔗</i>
                    <span>友联管理</span>
                </div>
            </nav>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="manage-content">
            <!-- 面包屑导航 -->
            <div class="breadcrumb">
                <span class="breadcrumb-item">管理后台</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">{{ getMenuTitle(activeMenu) }}</span>
            </div>
            
            <!-- 内容区域 -->
            <div class="content-area">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 根据当前路由获取活跃菜单
const activeMenu = computed(() => {
    const path = route.path
    if (path.includes('/manage/articles')) return 'articles'
    if (path.includes('/manage/talks')) return 'talks'
    if (path.includes('/manage/albums')) return 'albums'
    if (path.includes('/manage/friends')) return 'friends'
    return 'articles'
})

const setActiveMenu = (menu: string) => {
    router.push(`/manage/${menu}`)
}

const getMenuTitle = (menu: string) => {
    const titles: Record<string, string> = {
        articles: '文章管理',
        talks: '说说管理',
        albums: '相册管理',
        friends: '友联管理'
    }
    return titles[menu] || '管理'
}
</script>

<style scoped>
.manage {
    display: flex;
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 左侧导航栏 */
.manage-sidebar {
    width: 250px;
    background-color: #fff;
    border-right: 1px solid #e0e0e0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
}

.logo h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.manage-nav {
    padding: 20px 0;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #666;
}

.nav-item:hover {
    background-color: #f0f0f0;
    color: #333;
}

.nav-item.active {
    background-color: #e3f2fd;
    color: #1976d2;
    border-right: 3px solid #1976d2;
}

.nav-item .icon {
    margin-right: 12px;
    font-size: 16px;
}

.nav-item span {
    font-size: 14px;
    font-weight: 500;
}

/* 右侧内容区域 */
.manage-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 面包屑导航 */
.breadcrumb {
    background-color: #fff;
    padding: 16px 24px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
}

.breadcrumb-item {
    color: #666;
    font-size: 14px;
}

.breadcrumb-item.active {
    color: #1976d2;
    font-weight: 500;
}

.breadcrumb-separator {
    margin: 0 8px;
    color: #ccc;
}

/* 内容区域 */
.content-area {
    flex: 1;
    padding: 24px;
    background-color: #f5f5f5;
    overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .manage {
        flex-direction: column;
    }
    
    .manage-sidebar {
        width: 100%;
        height: auto;
    }
    
    .manage-nav {
        display: flex;
        overflow-x: auto;
        padding: 10px;
    }
    
    .nav-item {
        white-space: nowrap;
        min-width: 120px;
        justify-content: center;
    }
}
</style>
