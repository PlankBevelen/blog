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
                    <!-- <div class="stat-item">
                        <div class="stat-number">{{ totalPhotos }}</div>
                        <div class="stat-label">照片总数</div>
                    </div> -->
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
                <div v-else-if="albumStore.albums.length === 0" class="empty-state">
                    <svg-icon name="folder" size="80px" color="#ddd" />
                    <h3>暂无相册</h3>
                    <p>还没有创建任何相册</p>
                </div>

                <!-- 相册网格 -->
                <div v-else class="albums-grid">
                    <div 
                        v-for="album in albumStore.albums" 
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
                                        v-lazy="album.cover" 
                                        :alt="album.name"
                                        loading="lazy"
                                    />
                                </div>
                                
                                <!-- 预览小图 -->
                                <div v-if="album.preview_images" class="preview-images">
                                    <div 
                                        v-for="(preview, index) in album.preview_images" 
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
                                    <span>{{ album.photos_count }} 张照片</span>
                                </div>
                            </div>
                            
                            <!-- 相册标签 -->
                            <div class="album-badges">
                                <span v-if="album.is_featured" class="badge featured">精选</span>
                                <span v-if="album.is_private" class="badge private">私有</span>
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
                                        {{ album.photos_count }} 张
                                    </span>
                                    <span class="stat">
                                        <svg-icon name="eye" size="14px" />
                                        {{ formatNumber(album.views_count) }}
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
import type { Album } from '@/types/album'
import { formatNumber, formatDate } from '@/utils/format'

const router = useRouter()
const albumStore = useAlbumStore()

// 基础数据
const title = ref('相册')
const image = ref(imagePath)

onMounted( async () => { 
    await albumStore.fetchAllAlbums()
})

// 响应式数据
const loading = ref(false)

// 统计数据
const totalAlbums = computed(() => albumStore.albums.length)

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

</script>

<style scoped lang="less" src="@/assets/styles/pages/album.less"></style>
