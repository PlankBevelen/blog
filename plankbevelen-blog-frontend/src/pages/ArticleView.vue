<template>
    <TopBanner :title="title" :imagePath="image" height="35vh"/>
    <div class="article">
        <div class="container">
            <!-- 左侧文章列表 -->
            <div class="left-side">
                <div class="article-list">
                    <div class="article-list__header">
                        <h2>文章列表</h2>
                        <div class="category-title">
                            <span>{{ selectedCategory }}</span>
                        </div>
                    </div>
                    
                    <div class="article-list__content">
                        <div v-if="loading" class="loading">
                            <el-skeleton v-for="i in 3" :key="i" :rows="4" animated class="skeleton-item" />
                        </div>
                        
                        <div v-else-if="filteredArticles.length === 0" class="empty-state">
                            <svg-icon name="empty" size="64px" />
                            <p>暂无文章</p>
                        </div>
                        
                        <div v-else class="articles-container">
                            <ArticleCard 
                                v-for="article in paginatedArticles" 
                                :key="article.id" 
                                :article="article" 

                            />
                            
                            <!-- 分页 -->
                            <div v-if="totalCount > pageSize" class="pagination">
                                <el-pagination
                                    v-model:current-page="currentPage"
                                    :page-size="pageSize"
                                    :total="totalCount"
                                    layout="total, prev, pager, next, jumper"
                                    @current-change="handlePageChange"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 右侧边栏 -->
            <div class="right-side">
                <!-- 分类 -->
                <div class="category card">
                    <div class="category__header">
                        <svg-icon name="category" size="18px" color="var(--text-color)"/>
                        <span>文章分类</span>
                    </div>
                    <div class="category__content">
                        <div 
                            v-for="category in categories" 
                            :key="category.id"
                            :class="['category__item', { active: selectedCategory === category.id }]"
                            @click="selectedCategory = category.id"
                        >
                            <span class="name">{{ category.name }}</span>
                            <span class="count">({{ category.article_count }})</span>
                        </div>
                    </div>
                </div>

                <!-- 热门文章 -->
                <div class="popular-articles card">
                    <div class="popular-articles__header">
                        <svg-icon name="fire" size="18px" />
                        <span>热门文章</span>
                    </div>
                    <div class="popular-articles__content">
                        <div 
                            v-for="(article, index) in popularArticles" 
                            :key="article.id"
                            class="popular-item"
                            @click="goToArticle(article.id)"
                        >
                            <span class="rank">{{ index + 1 }}</span>
                            <div class="info">
                                <h4 class="title">{{ article.title }}</h4>
                                <span class="views">{{ formatNumber(article.views) }} 次阅读</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 最新文章 -->
                <div class="recent-articles card">
                    <div class="recent-articles__header">
                        <svg-icon name="time" size="18px" />
                        <span>最新文章</span>
                    </div>
                    <div class="recent-articles__content">
                        <div 
                            v-for="article in recentArticles" 
                            :key="article.id"
                            class="recent-item"
                            @click="goToArticle(article.id)"
                        >
                            <h4 class="title">{{ article.title }}</h4>
                            <div class="meta">
                                <span class="category">{{ article.category }}</span>
                                <span class="date">{{ formatDate(article.create_at) }}</span>
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
import ArticleCard from '@/components/article/ArticleCard.vue'
import imagePath from '@/assets/images/article.jpg'
import type { ArticleEntity, ArticleCategory } from '@/types/article'
import { useArticleStore } from '@/stores/article'

const articleStore = useArticleStore()

const router = useRouter()
const title = ref('文章')
const image = ref(imagePath)

// 数据状态
const loading = ref(false)
const categories = ref<ArticleCategory[]>([])
const popularArticles = ref<{ id: number; title: string; views: number }[]>([])
const recentArticles = ref<{ id: number; title: string; category: string; create_at: string }[]>([])

// 筛选和分页
const activeTab = ref('all')
const selectedCategory = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted( async () => {
  // 获取已发布的文章
  loading.value = true
  await articleStore.fetchPublishedArticles()
  loading.value = false
})

// 计算属性
const filteredArticles = computed(() => {
  let filtered = [...articleStore.published_articles]
  
  // 按分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(article => article.category_id === selectedCategory.value)
  }
  
  // 按标签筛选
  switch (activeTab.value) {
    case 'latest':
      filtered.sort((a , b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'popular':
      filtered.sort((a, b) => b.views_count - a.views_count)
      break
    case 'top':
      filtered = filtered.filter(article => article.is_top)
      break
    default:
      break
  }
  
  return filtered
})

const totalCount = computed(() => filteredArticles.value.length)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end)
})

// 方法
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
    month: 'short',
    day: 'numeric'
  })
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

// 模拟数据
const initMockData = () => {
  // 模拟文章数据
  
  // 模拟分类数据
  /* categories.value = [
    { id: 0, name: '全部', article_count: 5, create_at: '2024-01-01T00:00:00Z' },
    { id: 1, name: 'Vue.js', article_count: 1, create_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'TypeScript', article_count: 1, create_at: '2024-01-01T00:00:00Z' },
    { id: 3, name: '构建工具', article_count: 1, create_at: '2024-01-01T00:00:00Z' },
    { id: 4, name: 'CSS', article_count: 1, create_at: '2024-01-01T00:00:00Z' },
    { id: 5, name: 'Node.js', article_count: 1, create_at: '2024-01-01T00:00:00Z' }
  ]
  
  // 模拟热门文章
  popularArticles.value = [
    { id: 1, title: 'Vue 3 Composition API 深度解析', views: 1250 },
    { id: 5, title: 'Node.js 性能优化最佳实践', views: 892 },
    { id: 2, title: 'TypeScript 进阶技巧与实战', views: 980 }
  ]
  
  // 模拟最新文章
  recentArticles.value = [
    { id: 1, title: 'Vue 3 Composition API 深度解析', category: 'Vue.js', create_at: '2024-01-15T10:30:00Z' },
    { id: 2, title: 'TypeScript 进阶技巧与实战', category: 'TypeScript', create_at: '2024-01-12T14:20:00Z' },
    { id: 3, title: 'Vite 构建工具完全指南', category: '构建工具', create_at: '2024-01-10T09:15:00Z' }
  ] */
}

onMounted(() => {
  initMockData()
})
</script>

<style scoped lang="less" src="@/assets/styles/pages/article.less"></style>
