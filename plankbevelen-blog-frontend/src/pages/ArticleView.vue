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
                            <span>{{ selectedCategoryName }}</span>
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
                                @click="goToArticle(article.id)"
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
                        <!-- 添加全部分类选项 -->
                        <div 
                            :class="['category__item', { active: selectedCategory === null }]"
                            @click="selectedCategory = null"
                        >
                            <span class="name">全部</span>
                            <span class="count">({{ articleStore.getPublishedArticlesTotal }})</span>
                        </div>
                        <div 
                            v-for="category in articleStore.categories" 
                            :key="category.id"
                            :class="['category__item', { active: selectedCategory === category.id }]"
                            @click="selectedCategory = category.id"
                        >
                            <span class="name">{{ category.name }}</span>
                            <span class="count">({{ getCategoryArticleCount(category.id) }})</span>
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
                            <div class="popular-item__rank">      
                                <span class="rank">{{ index + 1 }}</span>
                            </div>
                            <div class="popular-item__image">
                                <img v-lazy="article.cover" :alt="article.title" />
                            </div>
                            <div class="popular-item__content">
                                <h4 class="title">{{ article.title }}</h4>
                                <div class="meta">
                                    <span class="views">{{ formatNumber(article.views_count) }} 次阅读</span>
                                    <span class="date">{{ formatDate(article.created_at) }}</span>
                                </div>
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
                            <div class="recent-item__image">
                                <img v-lazy="article.cover" :alt="article.title" />
                            </div>
                            <div class="recent-item__content">
                                <h4 class="title">{{ article.title }}</h4>
                                <div class="meta">
                                    <span class="category">{{ articleStore.getCategoryNameById(article.category_id) }}</span>
                                    <span class="date">{{ formatDate(article.created_at) }}</span>
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
import ArticleCard from '@/components/article/ArticleCard.vue'
import imagePath from '@/assets/images/article.jpg'
import type { ArticleEntity, ArticleCategory } from '@/types/article'
import { useArticleStore } from '@/stores/article'
import { formatNumber, formatDate } from '@/utils/format'

const articleStore = useArticleStore()
const router = useRouter()

const title = ref('文章')
const image = ref(imagePath)

// 数据状态
const loading = ref(false)

// 筛选和分页
const activeTab = ref('all')
const selectedCategory = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
  loading.value = true
  try {
    // 初始化分类数据
    await articleStore.initArticleStore()
    // 获取已发布的文章
    await articleStore.fetchPublishedArticles()
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
})

// 计算属性
const filteredArticles = computed(() => {
  let filtered = [...articleStore.published_articles]
  
  // 按分类筛选
  if (selectedCategory.value !== null) {
    filtered = filtered.filter(article => article.category_id === selectedCategory.value)
  }
  
  // 按标签筛选
  switch (activeTab.value) {
    case 'latest':
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

// 直接使用 store 的 getters
const popularArticles = computed(() => articleStore.getPopularArticles)
const recentArticles = computed(() => articleStore.getRecentArticles)

// 获取当前选中分类的名称
const selectedCategoryName = computed(() => {
  if (selectedCategory.value === null) {
    return '全部'
  }
  return articleStore.getCategoryNameById(selectedCategory.value) || '未知分类'
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToArticle = (id: number) => {
  router.push({ name: 'ArticleDetail', query: { id } })
}

// 获取特定分类的文章数量
const getCategoryArticleCount = (categoryId: number): number => {
  return articleStore.published_articles.filter(article => article.category_id === categoryId).length
}
</script>

<style scoped lang="less" src="@/assets/styles/pages/article.less"></style>