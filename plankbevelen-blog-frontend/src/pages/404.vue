<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <div class="error-actions">
        <button class="btn-primary" @click="goHome">
          返回首页
        </button>
        <button class="btn-secondary" @click="goBack">
          返回上页
        </button>
      </div>
    </div>
    <div class="error-illustration">
      <svg viewBox="0 0 400 300" class="illustration-svg">
        <!-- 简单的404插图 -->
        <circle cx="200" cy="150" r="80" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="200" y="160" text-anchor="middle" font-size="24" fill="#999">404</text>
        <path d="M160 120 Q200 100 240 120" stroke="#ccc" stroke-width="3" fill="none"/>
        <circle cx="180" cy="130" r="3" fill="#999"/>
        <circle cx="220" cy="130" r="3" fill="#999"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  color: white;
  max-width: 500px;
  margin-right: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-description {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.btn-secondary:hover {
  background: #fff;
  color: #667eea;
  transform: translateY(-2px);
}

.error-illustration {
  flex-shrink: 0;
}

.illustration-svg {
  width: 200px;
  height: 150px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .not-found-container {
    flex-direction: column;
    text-align: center;
  }
  
  .not-found-content {
    margin-right: 0;
    margin-bottom: 40px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 200px;
  }
}
</style>