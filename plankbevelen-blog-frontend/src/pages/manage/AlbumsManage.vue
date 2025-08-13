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
                v-for="album in paginatedAlbums" 
                :key="album.id" 
                class="album-card"
                @click="handleViewAlbum(album)"
            >
                <div class="album-cover">
                    <img 
                        v-if="album.cover" 
                        v-lazy="album.cover" 
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
                        <span class="photo-count">{{ album.photos_count }} 张照片</span>
                        <span class="create-time">{{ new Date(album.created_at).toLocaleDateString() }}</span>
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
                                <el-dropdown-item divided @click="handleDelete(album)">
                                    <i class="icon">🗑️</i> 删除
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </div>
        
        <!-- 创建相册对话框 -->
        <el-dialog v-model="showCreateDialog" title="新建相册" width="500px">
            <el-form :model="createForm" label-width="80px" :rules="createFormRules" ref="createFormRef">
                <el-form-item label="相册名称" prop="name">
                    <el-input 
                        v-model="createForm.name" 
                        placeholder="请输入相册名称"
                        maxlength="50"
                        show-word-limit
                        clearable
                    />
                </el-form-item>
                <el-form-item label="相册描述" prop="description">
                    <el-input 
                        v-model="createForm.description" 
                        type="textarea" 
                        :rows="3"
                        placeholder="请输入相册描述"
                        maxlength="200"
                        show-word-limit
                        clearable
                    />
                </el-form-item>
                <el-form-item label="相册封面">
                    <div class="cover-upload-container">
                        <div class="cover-preview" v-if="createForm.cover">
                            <img :src="createForm.cover" alt="封面预览" class="preview-image" />
                            <div class="preview-overlay">
                                <el-button size="small" type="primary" @click="handleSelectCreateCover">更换封面</el-button>
                                <el-button size="small" type="danger" @click="handleRemoveCreateCover">移除封面</el-button>
                            </div>
                        </div>
                        <div class="cover-upload" v-else @click="handleSelectCreateCover">
                            <el-icon class="upload-icon"><Plus /></el-icon>
                            <div class="upload-text">点击上传封面</div>
                            <div class="upload-tip">支持 JPG、PNG 格式，建议尺寸 16:9</div>
                        </div>
                        <input 
                            ref="createCoverInputRef" 
                            type="file" 
                            accept="image/*" 
                            style="display: none" 
                            @change="handleCreateCoverChange"
                        />
                    </div>
                </el-form-item>
                <el-form-item label="公开设置" prop="is_private">
                    <el-radio-group v-model="createForm.is_private">
                        <el-radio :label="false">公开</el-radio>
                        <el-radio :label="true">私有</el-radio>
                    </el-radio-group>
                    <div class="form-tip">
                        <span v-if="!createForm.is_private" class="tip-text">公开相册将在相册列表中展示</span>
                        <span v-else class="tip-text">私有相册仅自己可见</span>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCancelCreate">取消</el-button>
                    <el-button type="primary" :loading="isCreating" @click="handleCreateAlbum">
                        {{ isCreating ? '创建中...' : '创建' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 编辑相册对话框 -->
        <el-dialog v-model="showEditDialog" title="编辑相册" width="500px">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
                <el-form-item label="相册名称" prop="name">
                    <el-input 
                        v-model="editForm.name" 
                        placeholder="请输入相册名称"
                        maxlength="50"
                        show-word-limit
                        clearable
                    />
                </el-form-item>
                <el-form-item label="相册描述" prop="description">
                    <el-input 
                        v-model="editForm.description" 
                        type="textarea" 
                        :rows="3"
                        placeholder="请输入相册描述"
                        maxlength="200"
                        show-word-limit
                        clearable
                    />
                </el-form-item>
                <el-form-item label="相册封面">
                    <div class="cover-upload-container">
                        <div class="cover-preview" v-if="editForm.cover">
                            <img :src="editForm.cover" alt="封面预览" class="preview-image" />
                            <div class="preview-overlay">
                                <el-button size="small" type="primary" @click="handleSelectEditCover">更换封面</el-button>
                                <el-button size="small" type="danger" @click="handleRemoveEditCover">移除封面</el-button>
                            </div>
                        </div>
                        <div class="cover-upload" v-else @click="handleSelectEditCover">
                            <el-icon class="upload-icon"><Plus /></el-icon>
                            <div class="upload-text">点击上传封面</div>
                            <div class="upload-tip">支持 JPG、PNG 格式，建议尺寸 16:9</div>
                        </div>
                        <input 
                            ref="editCoverInputRef" 
                            type="file" 
                            accept="image/*" 
                            style="display: none" 
                            @change="handleEditCoverChange"
                        />
                    </div>
                </el-form-item>
                <el-form-item label="公开设置" prop="is_private">
                    <el-radio-group v-model="editForm.is_private">
                        <el-radio :label="false">公开</el-radio>
                        <el-radio :label="true">私有</el-radio>
                    </el-radio-group>
                    <div class="form-tip">
                        <span v-if="!editForm.is_private" class="tip-text">公开相册将在相册列表中展示</span>
                        <span v-else class="tip-text">私有相册仅自己可见</span>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCancelEdit">取消</el-button>
                    <el-button type="primary" :loading="isUpdating" @click="handleUpdateAlbum">
                        {{ isUpdating ? '保存中...' : '保存' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
        
        <!-- 分页 -->
        <div class="pagination" v-if="total > pageSize">
            <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                layout="prev, pager, next, jumper"
                @current-change="handlePageChange"
            />
        </div>
        
        <!-- 空状态 -->
        <div v-if="albumStore.albums.length === 0" class="empty-container">
            <el-empty description="暂无相册数据">
                <el-button type="primary" @click="handleAdd">创建第一个相册</el-button>
            </el-empty>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElUpload } from 'element-plus'
import { Plus, Upload, Search, Edit, Camera, Delete, Picture, Loading } from '@element-plus/icons-vue'
import { useAlbumStore } from '@/stores/album'
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '@/types/album'

const router = useRouter()
const albumStore = useAlbumStore()

// 响应式数据
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(12)

// 加载相册数据
const loadAlbums = async () => {
    try {
        await albumStore.fetchAllAlbums()
    } catch (error) {
        console.error('加载相册失败:', error)
        ElMessage.error('加载相册失败，请重试')
    }
}

onMounted(() => {
    loadAlbums()
})

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showUploadDialog = ref(false)

// 加载状态
const isCreating = ref(false)
const isUpdating = ref(false)
const createForm = ref<CreateAlbumRequest>({
    name: '',
    description: '',
    cover: '',
    is_private: false,
})
const createFormRef = ref()
const createFormRules = {
    name: [
        { required: true, message: '请输入相册名称', trigger: 'blur' },
        { min: 1, max: 50, message: '相册名称长度在 1 到 50 个字符', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: Function) => {
                if (value && value.trim() === '') {
                    callback(new Error('相册名称不能为空格'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    description: [
        { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
    ]
}

const editForm = ref<UpdateAlbumRequest>({
    id: 0,
    name: '',
    description: '',
    cover: '',
    is_private: false
})
const editFormRef = ref()
const editFormRules = {
    name: [
        { required: true, message: '请输入相册名称', trigger: 'blur' },
        { min: 1, max: 50, message: '相册名称长度在 1 到 50 个字符', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: Function) => {
                if (value && value.trim() === '') {
                    callback(new Error('相册名称不能为空格'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    description: [
        { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
    ]
}

// 文件上传引用
const createCoverInputRef = ref<HTMLInputElement>()
const editCoverInputRef = ref<HTMLInputElement>()

// 计算属性
const filteredAlbums = computed(() => {
    if (!searchText.value) {
        return albumStore.albums
    }
    return albumStore.albums.filter(album => 
        album.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchText.value.toLowerCase())
    )
})

const paginatedAlbums = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredAlbums.value.slice(start, end)
})

const total = computed(() => filteredAlbums.value.length)

/* // 处理添加相册
const handleAdd = () => {
    createForm.value = {
        name: '',
        description: '',
        cover: '',
        is_private: false
    }
    // 重置封面相关状态
    showCreateDialog.value = true
    isCreating.value = true
}
 */
// 封面处理相关方法
const handleSelectCreateCover = () => {
    createCoverInputRef.value?.click()
}

const handleCreateCoverChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            if (e.target?.result) {
                createForm.value.cover = e.target.result as string
            }
        }
        reader.readAsDataURL(file)
    }
}

const handleRemoveCreateCover = () => {
    createForm.value.cover = ''
    if (createCoverInputRef.value) {
        createCoverInputRef.value.value = ''
    }
}

const handleSelectEditCover = () => {
    editCoverInputRef.value?.click()
}

const handleEditCoverChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            if (e.target?.result) {
                editForm.value.cover = e.target.result as string
            }
        }
        reader.readAsDataURL(file)
    }
}

const handleRemoveEditCover = () => {
    editForm.value.cover = ''
    if (editCoverInputRef.value) {
        editCoverInputRef.value.value = ''
    }
}

const handleAdd = () => {
    // 重置创建表单
    createForm.value = {
        name: '',
        description: '',
        cover: '',
        is_private: false
    }
    // 清除验证状态
    createFormRef.value?.clearValidate()
    showCreateDialog.value = true
}

const handleCancelCreate = () => {
    showCreateDialog.value = false
    createFormRef.value?.clearValidate()
}

const handleCreateAlbum = async () => {
    try {
        // 表单验证
        const valid = await createFormRef.value?.validate()
        if (!valid) return
        
        isCreating.value = true
        
        await albumStore.createAlbum(createForm.value)
        ElMessage.success('相册创建成功')
        showCreateDialog.value = false
        
        // 重新加载相册列表
        await loadAlbums()
    } catch (error) {
        console.error('创建相册失败:', error)
        ElMessage.error('创建相册失败，请重试')
    } finally {
        isCreating.value = false
    }
}

const handleViewAlbum = (album: Album) => {
    router.push({ name: 'AlbumDetail', params: { id: album.id } })
}

const handleEdit = (album: Album) => {
    // 填充编辑表单数据
    editForm.value = {
        id: album.id,
        name: album.name,
        description: album.description || '',
        cover: album.cover || '',
        is_private: album.is_private
    }
    // 清除验证状态
    editFormRef.value?.clearValidate()
    showEditDialog.value = true
}

const handleCancelEdit = () => {
    showEditDialog.value = false
    editFormRef.value?.clearValidate()
}

const handleUpdateAlbum = async () => {
    try {
        // 表单验证
        const valid = await editFormRef.value?.validate()
        if (!valid) return
        
        isUpdating.value = true
        
        await albumStore.updateAlbum(editForm.value)
        ElMessage.success('相册更新成功')
        showEditDialog.value = false
        
        // 重新加载相册列表
        await loadAlbums()
    } catch (error) {
        console.error('更新相册失败:', error)
        ElMessage.error('更新相册失败，请重试')
    } finally {
        isUpdating.value = false
    }
}


const handleDelete = async (album: Album) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除相册 "${album.name}" 吗？此操作将同时删除相册内的所有照片，且不可恢复。`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        
        await albumStore.deleteAlbum(album.id)
        await loadAlbums()
    } catch (error) {
        if (error !== 'cancel') {
            // 错误已在store中处理
        }
    }
}

const handlePageChange = (page: number) => {
    currentPage.value = page
}

const handleFileChange = (uploadFile: any, uploadFiles: any[]) => {
    uploadForm.value.files = uploadFiles.map(file => file.raw).filter(Boolean)
}

// 监听搜索文本变化，重置页码
watch(searchText, () => {
    currentPage.value = 1
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

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
}

.loading-container .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.empty-container {
    padding: 40px 20px;
    text-align: center;
}

/* 封面上传样式 */
.cover-upload-container {
  width: 100%;
}

.cover-upload {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.cover-upload:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.cover-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.preview-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.image-uploader {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-trigger {
    width: 100%;
    height: 100%;
}

/* 封面上传组件样式 */
.cover-upload-container {
    width: 100%;
}

.cover-preview {
    position: relative;
    width: 200px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
}

.cover-preview .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
}

.cover-preview:hover .preview-overlay {
    opacity: 1;
}

.cover-upload {
    width: 200px;
    height: 120px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s;
    background-color: #fafafa;
}

.cover-upload:hover {
    border-color: #409eff;
}

.upload-icon {
    font-size: 24px;
    color: #8c939d;
    margin-bottom: 8px;
}

.upload-text {
    font-size: 14px;
    color: #606266;
    margin-bottom: 4px;
}

.upload-tip {
    font-size: 12px;
    color: #909399;
    text-align: center;
    line-height: 1.4;
}

/* 表单提示样式 */
.form-tip {
    margin-top: 8px;
}

.tip-text {
    font-size: 12px;
    color: #909399;
}

/* 对话框底部样式 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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