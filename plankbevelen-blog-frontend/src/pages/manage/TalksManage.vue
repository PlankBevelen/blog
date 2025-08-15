<template>
    <div class="talks-manage">
        <div class="page-header">
            <h2>说说管理</h2>
            <p>管理您的所有说说内容</p>
        </div>
        
        <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
                <i class="icon">➕</i>
                新增说说
            </el-button>
            <el-input 
                v-model="searchText" 
                placeholder="搜索说说内容..." 
                style="width: 300px;"
                clearable
            >
                <template #prefix>
                    <i class="icon">🔍</i>
                </template>
            </el-input>
        </div>
        
        <div class="content-card">
            <el-table :data="filteredTalks" style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="content" label="内容" min-width="200">
                    <template #default="{ row }">
                        <div class="talk-content">{{ row.content }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="images" label="图片" width="100">
                    <template #default="{ row }">
                        <span v-if="row.images && row.images.length > 0">
                            {{ row.images.length }} 张
                        </span>
                        <span v-else class="text-muted">无</span>
                    </template>
                </el-table-column>
                <el-table-column prop="create_at" label="发布时间" width="180" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
                            {{ row.status === 'published' ? '已发布' : '草稿' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            <div class="pagination">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                />
            </div>
        </div>
    </div>
    
    <!-- 新增/编辑说说对话框 -->
    <el-dialog 
        v-model="dialogVisible" 
        :title="isEdit ? '编辑说说' : '新增说说'"
        width="600px"
        @close="resetForm"
    >
        <el-form 
            ref="talkFormRef" 
            :model="talkForm" 
            :rules="talkRules" 
            label-width="80px"
        >
            <el-form-item label="内容" prop="content">
                <el-input 
                    v-model="talkForm.content" 
                    type="textarea" 
                    :autosize="{ minRows: 3, maxRows: 6 }" 
                    placeholder="分享你的想法..."
                    maxlength="500"
                    show-word-limit
                />
            </el-form-item>
            
            <el-form-item label="图片">
                <div class="uploaded-images" v-if="talkForm.images.length > 0">
                    <div 
                        v-for="(image, index) in talkForm.images" 
                        :key="index" 
                        class="image-item"
                    >
                        <img :src="image" :alt="`图片${index + 1}`" />
                        <div class="image-overlay">
                            <el-button 
                                size="small" 
                                type="danger" 
                                circle 
                                @click="removeImage(index)"
                            >
                                ✕
                            </el-button>
                        </div>
                    </div>
                </div>
                
                <el-upload
                    class="image-uploader"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleImageChange"
                    :show-file-list="false"
                    accept="image/*"
                    multiple
                >
                    <div class="upload-trigger">
                        <i class="icon">📷</i>
                        <span>添加图片</span>
                    </div>
                </el-upload>
                
                <div class="upload-tip">
                    支持 JPG、PNG 格式，最多上传 9 张图片
                </div>
            </el-form-item>
            
            <el-form-item label="状态">
                <el-radio-group v-model="talkForm.status">
                    <el-radio value="published">立即发布</el-radio>
                    <el-radio value="draft">保存为草稿</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">
                    {{ isEdit ? '更新' : '发布' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useTalkStore } from '@/stores/talk'
import type { TalkEntity, TalkCreateRequest } from '@/types/talk'

const userStore = useUserStore()
const talkStore = useTalkStore()
const loading = ref(false)
const submitting = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// 表单相关
const talkFormRef = ref<FormInstance>()
const talkForm = ref<TalkCreateRequest>({
    content: '',
    images: [] as string[],
    status: 'published'
})

const talkRules: FormRules = {
    content: [
        { required: true, message: '请输入说说内容', trigger: 'blur' },
        { min: 1, max: 500, message: '内容长度在 1 到 500 个字符', trigger: 'blur' }
    ]
}

// 模拟数据
const talks = ref<TalkEntity[]>([])

// 筛选后的说说列表
const filteredTalks = computed(() => {
    if (!searchText.value) {
        return talks.value
    }
    return talks.value.filter(talk => 
        talk.content.toLowerCase().includes(searchText.value.toLowerCase())
    )
})

// 处理图片上传
const handleImageChange = (file: any) => {
    if (talkForm.value.images.length >= 9) {
        ElMessage.warning('最多只能上传9张图片')
        return
    }
    
    // 这里应该是真实的图片上传逻辑，现在用模拟数据
    const reader = new FileReader()
    reader.onload = (e) => {
        if (e.target?.result) {
            talkForm.value.images.push(e.target.result as string)
        }
    }
    reader.readAsDataURL(file.raw)
}

// 移除图片
const removeImage = (index: number) => {
    talkForm.value.images.splice(index, 1)
}

// 重置表单
const resetForm = () => {
    talkForm.value = {
        content: '',
        images: [],
        status: 'published'
    }
    isEdit.value = false
    editingId.value = null
    talkFormRef.value?.resetFields()
}

// 新增说说
const handleAdd = () => {
    resetForm()
    dialogVisible.value = true
}

// 编辑说说
const handleEdit = (row: any) => {
    isEdit.value = true
    editingId.value = row.id
    talkForm.value = {
        content: row.content,
        images: [...row.images],
        status: row.status
    }
    dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
    if (!talkFormRef.value) return
    
    try {
        await talkFormRef.value.validate()
        submitting.value = true
        if( isEdit.value ) {
            // 更新
            const success = await talkStore.updateTalk(editingId.value as number, talkForm.value as TalkCreateRequest)
            if(success) {
                ElMessage.success('说说更新成功')
                // 重新获取数据
                await fetchTalks()
                resetForm()
                dialogVisible.value = false
            } else {
                ElMessage.error('更新失败')
            }
        } else {
            // 发布
            const success = await talkStore.createTalk(talkForm.value as TalkCreateRequest)

            if(success) {
                ElMessage.success('说说发布成功')
                // 重新获取数据
                await fetchTalks()
                resetForm()
                dialogVisible.value = false
            } else {
                ElMessage.error('发布失败')
            }
        }
    } catch (error) {
        console.error('表单验证失败:', error)
    } finally {
        submitting.value = false
    }
}

// 删除说说
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除这条说说吗？`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )

        // 调用删除接口
        const success = await talkStore.deleteTalk(row.id as number)
        if(success) {
            // 从本地数据中删除
            const index = talks.value.findIndex(talk => talk.id === row.id)
            if (index > -1) {
                talks.value.splice(index, 1)
                total.value = talks.value.length
            }
            ElMessage.success('删除成功')
        } else {
            ElMessage.error('删除失败')
        }
    } catch {
        ElMessage.info('已取消删除')
    }
}

// 获取所有说说
async function fetchTalks() {
    try {
        loading.value = true
        const data = await talkStore.fetchAllTalks()
        talks.value = data
        total.value = data.length
    } catch (error) {
        console.error('获取说说失败:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchTalks()
})
</script>

<style scoped>
.talks-manage {
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

.content-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.talk-content {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.text-muted {
    color: #999;
}

.pagination {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.icon {
    margin-right: 4px;
}

.image-upload-item {
    display: flex;
    flex-direction: column;
}

/* 对话框样式 */
.uploaded-images {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
}

.upload-tip {
    display: block;
    width: 100%;
    margin-top: 0;
    font-size: 12px;
    color: #999;
    text-align: left;
}

.image-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 6px;
    overflow: hidden;
}

.image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-item:hover .image-overlay {
    opacity: 1;
}

.image-uploader {
    display: block;
    width: fit-content;
}

.upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.3s;
    color: #666;
}

.upload-trigger:hover {
    border-color: #409eff;
    color: #409eff;
}

.upload-trigger .icon {
    font-size: 24px;
    margin-bottom: 4px;
    margin-right: 0;
}

.dialog-footer {
    text-align: right;
}

@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .uploaded-images {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
    
    .image-item,
    .upload-trigger {
        width: 80px;
        height: 80px;
    }
}
</style>