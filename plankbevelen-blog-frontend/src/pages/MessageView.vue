<template>
    <TopBanner :title="title" :imagePath="imagePath" :waveVisible="false">
        <canvas 
            ref="messagesCanvas" 
            class="messages-canvas"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
        ></canvas>
        <div class="messageBox" @mouseover="showInput = true" @mouseleave="showInput=false">
            <el-input 
                v-if="showInput"
                v-model="messageText"
                placeholder="请输入留言内容..."
                @keyup.enter="submitMessage"
                maxlength="200"
                show-word-limit
            />
            <div class="send-icon-box" @click="submitMessage">
                <svg-icon name="send" size="1.8em"/>
            </div>
        </div>
    </TopBanner>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';
import messageImage from '@/assets/images/message.jpg'
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const imagePath = messageImage;
const title = '留 言';

const showInput = ref(false);
const messageText = ref('');
const messageStore = useMessageStore();
const userStore = useUserStore();

// Canvas相关
const messagesCanvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let canvasMessages: Array<{
  id: number;
  content: string;
  avatar: string;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  paused: boolean;
  pausedX?: number;
  avatarImg?: HTMLImageElement;
}> = [];

// 头像图片缓存
const avatarCache = new Map<string, HTMLImageElement>();

// 加载头像图片
const loadAvatarImage = (avatarUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (avatarCache.has(avatarUrl)) {
      resolve(avatarCache.get(avatarUrl)!);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      avatarCache.set(avatarUrl, img);
      resolve(img);
    };
    img.onerror = () => {
      // 如果加载失败，使用默认头像
      const defaultImg = new Image();
      defaultImg.src = '/default-avatar.svg';
      defaultImg.onload = () => {
        avatarCache.set(avatarUrl, defaultImg);
        resolve(defaultImg);
      };
    };
    img.src = avatarUrl;
  });
};

// 获取滚动消息
const scrollingMessages = computed(() => messageStore.scrollingMessages);

// 监听消息变化，增量更新canvas
watch(scrollingMessages, (newMessages, oldMessages) => {
  if (ctx && messagesCanvas.value) {
    addNewMessages(newMessages, oldMessages || []);
  }
}, { deep: true });

// 鼠标事件处理
const handleMouseMove = (event: MouseEvent) => {
  if (!messagesCanvas.value) return;
  
  const rect = messagesCanvas.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  canvasMessages.forEach(msg => {
    // 检查鼠标是否在留言区域内
    if (mouseX >= msg.x && mouseX <= msg.x + msg.width &&
        mouseY >= msg.y && mouseY <= msg.y + msg.height) {
      if (!msg.paused) {
        msg.paused = true;
        msg.pausedX = msg.x;
      }
    } else {
      msg.paused = false;
    }
  });
};

const handleMouseLeave = () => {
  canvasMessages.forEach(msg => {
    msg.paused = false;
  });
};

