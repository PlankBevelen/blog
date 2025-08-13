<template>
  <div class="article-rating">
    <div class="rating-header">
      <h4>
        <svg-icon name="score" size="16px" color="var(--text-color)"/>
        文章评分
      </h4>
      <span class="average-score" v-if="averageScore > 0">
        平均分: {{ averageScore }}
      </span>
    </div>
    
    <div class="rating-content">
      <div v-if="!userStore.isLoggedIn" class="login-prompt">
        <p>请先登录后再进行评分</p>
      </div>
      
      <div v-else class="rating-section">
        <div class="user-rating">
          <span class="rating-label">您的评分:</span>
          <el-rate
            v-model="userRating"
            :disabled="isRated"
            :colors="colors"
            :show-text="true"
            :texts="texts"
            @change="handleRatingChange"
            allow-half
          />
        </div>
        
        <div v-if="isRated" class="rating-status">
          <el-tag type="success" size="small">
            <svg-icon name="check" size="12px" color=""/>
            已评分
          </el-tag>
          <span class="rating-time">{{ formatDatetime(ratingTime) }}</span>
        </div>
        
        <div v-if="!isRated && userRating > 0" class="rating-actions">
          <el-button type="primary" size="small" @click="submitRating" :loading="submitting">
            提交评分
          </el-button>
          <el-button size="small" @click="cancelRating">
            取消
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElRate, ElButton, ElTag } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useArticleStore } from '@/stores/article'
import { formatDatetime } from '@/utils/format'
import type { ArticleRating } from '@/types/article'

interface Props {
  articleId: number
  averageScore: number
}

const props = defineProps<Props>()
const userStore = useUserStore()
const articleStore = useArticleStore()

const userRating = ref(0)
const isRated = ref(false)
const ratingTime = ref('')
const submitting = ref(false)

const colors = ['#99A9BF', '#F7BA2A', '#FF9900']
const texts = ['极差', '失望', '一般', '满意', '惊喜']

// 获取用户评分
const fetchUserRating = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const rating = await articleStore.getUserRating(props.articleId)
    if (rating) {
      userRating.value = rating.score
      isRated.value = true
      ratingTime.value = rating.created_at
    }
  } catch (error) {
    console.error('获取用户评分失败:', error)
  }
}

// 提交评分
const submitRating = async () => {
  if (userRating.value === 0) {
    ElMessage.warning('请先选择评分')
    return
  }
  
  submitting.value = true
  
  try {
    const success = await articleStore.rateArticle({
      article_id: props.articleId,
      score: userRating.value
    })
    
    if (success) {
      isRated.value = true
      ratingTime.value = new Date().toISOString()
      ElMessage.success('评分成功！')
      
      // 触发事件通知父组件更新平均分
      emit('rating-submitted', userRating.value)
    } else {
      ElMessage.error('评分失败，请重试')
    }
  } catch (error) {
    console.error('评分失败:', error)
    ElMessage.error('评分失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 取消评分
const cancelRating = () => {
  userRating.value = 0
}

// 评分变化处理
const handleRatingChange = (value: number) => {
  if (isRated.value) return
  userRating.value = value
}

const emit = defineEmits<{
  'rating-submitted': [score: number]
}>()

onMounted(() => {
  fetchUserRating()
})
</script>

<style lang="less" scoped>
.article-rating {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  
  .rating-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-color);
    }
    
    .average-score {
      font-size: 0.9rem;
      color: var(--text-color);
      font-weight: 500;
    }
  }
  
  .rating-content {
    .login-prompt {
      text-align: center;
      padding: 1rem;
      color: var(--text-color);
      
      p {
        margin: 0;
      }
    }
    
    .rating-section {
      .user-rating {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .rating-label {
          font-weight: 500;
          color: var(--text-color);
          min-width: 80px;
        }
      }
      
      .rating-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        
        .rating-time {
          font-size: 0.85rem;
          color: var(--text-color);
        }
      }
      
      .rating-actions {
        display: flex;
        gap: 0.5rem;
      }
    }
  }
}

// 深色模式适配
.dark {
  .article-rating {
    background: var(--card-bg-dark);
    border-color: var(--border-color-dark);
  }
}
</style>