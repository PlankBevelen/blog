<template>
  <div class="virtual-photo-grid" :style="{ height: containerHeight + 'px' }">
    <!-- 虚拟滚动 -->
    <div 
      v-for="(photo, index) in photoStore.photos"  
      :key="photo.id"
      class="photo-item" 
      :style="{ height: photoSize, width: photoSize }"
      @click="openPhotoViewer(index)" >
      <img v-lazy="photo.photo" alt="图片" class="photo-image" />
      <div class="photo-checkBox" v-if="selectionMode">
        <el-checkbox :label="photo.id" />
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="photoStore.loading" class="loading">
      <el-spinner style="width: 24px; height: 24px;" />
    </div>
  </div>

  <!-- 图片查看器 -->
  <div v-if="showViewer" class="photo-viewer" @click="closeViewer">
    <div class="viewer-content" @click.stop>
      <button class="close-btn" @click="closeViewer">
        <el-icon><Close /></el-icon>
      </button>
      
      <button 
        v-if="currentIndex > 0" 
        class="nav-btn prev-btn" 
        @click="prevPhoto">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      
      <button 
        v-if="currentIndex < photoStore.photos.length - 1" 
        class="nav-btn next-btn" 
        @click="nextPhoto">
        <el-icon><ArrowRight /></el-icon>
      </button>
      
      <div class="main-image-container">
        <img 
          v-lazy="photoStore.photos[currentIndex]?.photo" 
          alt="图片" 
          class="main-image" 
          @load="onImageLoad" />
        <div v-if="imageLoading" class="image-loading">
          <el-spinner style="width: 32px; height: 32px;" />
        </div>
      </div>
      
      <div class="photo-info">
        <span class="photo-counter">{{ currentIndex + 1 }} / {{ photoStore.photos.length }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/*
 * 虚拟滚动图片网格（首先需要预估一组图片高度撑开容器）
 * 初始化的时候，只加载一组图片，
 * 距离底部200px的时候，加载下一组图片，并且丢弃上一组图片，保留本组图片
 * 距离顶部200px的时候，加载上一组图片，并且丢弃下一组图片，保留本组图片
 * 距离顶部200px和底部200px之间的图片，保持加载状态
 */
import { usePhotoStore } from '@/stores/photo';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

const props = defineProps({
  albumId: {
    type: Number,
    required: true
  },
  selectionMode : {
    type: Boolean
  }
})

const photoStore = usePhotoStore();

// 图片查看器状态
const showViewer = ref(false);
const currentIndex = ref(0);
const imageLoading = ref(false);

// 规定图片大小
const photoSize = '200px';
// 规定图片间距
const photoGap = '16px';
// 每行图片数量
const photoPerRow = 6;

// 计算容器高度
const containerHeight = computed(()=>{
  return photoStore.pagination.pageSize / photoPerRow * (parseInt(photoSize) + parseInt(photoGap))
})

// 初始化
onMounted(async ()=> {
  await photoStore.fetchPhotosByAlbum(props.albumId)
  console.log(photoStore.photos.length)
})

// 计算滚动
const calculateScroll = ()=> {
  const container = document.querySelector('.virtual-photo-grid') as HTMLElement;
  const { height } = container.getBoundingClientRect();
  const { innerHeight } = window;
  const scrollTop = window.scrollY;
  const visibleHeight = innerHeight + scrollTop;
  const totalHeight = height + scrollTop;
  const visibleCount = Math.ceil(visibleHeight / (parseInt(photoSize) + parseInt(photoGap)));
  const totalCount = Math.ceil(totalHeight / (parseInt(photoSize) + parseInt(photoGap)));
  return {
    visibleCount,
    totalCount
  }
}

// 检测是否接近底部
const isNearBottom = (threshold = 200) => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  console.log(scrollTop + windowHeight >= documentHeight - threshold)
  
  return scrollTop + windowHeight >= documentHeight - threshold;
}

// 加载更多照片
const loadMorePhotos = async () => {
  if (!photoStore.loading) return;
  /* if (photoStore.photos.length >= photoStore.pagination.total) return; */
  
  // 增加页码
  photoStore.pagination.current++;
  await photoStore.fetchPhotosByAlbum(props.albumId, true); // true表示追加数据
}

// 监听滚动事件
const handleScroll = async () => {
  if (isNearBottom()) {
    photoStore.loading = true;
    await loadMorePhotos();
  }
}

// 图片查看器方法
const openPhotoViewer = (index: number) => {
  currentIndex.value = index;
  showViewer.value = true;
  imageLoading.value = true;
  // 阻止页面滚动
  document.body.style.overflow = 'hidden';
}

const closeViewer = () => {
  showViewer.value = false;
  imageLoading.value = false;
  // 恢复页面滚动
  document.body.style.overflow = 'auto';
}

const prevPhoto = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    imageLoading.value = true;
  }
}

const nextPhoto = () => {
  if (currentIndex.value < photoStore.photos.length - 1) {
    currentIndex.value++;
    imageLoading.value = true;
  }
}

const onImageLoad = () => {
  imageLoading.value = false;
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (!showViewer.value) return;
  
  switch (event.key) {
    case 'Escape':
      closeViewer();
      break;
    case 'ArrowLeft':
      prevPhoto();
      break;
    case 'ArrowRight':
      nextPhoto();
      break;
  }
}

// 添加事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
});

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  // 确保页面滚动恢复正常
  document.body.style.overflow = 'auto';
})

</script>

<style scoped lang="less">
.virtual-photo-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 16px;
  .photo-item {
    &:hover {
      .photo-image {
        transform: scale(1.05);
      }
      cursor: pointer;
    }
    .photo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      transition: transform 0.3s ease;
    }
  }
}

// 图片查看器样式
.photo-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  
  .viewer-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .close-btn {
      position: absolute;
      top: -50px;
      right: 0;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
    }
    
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 24px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-50%) scale(1.1);
      }
      
      &.prev-btn {
        left: -70px;
      }
      
      &.next-btn {
        right: -70px;
      }
    }
    
    .main-image-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .main-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      
      .image-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
      }
    }
    
    .photo-info {
      position: absolute;
      bottom: -50px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      text-align: center;
      
      .photo-counter {
        background: rgba(0, 0, 0, 0.5);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        backdrop-filter: blur(10px);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .photo-viewer {
    .viewer-content {
      .close-btn {
        top: 20px;
        right: 20px;
      }
      
      .nav-btn {
        &.prev-btn {
          left: 20px;
        }
        
        &.next-btn {
          right: 20px;
        }
      }
      
      .photo-info {
        bottom: 20px;
      }
    }
  }
}
</style>
