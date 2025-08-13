<template>
  <div class="comment-item">
    <div class="comment-main">
      <div class="comment-avatar">
        <img :src="comment.avatar || '/default-avatar.svg'" :alt="comment.nickname" />
      </div>
      
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">{{ comment.nickname }}</span>
          <span v-if="comment.reply_to_nickname" class="reply-to">
            回复 @{{ comment.reply_to_nickname }}
          </span>
          <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
        </div>
        
        <div class="comment-text">
          {{ comment.content }}
        </div>
        
        <div class="comment-actions">
          <el-button 
            text 
            size="small" 
            @click="toggleReply"
          >
            回复
          </el-button>
          <el-button 
            text 
            size="small" 
            type="danger"
            @click="handleDelete"
            v-if="canDelete"
          >
            删除
          </el-button>
        </div>
        
        <!-- 回复输入框 -->
        <div v-if="showReplyInput" class="reply-input">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="2"
            :placeholder="`回复 @${comment.nickname}...`"
            maxlength="500"
          />
          <div class="reply-actions">
            <el-button size="small" @click="cancelReply">取消</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="submitReply"
              :loading="replying"
              :disabled="!replyContent.trim()"
            >
              回复
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { ArticleComment } from '@/types/article'

interface Props {
  comment: ArticleComment
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reply: [comment: ArticleComment, content: string]
  delete: [commentId: number]
}>()

const userStore = useUserStore()
const showReplyInput = ref(false)
const replyContent = ref('')
const replying = ref(false)

// 是否可以删除评论（评论作者或管理员）
const canDelete = computed(() => {
  return userStore.userInfo?.id === props.comment.user_id
})

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 切换回复输入框
const toggleReply = () => {
  showReplyInput.value = !showReplyInput.value
  if (!showReplyInput.value) {
    replyContent.value = ''
  }
}

// 取消回复
const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) return
  
  replying.value = true
  try {
    emit('reply', props.comment, replyContent.value.trim())
    showReplyInput.value = false
    replyContent.value = ''
  } finally {
    replying.value = false
  }
}

// 删除评论
const handleDelete = () => {
  emit('delete', props.comment.id)
}
</script>

<style lang="less" scoped>
.comment-item {
  margin-bottom: 16px;
  
  .comment-main {
    display: flex;
    gap: 12px;
    
    .comment-avatar {
      flex-shrink: 0;
      
      img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--border-color);
        cursor: pointer;
        &:hover {
          border-color: var(--primary-color);
          transform: scale(1.1);
        }
      }
    }
    
    .comment-content {
      flex: 1;
      
      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .comment-author {
          font-weight: 600;
          color: var(--text-color);
          font-size: 14px;
        }
        
        .reply-to {
          color: var(--text-color);
          font-size: 12px;
        }
        
        .comment-time {
          color: #999;
          font-size: 12px;
          margin-left: auto;
        }
      }
      
      .comment-text {
        color: var(--text-color);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
        word-break: break-word;
      }
      
      .comment-actions {
        display: flex;
        
        .el-button {
          padding: 4px;
          height: auto;
          font-size: 12px;
        }
      }
      
      .reply-input {
        margin-top: 12px;
        
        .reply-actions {
          margin-top: 8px;
          text-align: right;
          
          .el-button {
            margin-left: 8px;
          }
        }
      }
    }
  }
}

// 回复项样式调整
.reply-item {
  .comment-main {
    .comment-avatar img {
      width: 32px;
      height: 32px;
    }
    
  }
}
</style>