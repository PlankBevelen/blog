<template>
  <div class="articles-manage">
    <div class="page-header">
      <h2>文章管理</h2>
      <p>管理您的所有文章内容</p>
    </div>
    
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <i class="icon">✏️</i>
        新增文章
      </el-button>
      <div class="toolbar-right">
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px; margin-right: 12px;">
          <el-option label="全部" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 140px; margin-right: 12px;">
          <el-option label="全部分类" value="" />
          <el-option 
            v-for="category in articleStore.categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.id" 
          />
        </el-select>
        <el-input 
          v-model="searchText" 
          placeholder="搜索文章标题..." 
          style="width: 300px;"
          clearable
        >
          <template #prefix>
            <i class="icon">🔍</i>
          </template>
        </el-input>
      </div>
    </div>
    
    <div class="content-card">
      <el-table :data="filteredArticles" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="文章信息" min-width="300">
          <template #default="{ row }">
            <div class="article-info">
              <div class="article-cover">
                <img v-if="row.cover" v-lazy="row.cover" :alt="row.title" />
                <div v-else class="default-cover">📄</div>
              </div>
              <div class="article-details">
                <div class="article-title">{{ row.title }}</div>
                <div class="article-summary">{{ row.summary || '暂无摘要' }}</div>
                <div class="article-tags">
                  <el-tag 
                    v-for="tag in row.tags" 
                    :key="tag" 
                    size="small" 
                    style="margin-right: 4px;"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ getCategoryName(row.category_id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="150">
          <template #default="{ row }">
            <div class="article-stats">
              <div class="stat-item">
                <i class="icon">👁️</i>
                <span>{{ row.views_count }}</span>
              </div>
              <div class="stat-item">
                <i class="icon">💬</i>
                <span>{{ row.comments_count }}</span>
              </div>
              <div class="stat-item">
                <i class="icon">⭐</i>
                <span>{{ row.average_score }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)"
              :effect="row.status === 'draft' ? 'plain' : 'dark'"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_top" label="置顶" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.is_top" 
              @change="handleToggleTop(row)"
              :disabled="loading"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">预览</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
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
    
    <!-- 统计信息 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">总文章数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.published }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.draft }}</div>
        <div class="stat-label">草稿</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalViews }}</div>
        <div class="stat-label">总浏览量</div>
      </div>
    </div>
    
    <!-- 文章编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="editMode === 'add' ? '新增文章' : '编辑文章'"
      width="80%"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="formRef" 
        :model="articleForm" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章分类" prop="category_id">
              <el-select v-model="articleForm.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option 
                  v-for="category in articleStore.categories" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文章摘要" prop="summary">
          <el-input 
            v-model="articleForm.summary" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入文章摘要"
          />
        </el-form-item>
        
        <el-form-item label="封面图片" prop="cover">
          <img class="preview-image" :src="articleForm.cover" alt="封面图片" v-if="articleForm.cover" />
          <el-upload 
            class="image-uploader"
            action="#"
            accept="image/*"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
          >
            <div class="upload-trigger">
                <i class="icon">📷</i>
                <span>添加图片</span>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="文章标签">
          <el-input-tag v-model="articleForm.tags" aria-placeholder="请输入标签" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布状态">
              <el-select v-model="articleForm.status" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否置顶">
              <el-switch v-model="articleForm.is_top" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文章内容" prop="content">
          <MdEditor v-model="articleForm.content" />
        </el-form-item>
      </el-form>  
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ArticleEntity, ArticleCategory, ArticleCreateRequest } from '@/types/article'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useArticleStore } from '@/stores/article'
import articleService from '@/services/article.service'

const articleStore = useArticleStore()

onMounted(async () => {
  await articleStore.initArticleStore()
  await articleStore.fetchAllArticles()
  total.value = articleStore.all_articles.length
})

// 表单辅助数据
const loading = ref(false)
const saving = ref(false)
const searchText = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 对话框
const dialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')
// 文章表单
const articleForm = ref<Partial<ArticleCreateRequest>>({
  title: '',
  summary: '',
  cover: '',
  category_id: undefined,
  status: 'draft',
  is_top: false,
  tags: [],
  content: ''
})
const formRef = ref()
// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入文章摘要', trigger: 'blur' }],
  cover: [{ required: true, message: '请上传封面图片', trigger: 'change' }]
}

