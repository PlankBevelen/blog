<template>
    <TopBanner :title="title" :imagePath="image" height="35vh"/>
    <div class="gallery-collection">
        <div class="container">
            <!-- 页面头部 -->
            <div class="collection-header card">
                <div class="header-content">
                    <h1 class="page-title">相册集合</h1>
                    <p class="page-description">记录美好时光，分享精彩瞬间</p>
                </div>
                
                <div class="header-stats">
                    <div class="stat-item">
                        <div class="stat-number">{{ totalAlbums }}</div>
                        <div class="stat-label">相册总数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ totalPhotos }}</div>
                        <div class="stat-label">照片总数</div>
                    </div>
                </div>
            </div>

            <!-- 筛选和排序 -->
            <div class="collection-filters card">
                <div class="filter-tabs">
                    <div 
                        v-for="category in categories" 
                        :key="category.id"
                        :class="['filter-tab', { active: selectedCategory === category.id }, 'card']"
                        @click="selectedCategory = category.id"
                    >
                        <svg-icon :name="category.icon" size="16px" color="var(--text-color)"/>
                        <span>{{ category.name }}</span>
                        <span class="count">({{ getCategoryCount(category.id) }})</span>
                    </div>
                </div>
                
                <div class="sort-controls">
                    <el-select v-model="sortBy" size="default" style="width: 140px">
                        <el-option label="最新创建" value="latest" />
                        <el-option label="最早创建" value="oldest" />
                        <el-option label="照片最多" value="most_photos" />
                        <el-option label="最近更新" value="recent_update" />
                    </el-select>
                </div>
            </div>

            <!-- 相册列表 -->
            <div class="albums-container">
                <!-- 加载状态 -->
                <div v-if="loading" class="loading-grid">
                    <div v-for="i in 6" :key="i" class="album-skeleton">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item variant="image" style="width: 100%; height: 200px; border-radius: 12px 12px 0 0;" />
                                <div style="padding: 16px;">
                                    <el-skeleton-item variant="text" style="width: 80%;" />
                                    <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px;" />
                                    <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px;" />
                                </div>
                            </template>
                        </el-skeleton>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else-if="filteredAlbums.length === 0" class="empty-state">
                    <svg-icon name="folder" size="80px" color="#ddd" />
                    <h3>暂无相册</h3>
                    <p>还没有创建任何相册</p>
                </div>

                <!-- 相册网格 -->
                <div v-else class="albums-grid">
                    <div 
                        v-for="album in paginatedAlbums" 
                        :key="album.id"
                        class="album-card card"
                        @click="goToAlbum(album.id)"
                    >
                        <!-- 相册封面 -->
                        <div class="album-cover">
                            <div class="cover-images">
                                <!-- 主封面 -->
                                <div class="main-cover">
                                    <img 
                                        v-lazy="album.cover_image" 
                                        :alt="album.name"
                                        loading="lazy"
                                    />
                                </div>
                                
                                <!-- 预览小图 -->
                                <div v-if="album.preview_images?.length > 0" class="preview-images">
                                    <div 
                                        v-for="(preview, index) in album.preview_images.slice(0, 3)" 
                                        :key="index"
                                        class="preview-item"
                                        :style="{ animationDelay: `${index * 0.1}s` }"
                                    >
                                        <img v-lazy="preview" :alt="`预览${index + 1}`" />
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 悬停遮罩 -->
                            <div class="album-overlay">
                                <div class="overlay-content">
                                    <svg-icon name="folder-open" size="24px" color="white" />
                                    <span>查看相册</span>
                                </div>
                                <div class="quick-stats">
                                    <span>{{ album.photo_count }} 张照片</span>
                                </div>
                            </div>
                            
                            <!-- 相册标签 -->
                            <div class="album-badges">
                                <span v-if="album.is_featured" class="badge featured">精选</span>
                                <span v-if="album.is_private" class="badge private">私有</span>
                                <span class="badge category">{{ getCategoryName(album.category_id) }}</span>
                            </div>
                        </div>

                        <!-- 相册信息 -->
                        <div class="album-info">
                            <div class="album-header">
                                <h3 class="album-name">{{ album.name }}</h3>
                                <div class="album-date">{{ formatDate(album.updated_at) }}</div>
                            </div>
                            
                            <p v-if="album.description" class="album-description">
                                {{ album.description }}
                            </p>
                            
                            <div class="album-meta">
                                <div class="meta-stats">
                                    <span class="stat">
                                        <svg-icon name="image" size="14px" />
                                        {{ album.photo_count }} 张
                                    </span>
                                    <span class="stat">
                                        <svg-icon name="eye" size="14px" />
                                        {{ formatNumber(album.views) }}
                                    </span>
                                    <span class="stat">
                                        <svg-icon name="heart" size="14px" />
                                        {{ formatNumber(album.likes) }}
                                    </span>
                                </div>
                                
                                <div class="meta-actions">
                                    <el-button size="small" type="primary" @click.stop="goToAlbum(album.id)">
                                        查看详情
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 分页 -->
                <div v-if="totalPages > 1" class="pagination-container">
                    <el-pagination
                        v-model:current-page="currentPage"
                        :page-size="pageSize"
                        :total="filteredAlbums.length"
                        layout="total, prev, pager, next, jumper"
                        @current-change="handlePageChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBanner from '@/components/TopBanner.vue'
import imagePath from '@/assets/images/album.jpg'

// 类型定义
interface Album {
    id: number
    name: string
    description?: string
    cover_image?: string
    preview_images?: string[]
    category_id: number
    photo_count: number
    views: number
    likes: number
    is_featured: boolean
    is_private: boolean
    created_at: string
    updated_at: string
}

interface AlbumCategory {
    id: number | null
    name: string
    icon: string
}

