<template>
    <TopBanner :title="albumStore.albumDetail.name" :imagePath="albumStore.albumDetail.cover" height="35vh">
        <div class="album-detail-header">
            <div class="album-detail-description">
                {{ albumStore.albumDetail.description }}
            </div>
            <span class="created-at">
                <svg-icon name="calendar" size="16px" color="var(--text-light-color)"/>
                {{ formatDatetime(albumStore.albumDetail.created_at || '') }}
            </span>
            <span class="views-count">
                <svg-icon name="view" size="16px" color="var(--text-light-color)"/>
                {{ albumStore.albumDetail.views_count }}
            </span>
            <span class="photos-count">

                <svg-icon name="album" size="16px" color="var(--text-light-color)"/>
                {{ photoStore.photos.length || albumStore.albumDetail.photos_count }}
            </span>
            <span class="featured" v-if="albumStore.albumDetail.is_featured">
                精选
            </span>
            <span class="private" v-if="albumStore.albumDetail.is_private">
                私有
            </span>
        </div>
    </TopBanner>

    <div class="album-detail">
        <div class="container">
            <!-- 工具栏 -->
            <div class="album-detail-toolbar card" v-if="isOwnSelf">
                <div class="toolbar-left">
                    <el-button type="primary" @click="showUploadDialog = true" v-if="!selectionMode">
                        <svg-icon name="upload" size="16px" />
                        上传照片
                    </el-button>
                    
                    <!-- 选择模式下的操作按钮 -->
                    <template v-if="selectionMode">
                        <el-button @click="handleSelectAll">
                            <svg-icon name="check" size="16px" />
                            全选
                        </el-button>
                        <el-button @click="handleClearSelection" v-if="selectedPhotos.length > 0">
                            <svg-icon name="close" size="16px" />
                            清空选择
                        </el-button>
                        <el-button 
                            v-if="selectedPhotos.length > 0" 
                            type="danger" 
                            @click="handleBatchDelete"
                        >
                            <svg-icon name="delete" size="16px" />
                            删除选中 ({{ selectedPhotos.length }})
                        </el-button>
                    </template>
                </div>
                <div class="toolbar-right">
                    <el-switch
                        v-model="selectionMode"
                        active-text="选择模式"
                        inactive-text="浏览模式"
                    />
                </div>
            </div>

            <!-- 照片网格 -->
            <div class="album-detail-content ">
                <div v-if="photoStore.loading && photoStore.photos.length === 0" class="loading-state">
                    <el-skeleton v-for="n in 12" :key="n" animated>
                        <template #template>
                            <el-skeleton-item variant="image" style="width: 100%; height: 200px; border-radius: 8px;" />
                        </template>
                    </el-skeleton>
                </div>
                
                <div class="photo-grid-container">
                    <VirtualPhotoGrid 
                        ref="photoGridRef"
                        :albumId="albumId" 
                        :selectionMode="selectionMode"
                        @selection-change="handleSelectionChange"
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传照片" width="600px" :before-close="handleUploadDialogClose">
        <div class="upload-dialog">
            <el-upload
                ref="uploadRef"
                class="upload-area"
                drag
                multiple
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="false"
                accept="image/*"
            >
                <svg-icon name="upload" size="48px" color="var(--primary-color)" />
                <div class="upload-text">
                    <p>将图片拖拽到此处，或<em>点击上传</em></p>
                    <p class="upload-tip">支持 JPG、PNG、GIF 格式，单张图片不超过 10MB</p>
                </div>
            </el-upload>
            
            <div v-if="uploadImageList.length > 0" class="upload-preview">
                <h4>预览 ({{ uploadImageList.length }} 张)</h4>
                <div class="preview-grid">
                    <div v-for="(image, index) in uploadImageList" :key="index" class="preview-item">
                        <img v-lazy="image" :alt="`照片${index + 1}`" />
                        <div class="preview-overlay">
                            <el-button size="small" type="danger" @click="removeUploadFile(index)">
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleUploadDialogClose">取消</el-button>
                <el-button 
                    type="primary" 
                    @click="handleUploadSubmit" 
                    :loading="uploading"
                    :disabled="uploadImageList.length === 0"
                >
                    上传 {{ uploadImageList.length }} 张照片
                </el-button>
            </div>
        </template>
    </el-dialog>


