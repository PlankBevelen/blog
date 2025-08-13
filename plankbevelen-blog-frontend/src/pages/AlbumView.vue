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
import { useAlbumStore } from '@/stores/album'
import imagePath from '@/assets/images/album.jpg'
import type { Album, AlbumCategory } from '@/types/album'

const router = useRouter()
const albumStore = useAlbumStore()

// 基础数据
const title = ref('相册')
const image = ref(imagePath)

// 筛选和分页
const selectedCategory = ref<number | null>(null)
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(12)

// 分类数据
const categories = ref<AlbumCategory[]>([
    { id: 0, name: '全部', icon: 'folder' },
    { id: 1, name: '旅行', icon: 'plane' },
    { id: 2, name: '生活', icon: 'home' },
    { id: 3, name: '美食', icon: 'utensils' },
    { id: 4, name: '风景', icon: 'mountain' },
    { id: 5, name: '人像', icon: 'user' },
    { id: 6, name: '其他', icon: 'more' }
])

// 响应式数据
const loading = ref(false)

// 统计数据
const totalAlbums = computed(() => albumStore.albums.length)

const totalPhotos = computed(() => {
    let count = 0
    albumStore.albums.forEach(album => {
        count += album.photo_count
    })
    return count
})

// 筛选后的相册
const filteredAlbums = computed(() => {
    let filtered = [...albumStore.albums]
    
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

// 方法
const getCategoryCount = (categoryId: number | null): number => {
    if (categoryId === null) return albumStore.albums.length
    return albumStore.albums.filter(album => album.category_id === categoryId).length
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



const shareAlbum = (album: Album) => {
    const url = `${window.location.origin}/album/detail/${album.id}`
    navigator.clipboard.writeText(url).then(() => {
        // ElMessage.success('相册链接已复制到剪贴板')
        console.log('相册链接已复制到剪贴板')
    }).catch(() => {
        // ElMessage.error('复制失败')
        console.log('复制失败')
    })
}

// 生命周期
onMounted(async () => {
    loading.value = true
    try {
        // 尝试从store获取数据
        await albumStore.getAlbums()
        // 如果store中没有数据，使用模拟数据
        if (albumStore.albums.length === 0) {
            console.log('使用模拟数据')
        }
    } catch (error) {
        console.error('获取相册数据失败，使用模拟数据:', error)
    } finally {
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        loading.value = false
    }
})
</script>

<style scoped lang="less" src="@/assets/styles/pages/album.less"></style>