const router = useRouter()

// 基础数据
const title = ref('相册')
const image = ref(imagePath)
const loading = ref(false)

// 筛选和分页
const selectedCategory = ref<number | null>(null)
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)

// 分类数据
const categories = ref<AlbumCategory[]>([
    { id: null, name: '全部', icon: 'folder' },
    { id: 1, name: '旅行', icon: 'plane' },
    { id: 2, name: '生活', icon: 'home' },
    { id: 3, name: '美食', icon: 'utensils' },
    { id: 4, name: '风景', icon: 'mountain' },
    { id: 5, name: '人像', icon: 'user' },
    { id: 6, name: '其他', icon: 'more' }
])

// 相册数据
const albums = ref<Album[]>([
    {
        id: 1,
        name: '春日踏青记',
        description: '春天的脚步轻盈而美好，记录下这个季节最美的瞬间',
        cover_image: 'https://picsum.photos/400/300?random=1',
        preview_images: [
            'https://picsum.photos/60/60?random=11',
            'https://picsum.photos/60/60?random=12',
            'https://picsum.photos/60/60?random=13'
        ],
        category_id: 4,
        photo_count: 24,
        views: 1250,
        likes: 89,
        is_featured: true,
        is_private: false,
        created_at: '2024-03-15T10:30:00Z',
        updated_at: '2024-03-20T14:20:00Z'
    },
    {
        id: 2,
        name: '日式料理制作',
        description: '学习制作正宗日式料理的过程记录',
        cover_image: 'https://picsum.photos/400/300?random=2',
        preview_images: [
            'https://picsum.photos/60/60?random=21',
            'https://picsum.photos/60/60?random=22'
        ],
        category_id: 3,
        photo_count: 16,
        views: 892,
        likes: 56,
        is_featured: false,
        is_private: false,
        created_at: '2024-03-10T08:15:00Z',
        updated_at: '2024-03-18T16:45:00Z'
    },
    {
        id: 3,
        name: '城市夜景',
        description: '夜幕降临时城市的另一面，霓虹灯下的繁华与宁静',
        cover_image: 'https://picsum.photos/400/300?random=3',
        preview_images: [
            'https://picsum.photos/60/60?random=31',
            'https://picsum.photos/60/60?random=32',
            'https://picsum.photos/60/60?random=33'
        ],
        category_id: 4,
        photo_count: 32,
        views: 1680,
        likes: 124,
        is_featured: true,
        is_private: false,
        created_at: '2024-03-05T19:30:00Z',
        updated_at: '2024-03-15T21:10:00Z'
    },
    {
        id: 4,
        name: '家庭聚餐',
        description: '温馨的家庭时光，记录与家人共度的美好时刻',
        cover_image: 'https://picsum.photos/400/300?random=4',
        preview_images: [
            'https://picsum.photos/60/60?random=41',
            'https://picsum.photos/60/60?random=42'
        ],
        category_id: 2,
        photo_count: 18,
        views: 456,
        likes: 32,
        is_featured: false,
        is_private: true,
        created_at: '2024-02-28T12:00:00Z',
        updated_at: '2024-03-12T18:30:00Z'
    },
    {
        id: 5,
        name: '海边度假',
        description: '蓝天白云，海风徐来，度假时光总是那么惬意',
        cover_image: 'https://picsum.photos/400/300?random=5',
        preview_images: [
            'https://picsum.photos/60/60?random=51',
            'https://picsum.photos/60/60?random=52',
            'https://picsum.photos/60/60?random=53'
        ],
        category_id: 1,
        photo_count: 45,
        views: 2340,
        likes: 198,
        is_featured: true,
        is_private: false,
        created_at: '2024-02-20T09:00:00Z',
        updated_at: '2024-03-08T15:20:00Z'
    },
    {
        id: 6,
        name: '朋友聚会',
        description: '好友相聚的快乐时光，青春里最珍贵的回忆',
        cover_image: 'https://picsum.photos/400/300?random=6',
        preview_images: [
            'https://picsum.photos/60/60?random=61',
            'https://picsum.photos/60/60?random=62'
        ],
        category_id: 5,
        photo_count: 28,
        views: 678,
        likes: 45,
        is_featured: false,
        is_private: false,
        created_at: '2024-02-15T20:30:00Z',
        updated_at: '2024-03-01T22:15:00Z'
    }
])

// 计算属性
const filteredAlbums = computed(() => {
    let filtered = [...albums.value]
    
    // 按分类筛选
    if (selectedCategory.value !== null) {
        filtered = filtered.filter(album => album.category_id === selectedCategory.value)
    }
    
    // 排序
    switch (sortBy.value) {
        case 'latest':
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            break
        case 'oldest':
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            break
        case 'most_photos':
            filtered.sort((a, b) => b.photo_count - a.photo_count)
            break
        case 'recent_update':
            filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            break
    }
    
    return filtered
})

const paginatedAlbums = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredAlbums.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredAlbums.value.length / pageSize.value))
const totalAlbums = computed(() => albums.value.length)
const totalPhotos = computed(() => albums.value.reduce((sum, album) => sum + album.photo_count, 0))

// 方法
const getCategoryCount = (categoryId: number | null): number => {
    if (categoryId === null) return albums.value.length
    return albums.value.filter(album => album.category_id === categoryId).length
}

const getCategoryName = (categoryId: number): string => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category?.name || '未分类'
}

const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const handlePageChange = (page: number) => {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToAlbum = (albumId: number) => {
    router.push({ name: 'AlbumDetail', params: { id: albumId } })
}

// 生命周期
onMounted(async () => {
    loading.value = true
    // 模拟加载数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    loading.value = false
})
</script>

<style scoped lang="less" src="@/assets/styles/pages/album.less"></style>