// 处理图片上传
const handleImageChange = (file: any) => {
  const render = new FileReader()
  render.onload = (e) => {
    if(e.target?.result) {
      articleForm.value.cover = e.target.result as string
    }
  }
  render.readAsDataURL(file.raw)
}

// 过滤后的文章列表
const filteredArticles = computed(() => {
  let filtered = articleStore.all_articles || []
  
  if (searchText.value) {
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(article => article.status === statusFilter.value)
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(article => article.category_id === Number(categoryFilter.value))
  }
  
  return filtered
})

// 统计数据
const stats = computed(() => {
  const total = articleStore.all_articles.length
  const published = articleStore.all_articles.filter(a => a.status === 'published').length
  const draft = articleStore.all_articles.filter(a => a.status === 'draft').length
  const totalViews = articleStore.all_articles.reduce((sum, a) => sum + a.views_count, 0)
  
  return { total, published, draft, totalViews }
})

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = articleStore.getCategoryById(categoryId)
  return category?.name || '未知分类'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status] || status
}

// 处理新增
const handleAdd = () => {
  editMode.value = 'add'
  articleForm.value = {
    title: '',
    summary: '',
    cover: '',
    category_id: undefined,
    status: 'draft',
    is_top: false,
    tags: [],
    content: ''
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (article: ArticleEntity) => {
  editMode.value = 'edit'
  articleForm.value = { ...article }
  dialogVisible.value = true
}

// 处理预览
const handleView = (article: ArticleEntity) => {
  ElMessage.info(`预览文章: ${article.title}`)
}

// 处理删除
const handleDelete = async (article: ArticleEntity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章 "${article.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const res = await articleStore.deleteArticle(article.id)
    if(res) {
      const index = articleStore.all_articles.findIndex(a => a.id === article.id)
      if (index > -1) {
        articleStore.all_articles.splice(index, 1)
        ElMessage.success('删除成功')
        total.value = articleStore.all_articles.length
      }
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    console.log(error)
    ElMessage.info('已取消删除')
  }
}

// 处理置顶切换
const handleToggleTop = (article: ArticleEntity) => {
  ElMessage.success(`${article.is_top ? '已设置置顶' : '已取消置顶'}`)
  console.log(article)
  const is_top = article.is_top
  const id = article.id
  articleService.toggleTop(id, is_top)
}

// 发布文章
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    if (editMode.value === 'add') {
      const res = await articleStore.publishArticle(articleForm.value as ArticleCreateRequest) 
      if (res) {
        ElMessage.success('文章发布成功')
        console.log(res)
        const newArticle: ArticleCreateRequest = {
          ...articleForm.value as ArticleCreateRequest,
          id: res as number,
          views_count: 0,
          comments_count: 0,
          average_score: 0,
          created_at: new Date().toLocaleString()
        }
        articleStore.all_articles.unshift(newArticle)
        dialogVisible.value = false
      }else {
        ElMessage.error("文章发布失败")
      }
    } else {
      console.log(articleForm.value)
      const res : Boolean = await articleStore.updateArticle(articleForm.value as ArticleCreateRequest) 
      if (res) {
        ElMessage.success('文章更新成功')
        dialogVisible.value = false
        const index = articleStore.all_articles.findIndex(a => a.id === articleForm.value.id)
        if (index > -1) {
          articleStore.all_articles[index] = articleForm.value as ArticleCreateRequest
        }
      }else {
        ElMessage.error("文章更新失败")
      }
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 处理对话框关闭
const handleDialogClose = (done: () => void) => {
  if (saving.value) {
    ElMessage.warning('正在保存中，请稍候...')
    return
  }
  done()
}

</script>

<style scoped lang="less">
.articles-manage {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
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
  
  &-right {
    display: flex;
    align-items: center;
  }
}

.content-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.article {
  &-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  &-cover {
    width: 60px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &-details {
    flex: 1;
    min-width: 0;
  }
  
  &-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &-summary {
    color: #666;
    font-size: 12px;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  &-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  
  .icon {
    font-size: 14px;
  }
}

.pagination {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;

  .stat-card {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
}

.image-uploader {
  display: block;
  width: 120px;
  height: 120px;
  border: 1px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  .upload-trigger {
    .icon {
      margin-right: 4px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    
    &-right {
      flex-direction: column;
      gap: 8px;
    }
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>