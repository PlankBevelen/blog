<template>
    <div class="albums-manage">
        <div class="page-header">
            <h2>相册管理</h2>
            <p>管理您的所有相册和图片</p>
        </div>
        
        <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
                <i class="icon">📁</i>
                新建相册
            </el-button>
            <el-button @click="handleUpload">
                <i class="icon">📤</i>
                上传图片
            </el-button>
            <el-input 
                v-model="searchText" 
                placeholder="搜索相册名称..." 
                style="width: 300px;"
                clearable
            >
                <template #prefix>
                    <i class="icon">🔍</i>
                </template>
            </el-input>
        </div>
        
        <div class="albums-grid">
            <div 
                v-for="album in albums" 
                :key="album.id" 
                class="album-card"
                @click="handleViewAlbum(album)"
            >
                <div class="album-cover">
                    <img 
                        v-if="album.cover" 
                        :src="album.cover" 
                        :alt="album.name"
                        class="cover-image"
                    />
                    <div v-else class="no-cover">
                        <i class="icon">📷</i>
                        <span>暂无封面</span>
                    </div>
                </div>
                <div class="album-info">
                    <h3 class="album-name">{{ album.name }}</h3>
                    <p class="album-desc">{{ album.description || '暂无描述' }}</p>
                    <div class="album-meta">
                        <span class="photo-count">{{ album.photoCount }} 张照片</span>
                        <span class="create-time">{{ album.createTime }}</span>
                    </div>
                </div>
                <div class="album-actions" @click.stop>
                    <el-dropdown trigger="click">
                        <el-button size="small" circle>
                            <i class="icon">⋯</i>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="handleEdit(album)">
                                    <i class="icon">✏️</i> 编辑
                                </el-dropdown-item>
                                <el-dropdown-item @click="handleSetCover(album)">
                                    <i class="icon">🖼️</i> 设置封面
                                </el-dropdown-item>
                                <el-dropdown-item divided @click="handleDelete(album)">
                                    <i class="icon">🗑️</i> 删除
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            
            <!-- 新建相册卡片 -->
            <div class="album-card add-card" @click="handleAdd">
                <div class="add-content">
                    <i class="icon add-icon">➕</i>
                    <span>新建相册</span>
                </div>
            </div>
        </div>
        
        <div class="pagination">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 48]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 模拟数据
const albums = ref([
    {
        id: 1,
        name: '旅行回忆',
        description: '2024年春季旅行的美好回忆',
        cover: 'https://via.placeholder.com/300x200/4CAF50/white?text=Travel',
        photoCount: 25,
        createTime: '2024-01-15'
    },
    {
        id: 2,
        name: '日常生活',
        description: '记录生活中的点点滴滴',
        cover: 'https://via.placeholder.com/300x200/2196F3/white?text=Life',
        photoCount: 18,
        createTime: '2024-01-10'
    },
    {
        id: 3,
        name: '工作学习',
        description: '',
        cover: null,
        photoCount: 12,
        createTime: '2024-01-05'
    }
])

const handleAdd = () => {
    ElMessage.info('新建相册功能开发中...')
}

const handleUpload = () => {
    ElMessage.info('上传图片功能开发中...')
}

const handleViewAlbum = (album: any) => {
    ElMessage.info(`查看相册: ${album.name}`)
}

const handleEdit = (album: any) => {
    ElMessage.info(`编辑相册: ${album.name}`)
}

const handleSetCover = (album: any) => {
    ElMessage.info(`设置封面: ${album.name}`)
}

const handleDelete = async (album: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除相册 "${album.name}" 吗？此操作将同时删除相册内的所有图片。`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        ElMessage.success('删除成功')
    } catch {
        ElMessage.info('已取消删除')
    }
}

onMounted(() => {
    total.value = albums.value.length
})
</script>

<style scoped>
.albums-manage {
    padding: 0;
}

.page-header {
    margin-bottom: 24px;
}

.page-header h2 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
}

.page-header p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.albums-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.album-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.album-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.album-cover {
    height: 180px;
    position: relative;
    overflow: hidden;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #999;
}

.no-cover .icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.album-info {
    padding: 16px;
}

.album-name {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.album-desc {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.album-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
}

.album-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
}

.add-card {
    border: 2px dashed #ddd;
    background-color: #fafafa;
}

.add-card:hover {
    border-color: #1976d2;
    background-color: #f0f8ff;
}

.add-content {
    height: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
}

.add-icon {
    font-size: 48px;
    margin-bottom: 12px;
    color: #1976d2;
}

.pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
    margin-right: 4px;
}

@media (max-width: 768px) {
    .albums-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
    }
    
    .toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
}
</style>