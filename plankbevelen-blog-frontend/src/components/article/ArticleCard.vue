<template>
  <div class="article-card card">
    <!-- 文章封面 -->
    <div class="article-cover" @click="goToDetail">
      <img v-lazy="article.cover || '/loading.gif'" :alt="article.title" class="cover-image" />
      <div class="cover-overlay">
        <div class="category-tag">{{ categoryName }}</div>
      </div>
    </div>
    
    <!-- 文章信息 -->
    <div class="article-info">
      <h3 class="article-title" @click="goToDetail">{{ article.title }}</h3>
      <p class="article-summary">{{ article.summary || '暂无摘要...' }}</p>
      
      <!-- 文章统计信息 -->
      <div class="article-stats">
        <div class="stat-item">
          <svg-icon name="view" size="14px" color="var(--text-color)" />
          <span>{{ formatNumber(article.views_count) }}</span>
        </div>
        <div class="stat-item">
          <svg-icon name="comment" size="14px" color="var(--text-color)" />
          <span>{{ formatNumber(article.comments_count) }}</span>
        </div>
        <div class="stat-item">
          <svg-icon name="score" size="14px" color="var(--text-color)" />
          <span>{{ article.average_score ? article.average_score : '0.0' }}</span>
        </div>
        <div class="stat-item">
          <svg-icon name="time" size="14px" />
          <span>{{ formatDate(article.created_at) }}</span>
        </div>
      </div>
      
      <!-- 文章标签 -->
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatNumber, formatDate } from '@/utils/format'
import type { ArticleEntity } from '@/types/article'
import { useArticleStore } from '@/stores/article'

const articleStore = useArticleStore()

interface Props {
  article: ArticleEntity
}


const categoryName = computed(() => {
  console.log('计算分类名称:', {
    categoryId: props.article.category_id,
    categories: articleStore.categories,
    categoriesLength: articleStore.categories?.length
  })
  
  if (!articleStore.categories || articleStore.categories.length === 0) {
    return '加载中...'
  }
  
  const category = articleStore.getCategoryNameById?.(props.article.category_id) 
    || articleStore.categories.find(cat => cat.id === props.article.category_id)?.name
  
  return category || '未知分类'
})

onMounted(async () => {
  if( !articleStore.categories?.length ) {
    await articleStore.initArticleStore()
  }
})

const props = defineProps<Props>()
const router = useRouter()

// 跳转到文章详情
const goToDetail = () => {
  router.push({path: '/article', query: { id: props.article.id }})
}
</script>

<style scoped>
.article-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.article-cover {
  position: relative;
  height: 300px;
  overflow: hidden;
  cursor: pointer;
  
  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover .cover-image {
    transform: scale(1.05);
  }
  
  .cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 16px;
  }
  
  .category-tag {
    background: var(--primary-color);
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
  }
}

.article-info {
  padding: 20px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 12px 0;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
  
  /* 限制标题显示行数 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-summary {
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  
  /* 限制摘要显示行数 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-color-secondary);
    font-size: 12px;
    
    .svg-icon {
      color: var(--text-color-secondary);
    }
  }
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag {
    background: var(--tag-bg);
    color: var(--tag-color);
    padding: 5px 10px;
    border-radius: 12px;
    font-size: 11px;
    border: 1px solid var(--tag-border);
    background-color: var(--primary-color);
    color: var(--text-light-color);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-cover {
    height: 160px;
  }
  
  .article-info {
    padding: 16px;
  }
  
  .article-title {
    font-size: 16px;
  }
  
  .article-stats {
    gap: 12px;
  }
}
</style>