</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue'
import VirtualPhotoGrid from '@/components/VirtualPhotoGrid.vue'
import { useAlbumStore } from '@/stores/album'
import { usePhotoStore } from '@/stores/photo'
import { onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { formatDatetime } from '@/utils/format'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Photo } from '@/types/photo'

const albumStore = useAlbumStore()
const photoStore = usePhotoStore()
const userStore = useUserStore()

const route = useRoute()
const albumId = Number(route.params.id)

// 响应式数据
const showUploadDialog = ref(false)
const uploading = ref(false)
const uploadImageList = ref<string[]>([])
const uploadRef = ref()
const photoGridRef = ref()
const selectionMode = ref(false)
const selectedPhotos = ref<number[]>([])

// 计算属性
const isOwnSelf = computed(() => {
    return albumStore.albumDetail.user_id === userStore.userInfo?.id
})

// 监听选择模式变化
watch(selectionMode, (newValue) => {
    if (!newValue) {
        // 退出选择模式时清空选择
        selectedPhotos.value = []
        photoGridRef.value?.clearSelection()
    }
})

// 生命周期
onMounted(async () => {
    await albumStore.fetchAlbumDetail(albumId)
})

// 方法
const loadPhotos = async () => {
    await photoStore.fetchPhotosByAlbum(albumId)
}

// 处理选择变化
const handleSelectionChange = (selectedIds: number[]) => {
    selectedPhotos.value = selectedIds
}

// 全选
const handleSelectAll = () => {
    photoGridRef.value?.selectAll()
}

// 清空选择
const handleClearSelection = () => {
    photoGridRef.value?.clearSelection()
}

// 批量删除
const handleBatchDelete = async () => {
    if (selectedPhotos.value.length === 0) return
    
    try {
        await ElMessageBox.confirm(
            `确定要删除选中的 ${selectedPhotos.value.length} 张照片吗？`,
            '确认批量删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        
        await photoStore.deletePhotos(selectedPhotos.value)
        
        // 清空选择并退出选择模式
        selectedPhotos.value = []
        photoGridRef.value?.clearSelection()
        selectionMode.value = false
        
        ElMessage.success('照片删除成功')
        
        // 重新加载相册详情以更新照片数量
        await albumStore.fetchAlbumDetail(albumId)
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

// 文件上传处理
const handleFileChange = (file: any) => {
    const render = new FileReader()
    render.onload = (e) => {
        if(e.target?.result) {
            uploadImageList.value.push(e.target.result as string)
        }
    }
    render.readAsDataURL(file.raw)

}

const removeUploadFile = (index: number) => {
    uploadImageList.value.splice(index, 1)
}

const handleUploadDialogClose = () => {
    if (uploading.value) {
        ElMessage.warning('正在上传中，请稍候...')
        return
    }
    showUploadDialog.value = false
    uploadImageList.value = []
    uploadRef.value?.clearFiles()
}

const handleUploadSubmit = async () => {
    if (uploadImageList.value.length === 0) return
    
    uploading.value = true
    
    try {        
        // 传递正确的参数格式：albumId和photos数组
        await photoStore.uploadPhotos(albumId, uploadImageList.value)
        
        ElMessage.success(`成功上传 ${uploadImageList.value.length} 张照片`)
        handleUploadDialogClose()
        
        // 重新加载照片列表
        await loadPhotos()
    } catch (error) {
        ElMessage.error('上传失败')
    } finally {
        uploading.value = false
    }
}

</script>

<style lang="less" scoped src="@/assets/styles/pages/album-detail.less" />