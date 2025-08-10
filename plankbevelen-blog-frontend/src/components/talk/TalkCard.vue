<template>
  <div class="talk-card card">
    <div class="talk-header">
      <div class="user-info">
        <img v-lazy="talk.avatar || '/default-avatar.svg'" alt="avatar" class="avatar" />
        <div class="user-details">
          <span class="nickname">{{ talk.nickname || '匿名用户' }}</span>
          <span class="time">{{ formatTime(talk.create_at) }}</span>
        </div>
      </div>
    </div>
    
    <div class="talk-content">
      <p class="content-text">{{ talk.content }}</p>
      
      <!-- 图片展示 -->
      <div v-if="talk.images && talk.images.length > 0" class="images-grid">
        <div 
          v-for="(image, index) in talk.images" 
          :key="index" 
          class="image-item"
          @click="previewImage(image, index)"
        >
          <img v-lazy="image" alt="说说图片" />
        </div>
      </div>
    </div>
    
    <div class="talk-actions">
      <div class="action-item" @click="handleLike">
        <svg-icon name="like" :class="{ active: isLiked }" color="var(--talk-color)" size="1.15em"/>
        <span>{{ talk.likes_count || 0 }}</span>
      </div>
      <div class="action-item" @click="handleComment" >
        <svg-icon name="comment" :class="{ active: isLiked }" color="var(--talk-color)"/>
        <span>{{ commentCount }}</span>
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div v-if="showComments" class="comments-section">
      <CommentSection 
        :talk-id="props.talk.id" 
        @comment-added="updateCommentCount"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TalkEntity } from '@/types/talk'
import talkService from '@/services/talk.service';
import CommentSection from './CommentSection.vue'

interface Props {
  talk: TalkEntity
}

const props = defineProps<Props>()

const isLiked = ref(false)
// 评论显示状态
const showComments = ref(false)
// 评论数量
const commentCount = ref(props.talk.comments_count || 0)

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
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 节流控制
const isLiking = ref(false)

// 点赞处理
const handleLike = () => {
  // 节流控制，防止频繁点击
  if (isLiking.value) {
    return
  }
  
  isLiking.value = true
  
  // 调用toggle接口切换点赞状态
  talkService.toggle(props.talk.id, isLiked.value ? 'unlike' : 'like').then(res => {
    console.log(res)
    // 切换点赞状态
    isLiked.value = !isLiked.value
    // 更新点赞数量
    if (isLiked.value) {
      props.talk.likes_count += 1
    } else {
      props.talk.likes_count -= 1
    }
  }).catch(err => {
    console.error('点赞操作失败:', err)
  }).finally(() => {
    // 500ms后解除节流
    setTimeout(() => {
      isLiking.value = false
    }, 500)
  })
}

// 评论处理
const handleComment = () => {
  showComments.value = !showComments.value
}

// 更新评论数量
const updateCommentCount = (count: number) => {
  commentCount.value = count
}

// 图片预览
const previewImage = (image: string, index: number) => {
  // TODO: 实现图片预览功能
  console.log('预览图片:', image, index)
}
</script>

<style lang="less" scoped>
.talk-card {
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .talk-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .user-info {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 12px;
        border: 2px solid var(--primary-color);
      }
      
      .user-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
        
        .nickname {
          font-weight: 600;
          color: var(--text-color);
          font-size: 14px;
        }
        
        .time {
          color: var(--text-color);
          font-size: 12px;
          margin-top: 2px;
        }
      }
    }
  }
  
  .talk-content {
    margin-bottom: 16px;
    
    .content-text {
      color: var(--text-color);
      line-height: 1.6;
      margin-bottom: 12px;
      word-wrap: break-word;
    }
    
    .images-grid {
      display: grid;
      gap: 8px;
      
      &:has(.image-item:nth-child(1):last-child) {
        grid-template-columns: 1fr;
        max-width: 300px;
      }
      
      &:has(.image-item:nth-child(2):last-child) {
        grid-template-columns: 1fr 1fr;
      }
      
      &:has(.image-item:nth-child(3):last-child) {
        grid-template-columns: 1fr 1fr 1fr;
      }

      &:has(.image-item:nth-child(4):last-child) {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .image-item {
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        aspect-ratio: 1;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover img {
          transform: scale(1.05);
        }
      }
    }
  }
  
  .talk-actions {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-top: 12px;
    padding-right: 20px;
    border-top: 1px solid var(--border-color);
    justify-content: flex-end;
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--text-color);
      font-size: 14px;
      transition: color 0.3s ease;
      
      &:hover {
        color: var(--primary-color);
      }
      
      .svg-icon {
        font-size: 16px;
        
        &.active {
          color: var(--primary-color);
        }
      }
    }
  }
}

.dark {
  .talk-card {
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  .comments-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>