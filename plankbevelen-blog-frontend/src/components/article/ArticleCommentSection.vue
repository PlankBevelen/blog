<template>
  <div class="comment-section">
    <div class="comment-header">
      <h3>评论 ({{ comments.length }})</h3>
    </div>
    
    <!-- 评论输入框 -->
    <div class="comment-input">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        maxlength="500"
        show-word-limit
      />
      <div class="comment-actions">
        <el-button 
          type="primary" 
          @click="submitComment"
          :loading="submitting"
          :disabled="!newComment.trim()"
        >
          发表评论
        </el-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="comments.length === 0" class="empty-comments">
        <p>暂无评论，快来抢沙发吧~</p>
      </div>
      <div v-else>
        <template v-for="comment in rootComments" :key="comment.id">
          <ArticleCommentItem
            :comment="comment"
            @reply="handleReply"
            @delete="handleDelete"
          />
          <!-- 显示该评论的所有回复 -->
          <ArticleCommentItem
            v-for="reply in getReplies(comment.id)"
            :key="reply.id"
            :comment="reply"
            @reply="handleReply"
            @delete="handleDelete"
            class="reply-item"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ArticleService from '@/services/article.service'
import ArticleCommentItem from './ArticleCommentItem.vue'
import { useUserStore } from '@/stores/user'
import type { ArticleComment } from '@/types/article'

interface Props {
  articleId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  commentAdded: [count: number]
}>()

const userStore = useUserStore()
const comments = ref<ArticleComment[]>([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)

// 根评论（没有父评论的评论）
const rootComments = computed(() => {
  return comments.value.filter(comment => !comment.parent_id)
})

// 获取指定评论的所有回复（平铺显示）
const getReplies = (parentId: number) => {
  const allReplies: ArticleComment[] = []
  const directReplies = comments.value.filter(comment => comment.parent_id === parentId)
  
  // 递归收集所有回复，但平铺显示
  const collectReplies = (replies: ArticleComment[]) => {
    replies.forEach(reply => {
      allReplies.push(reply)
      const subReplies = comments.value.filter(comment => comment.parent_id === reply.id)
      if (subReplies.length > 0) {
        collectReplies(subReplies)
      }
    })
  }
  
  collectReplies(directReplies)
  return allReplies
}

// 加载评论列表
const loadComments = async () => {
  loading.value = true
  try {
    const response = await ArticleService.getComments(props.articleId)
    comments.value = response.data
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  const commentContent = newComment.value.trim()
  
  try {
    const response = await ArticleService.addComment(props.articleId, commentContent)
    
    // 乐观更新：直接在本地添加新评论，避免重新加载
    const newCommentObj = {
      id: response.data.id,
      article_id: props.articleId,
      user_id: userStore.userInfo?.id || 0,
      content: commentContent,
      parent_id: null,
      reply_to_user_id: null,
      created_at: new Date().toISOString(),
      nickname: userStore.userInfo?.nickname || '匿名用户',
      avatar: userStore.userInfo?.avatar || '/default-avatar.svg',
      reply_to_nickname: null
    }
    
    comments.value.push(newCommentObj)
    newComment.value = ''
    emit('commentAdded', comments.value.length)
    ElMessage.success('评论发表成功')
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  } finally {
    submitting.value = false
  }
}

// 处理回复
const handleReply = async (parentComment: ArticleComment, content: string) => {
  try {
    const response = await ArticleService.addComment(
      props.articleId, 
      content, 
      parentComment.id, 
      parentComment.user_id
    )
    
    // 乐观更新：直接在本地添加新回复，避免重新加载
    const newReplyObj = {
      id: response.data.id,
      article_id: props.articleId,
      user_id: userStore.userInfo?.id || 0,
      content: content,
      parent_id: parentComment.id,
      reply_to_user_id: parentComment.user_id,
      created_at: new Date().toISOString(),
      nickname: userStore.userInfo?.nickname || '匿名用户',
      avatar: userStore.userInfo?.avatar || '/default-avatar.svg',
      reply_to_nickname: parentComment.nickname
    }
    
    comments.value.push(newReplyObj)
    emit('commentAdded', comments.value.length)
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  }
}

// 处理删除
const handleDelete = async (commentId: number) => {
  try {
    await ArticleService.deleteComment(commentId)
    
    // 乐观更新：直接从本地状态中移除评论和相关回复，避免重新加载
    const removeCommentAndReplies = (id: number) => {
      // 移除评论本身
      const commentIndex = comments.value.findIndex(c => c.id === id)
      if (commentIndex !== -1) {
        comments.value.splice(commentIndex, 1)
      }
      
      // 递归移除所有回复
      const replies = comments.value.filter(c => c.parent_id === id)
      replies.forEach(reply => {
        removeCommentAndReplies(reply.id)
      })
    }
    
    removeCommentAndReplies(commentId)
    emit('commentAdded', comments.value.length)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style lang="less" scoped>
.comment-section {
  margin-top: 20px;
  
  .comment-header {
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .comment-input {
    margin-bottom: 20px;
    
    .comment-actions {
      margin-top: 12px;
      text-align: right;
    }
  }
  
  .comment-list {
    .loading {
      padding: 20px 0;
    }
    
    .empty-comments {
      text-align: center;
      padding: 40px 0;
      color: #999;
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
    
    .reply-item {
      margin-left: 48px;
      margin-top: 12px;
      padding-left: 16px;
      border-left: 2px solid #f0f0f0;
      
      :deep(.comment-main .comment-avatar img) {
        width: 32px;
        height: 32px;

        
      }
    }
  }
}
</style>