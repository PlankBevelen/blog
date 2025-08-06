<template>
    <div class="friends-manage">
        <div class="page-header">
            <h2>友联管理</h2>
            <p>管理您的友情链接</p>
        </div>
        
        <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
                <i class="icon">➕</i>
                添加友联
            </el-button>
            <div class="toolbar-right">
                <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px; margin-right: 12px;">
                    <el-option label="全部" value="" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="待审核" value="pending" />
                    <el-option label="已拒绝" value="rejected" />
                </el-select>
                <el-input 
                    v-model="searchText" 
                    placeholder="搜索网站名称或链接..." 
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
            <el-table :data="filteredFriends" style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column label="网站信息" min-width="300">
                    <template #default="{ row }">
                        <div class="site-info">
                            <div class="site-avatar">
                                <img v-if="row.avatar" :src="row.avatar" :alt="row.name" />
                                <div v-else class="default-avatar">{{ row.name.charAt(0) }}</div>
                            </div>
                            <div class="site-details">
                                <div class="site-name">{{ row.name }}</div>
                                <div class="site-url">
                                    <a :href="row.url" target="_blank">{{ row.url }}</a>
                                </div>
                                <div class="site-desc">{{ row.description }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="联系邮箱" width="200" />
                <el-table-column prop="createTime" label="申请时间" width="180" />
                <el-table-column prop="status" label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag 
                            :type="getStatusType(row.status)"
                            :effect="row.status === 'pending' ? 'plain' : 'dark'"
                        >
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button 
                                v-if="row.status === 'pending'" 
                                size="small" 
                                type="success" 
                                @click="handleApprove(row)"
                            >
                                通过
                            </el-button>
                            <el-button 
                                v-if="row.status === 'pending'" 
                                size="small" 
                                type="warning" 
                                @click="handleReject(row)"
                            >
                                拒绝
                            </el-button>
                            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                        </div>
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
                <div class="stat-label">总友联数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ stats.approved }}</div>
                <div class="stat-label">已通过</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ stats.pending }}</div>
                <div class="stat-label">待审核</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">已拒绝</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const searchText = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟数据
const friends = ref([
    {
        id: 1,
        name: 'Vue.js 官网',
        url: 'https://vuejs.org',
        description: 'Vue.js 官方网站',
        avatar: 'https://vuejs.org/logo.svg',
        email: 'admin@vuejs.org',
        status: 'approved',
        createTime: '2024-01-15 14:30:00'
    },
    {
        id: 2,
        name: 'Element Plus',
        url: 'https://element-plus.org',
        description: 'Vue 3 组件库',
        avatar: 'https://element-plus.org/images/element-plus-logo.svg',
        email: 'contact@element-plus.org',
        status: 'approved',
        createTime: '2024-01-14 10:20:00'
    },
    {
        id: 3,
        name: '小明的博客',
        url: 'https://xiaoming.blog',
        description: '分享技术与生活',
        avatar: null,
        email: 'xiaoming@example.com',
        status: 'pending',
        createTime: '2024-01-13 16:45:00'
    },
    {
        id: 4,
        name: '无效网站',
        url: 'https://invalid-site.com',
        description: '网站已失效',
        avatar: null,
        email: 'invalid@example.com',
        status: 'rejected',
        createTime: '2024-01-12 09:15:00'
    }
])

// 筛选后的友联列表
const filteredFriends = computed(() => {
    let result = friends.value
    
    // 状态筛选
    if (statusFilter.value) {
        result = result.filter(friend => friend.status === statusFilter.value)
    }
    
    // 搜索筛选
    if (searchText.value) {
        const search = searchText.value.toLowerCase()
        result = result.filter(friend => 
            friend.name.toLowerCase().includes(search) ||
            friend.url.toLowerCase().includes(search)
        )
    }
    
    return result
})

// 统计信息
const stats = computed(() => {
    const total = friends.value.length
    const approved = friends.value.filter(f => f.status === 'approved').length
    const pending = friends.value.filter(f => f.status === 'pending').length
    const rejected = friends.value.filter(f => f.status === 'rejected').length
    
    return { total, approved, pending, rejected }
})

const getStatusType = (status: string) => {
    const types: Record<string, string> = {
        approved: 'success',
        pending: 'warning',
        rejected: 'danger'
    }
    return types[status] || 'info'
}

const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
        approved: '已通过',
        pending: '待审核',
        rejected: '已拒绝'
    }
    return texts[status] || '未知'
}

const handleAdd = () => {
    ElMessage.info('添加友联功能开发中...')
}

const handleEdit = (row: any) => {
    ElMessage.info(`编辑友联: ${row.name}`)
}

const handleApprove = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要通过 "${row.name}" 的友联申请吗？`,
            '确认通过',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success',
            }
        )
        row.status = 'approved'
        ElMessage.success('已通过友联申请')
    } catch {
        ElMessage.info('已取消操作')
    }
}

const handleReject = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要拒绝 "${row.name}" 的友联申请吗？`,
            '确认拒绝',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        row.status = 'rejected'
        ElMessage.success('已拒绝友联申请')
    } catch {
        ElMessage.info('已取消操作')
    }
}

const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除友联 "${row.name}" 吗？`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        const index = friends.value.findIndex(f => f.id === row.id)
        if (index > -1) {
            friends.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
    } catch {
        ElMessage.info('已取消删除')
    }
}

onMounted(() => {
    total.value = friends.value.length
})
</script>

<style scoped>
.friends-manage {
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

.toolbar-right {
    display: flex;
    align-items: center;
}

.content-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
}

.site-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.site-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.site-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar {
    width: 100%;
    height: 100%;
    background-color: #1976d2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
}

.site-details {
    flex: 1;
    min-width: 0;
}

.site-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.site-url {
    margin-bottom: 4px;
}

.site-url a {
    color: #1976d2;
    text-decoration: none;
    font-size: 14px;
}

.site-url a:hover {
    text-decoration: underline;
}

.site-desc {
    color: #666;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.action-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.pagination {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.stat-card {
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 8px;
}

.stat-label {
    color: #666;
    font-size: 14px;
}

.icon {
    margin-right: 4px;
}

@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .toolbar-right {
        flex-direction: column;
        gap: 12px;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .stats-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>