// 初始化Canvas
const initCanvas = () => {
  if (!messagesCanvas.value) return;
  
  ctx = messagesCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // 设置canvas尺寸
  const resizeCanvas = () => {
    if (!messagesCanvas.value || !ctx) return;
    messagesCanvas.value.width = messagesCanvas.value.offsetWidth;
    messagesCanvas.value.height = messagesCanvas.value.offsetHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 初始化留言数据
  updateCanvasMessages();
  
  // 开始动画循环
  startAnimation();
};

// 增量添加新消息
const addNewMessages = async (newMessages: any[], oldMessages: any[]) => {
  if (!messagesCanvas.value) return;
  
  // 找出新增的消息
  const newMsgIds = new Set(newMessages.map(msg => msg.id));
  const oldMsgIds = new Set(oldMessages.map(msg => msg.id));
  const addedMessages = newMessages.filter(msg => !oldMsgIds.has(msg.id));
  
  // 移除已删除的消息
  canvasMessages = canvasMessages.filter(canvasMsg => newMsgIds.has(canvasMsg.id));
  
  // 为新消息创建canvas对象
  const newCanvasMessages = await Promise.all(addedMessages.map(async (msg, index) => {
    // 生成随机Y位置
    const randomY = 50 + (Math.sin((canvasMessages.length + index) * 2.5) * 30);
    const randomSpeed = 1 + Math.random() * 2;
    
    // 加载头像图片
    const avatarUrl = msg.avatar || '/default-avatar.svg';
    let avatarImg: HTMLImageElement | undefined;
    try {
      avatarImg = await loadAvatarImage(avatarUrl);
    } catch (error) {
      console.warn('Failed to load avatar:', avatarUrl);
    }
    
    return {
      id: msg.id,
      content: msg.content,
      avatar: avatarUrl,
      x: messagesCanvas.value!.width + index * 200, // 新消息从右侧进入
      y: (messagesCanvas.value!.height * randomY) / 100,
      speed: randomSpeed,
      width: 200,
      height: 40,
      paused: false,
      avatarImg
    };
  }));
  
  // 将新消息添加到现有消息列表中
  canvasMessages.push(...newCanvasMessages);
};

// 初始化canvas留言数据（仅在首次加载时使用）
const updateCanvasMessages = async () => {
  if (!messagesCanvas.value) return;
  
  const messages = scrollingMessages.value;
  canvasMessages = await Promise.all(messages.map(async (msg, index) => {
    // 生成随机Y位置
    const randomY = 50 + (Math.sin(index * 2.5) * 30); // 在20%-80%之间
    const randomSpeed = 1 + Math.random() * 2; // 1-3px/frame的速度
    
    // 加载头像图片
    const avatarUrl = msg.avatar || '/default-avatar.svg';
    let avatarImg: HTMLImageElement | undefined;
    try {
      avatarImg = await loadAvatarImage(avatarUrl);
    } catch (error) {
      console.warn('Failed to load avatar:', avatarUrl);
    }
    
    return {
      id: msg.id,
      content: msg.content,
      avatar: avatarUrl,
      x: messagesCanvas.value!.width + index * 200, // 初始位置在右侧外
      y: (messagesCanvas.value!.height * randomY) / 100,
      speed: randomSpeed,
      width: 200, // 估算宽度
      height: 40,  // 估算高度
      paused: false,
      avatarImg
    };
  }));
};

// 动画循环
const startAnimation = () => {
  if (!ctx || !messagesCanvas.value) return;
  
  const animate = () => {
    // 清空canvas
    ctx!.clearRect(0, 0, messagesCanvas.value!.width, messagesCanvas.value!.height);
    
    // 绘制每个留言并更新位置
    canvasMessages.forEach((msg, index) => {
      if (!msg.paused) {
        msg.x -= msg.speed;
        
        // 如果完全移出左侧，重置到右侧（循环滚动）
        if (msg.x + msg.width < 0) {
          msg.x = messagesCanvas.value!.width + Math.random() * 300; // 添加随机间距
          // 重新生成随机Y位置
          const randomY = 50 + (Math.sin(Date.now() * 0.001 + index) * 30);
          msg.y = (messagesCanvas.value!.height * randomY) / 100;
        }
      }
      
      drawMessage(msg);
    });
    
    // 清理过多的消息（保持性能）
    if (canvasMessages.length > 50) {
      canvasMessages.splice(0, canvasMessages.length - 30);
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
};

// 绘制单个留言
const drawMessage = (msg: any) => {
  if (!ctx) return;
  
  // 绘制背景
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  
  const padding = 12;
  const borderRadius = 25;
  
  // 绘制圆角矩形背景
  ctx.beginPath();
  ctx.roundRect(msg.x, msg.y, msg.width, msg.height, borderRadius);
  ctx.fill();
  
  ctx.restore();
  
  // 绘制头像
  ctx.save();
  if (msg.avatarImg) {
    // 创建圆形裁剪路径
    ctx.beginPath();
    ctx.arc(msg.x + 20, msg.y + 20, 14, 0, 2 * Math.PI);
    ctx.clip();
    
    // 绘制头像图片
    ctx.drawImage(msg.avatarImg, msg.x + 6, msg.y + 6, 28, 28);
  } else {
    // 如果没有头像图片，绘制默认圆形
    ctx.beginPath();
    ctx.arc(msg.x + 20, msg.y + 20, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#ddd';
    ctx.fill();
  }
  ctx.restore();
  
  // 绘制头像边框
  ctx.save();
  ctx.beginPath();
  ctx.arc(msg.x + 20, msg.y + 20, 14, 0, 2 * Math.PI);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  // 绘制文本
  ctx.save();
  ctx.fillStyle = '#333';
  ctx.font = '16px Arial';
  ctx.textBaseline = 'middle';
  
  // 限制文本长度
  let displayText = msg.content;
  if (displayText.length > 15) {
    displayText = displayText.substring(0, 15) + '...';
  }
  
  ctx.fillText(displayText, msg.x + 45, msg.y + 20);
  ctx.restore();
  
  // 更新实际宽度
  const textWidth = ctx.measureText(displayText).width;
  msg.width = Math.max(textWidth + 60, 150);
};

// 提交留言
const submitMessage = async () => {
  if (!messageText.value.trim()) {
    ElMessage.warning('请输入留言内容');
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再留言');
    return;
  }

  try {
    await messageStore.createMessage(messageText.value.trim());
    
    messageText.value = '';
    showInput.value = false;
    ElMessage.success('留言发送成功！');
    
    // 重新获取最新消息
    await messageStore.fetchLatestMessages();
  } catch (error) {
    ElMessage.error('留言发送失败，请重试');
  }
};

// 定时器用于滚动消息
let scrollTimer: number | null = null;

// 启动滚动消息定时器
const startScrolling = () => {
  scrollTimer = setInterval(async () => {
    await messageStore.fetchLatestMessages();
  }, 10000); // 每10秒更新一次
};

// 停止滚动消息定时器
const stopScrolling = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
};

onMounted(async () => {
  // 初始化获取消息
  await messageStore.fetchLatestMessages();
  // 启动定时器
  startScrolling();
  
  // 等待DOM更新后初始化canvas
  await nextTick();
  initCanvas();
});

onUnmounted(() => {
  // 清理定时器
  stopScrolling();
  
  // 清理动画
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  // 清理事件监听器
  window.removeEventListener('resize', () => {});
});

</script>

<style lang="less" scoped src="@/assets/styles/pages/message.less"></style>

