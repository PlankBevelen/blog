<template>
  <div class="talk-card card">
    <div class="talk-header">
      <div class="user-info">
        <img :src="talk.avatar || '/default-avatar.svg'" alt="avatar" class="avatar" />
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
          <img :src="image" alt="说说图片" />
        </div>
      </div>
    </div>
    
    <div class="talk-actions">
      <div class="action-item" @click="handleLike">
        <svg-icon name="like" :class="{ active: isLiked }" />
        <span>{{ talk.likes_count || 0 }}</span>
      </div>
      <div class="action-item" @click="handleComment">
        <svg-icon name="comment" />
        <span>评论</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TalkEntity } from '@/types/talk'

interface Props {
  talk: TalkEntity
}

const props = defineProps<Props>()

const isLiked = ref(false)

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

// 点赞处理
const handleLike = () => {
  isLiked.value = !isLiked.value
  // TODO: 调用点赞API
}

// 评论处理
const handleComment = () => {
  // TODO: 打开评论框
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
    border-top: 1px solid var(--border-color);
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--talk-color);
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
}
</style>