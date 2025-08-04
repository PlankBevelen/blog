<template>
  <div class="login">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="login-wrapper" :class="{ 'register-mode': !isLoginMode }">
      <!-- 登录模式：左侧插画，右侧表单 -->
      <template v-if="isLoginMode">
        <!-- 左侧插画区域 -->
        <div class="illustration-section">
          <div class="back-to-blog">
            <el-button 
              type="text" 
              @click="goToBlog"
              class="back-button"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回博客
            </el-button>
          </div>
          
          <div class="brand-section">
            <h1 class="brand-title">PlankBevelen</h1>
            <p class="brand-subtitle">个人博客系统</p>
          </div>
          
          <div class="illustration">
            <!-- 登录SVG插画 -->
            <svg viewBox="0 0 400 300" class="login-illustration">
              <!-- 桌子 -->
              <rect x="50" y="180" width="300" height="80" rx="8" fill="#4A90E2" opacity="0.8"/>
              <rect x="50" y="170" width="300" height="20" rx="8" fill="#5BA0F2"/>
              
              <!-- 人物1 -->
              <circle cx="120" cy="140" r="25" fill="#FFB74D"/>
              <rect x="100" y="165" width="40" height="60" rx="20" fill="#FFC107"/>
              <rect x="110" y="225" width="8" height="35" fill="#8D6E63"/>
              <rect x="122" y="225" width="8" height="35" fill="#8D6E63"/>
              
              <!-- 人物2 -->
              <circle cx="280" cy="140" r="25" fill="#E1BEE7"/>
              <rect x="260" y="165" width="40" height="60" rx="20" fill="#9C27B0"/>
              <rect x="270" y="225" width="8" height="35" fill="#8D6E63"/>
              <rect x="282" y="225" width="8" height="35" fill="#8D6E63"/>
              
              <!-- 笔记本电脑 -->
              <rect x="180" y="160" width="60" height="40" rx="4" fill="#37474F"/>
              <rect x="185" y="165" width="50" height="30" rx="2" fill="#263238"/>
              <rect x="190" y="170" width="40" height="20" fill="#4FC3F7"/>
              
              <!-- 植物 -->
              <rect x="320" y="150" width="15" height="30" rx="7" fill="#8BC34A"/>
              <circle cx="327" cy="145" r="12" fill="#4CAF50"/>
              <circle cx="320" cy="140" r="8" fill="#66BB6A"/>
              <circle cx="334" cy="140" r="8" fill="#66BB6A"/>
              
              <!-- 装饰圆点 -->
              <circle cx="80" cy="100" r="3" fill="#FFB74D" opacity="0.6"/>
              <circle cx="350" cy="120" r="4" fill="#E1BEE7" opacity="0.6"/>
              <circle cx="150" cy="80" r="2" fill="#4FC3F7" opacity="0.6"/>
              <circle cx="320" cy="90" r="3" fill="#8BC34A" opacity="0.6"/>
            </svg>
          </div>
        </div>
        
        <!-- 右侧表单区域 -->
        <div class="form-section">
          <Transition name="fade" mode="out-in">
            <div key="login" class="form-content">
              <div class="form-header">
                <h2>{{ currentTitle }}</h2>
                <p>{{ currentSubtitle }}</p>
              </div>
              
              <!-- 登录表单组件 -->
              <LoginForm 
                @success="handleLoginSuccess"
                :loading="loading"
              />
              
              <div class="form-footer">
                <p>{{ switchText }} <a href="#" @click="toggleMode" class="switch-link">{{ switchButtonText }}</a></p>
              </div>
              
              <div class="social-login">
                <p>Or continue with</p>
                <div class="social-buttons">
                  <button class="social-btn google">
                    <span>G</span>
                  </button>
                  <button class="social-btn facebook">
                    <span>f</span>
                  </button>
                  <button class="social-btn twitter">
                    <span>t</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </template>
      
      <!-- 注册模式：左侧表单，右侧插画 -->
      <template v-else>
        <!-- 左侧表单区域 -->
        <div class="form-section">
          
          <Transition name="fade" mode="out-in">
            <div key="register" class="form-content">
              <div class="form-header">
                <h2>{{ currentTitle }}</h2>
                <p>{{ currentSubtitle }}</p>
              </div>
              
              <!-- 注册表单组件 -->
              <RegisterForm 
                @success="handleRegisterSuccess"
                :loading="loading"
              />
              
              <div class="form-footer">
                <p>{{ switchText }} <a href="#" @click="toggleMode" class="switch-link">{{ switchButtonText }}</a></p>
              </div>
              
              <div class="social-login">
                <p>Or continue with</p>
                <div class="social-buttons">
                  <button class="social-btn google">
                    <span>G</span>
                  </button>
                  <button class="social-btn facebook">
                    <span>f</span>
                  </button>
                  <button class="social-btn twitter">
                    <span>t</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- 右侧插画区域 -->
        <div class="illustration-section">
          <div class="back-to-blog">
            <el-button 
              type="text" 
              @click="goToBlog"
              class="back-button"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回博客
            </el-button>
          </div>
          
          <div class="brand-section">
            <h1 class="brand-title">PlankBevelen</h1>
            <p class="brand-subtitle">个人博客系统</p>
          </div>
          
          <div class="illustration">
            <!-- 注册SVG插画 -->
            <svg viewBox="0 0 400 300" class="register-illustration">
              <!-- 背景圆形 -->
              <circle cx="200" cy="150" r="120" fill="#E3F2FD" opacity="0.6"/>
              <circle cx="200" cy="150" r="80" fill="#BBDEFB" opacity="0.4"/>
              
              <!-- 主要人物 -->
              <circle cx="200" cy="120" r="30" fill="#FFB74D"/>
              <rect x="175" y="150" width="50" height="70" rx="25" fill="#2196F3"/>
              <rect x="185" y="220" width="12" height="40" fill="#8D6E63"/>
              <rect x="203" y="220" width="12" height="40" fill="#8D6E63"/>
              
              <!-- 手臂 -->
              <ellipse cx="160" cy="170" rx="8" ry="25" fill="#FFB74D" transform="rotate(-30 160 170)"/>
              <ellipse cx="240" cy="170" rx="8" ry="25" fill="#FFB74D" transform="rotate(30 240 170)"/>
              
              <!-- 文档/表单 -->
              <rect x="120" y="140" width="30" height="40" rx="4" fill="white" stroke="#E0E0E0" stroke-width="2"/>
              <line x1="125" y1="150" x2="145" y2="150" stroke="#BDBDBD" stroke-width="2"/>
              <line x1="125" y1="160" x2="145" y2="160" stroke="#BDBDBD" stroke-width="2"/>
              <line x1="125" y1="170" x2="140" y2="170" stroke="#BDBDBD" stroke-width="2"/>
              
              <!-- 笔 -->
              <rect x="250" y="160" width="20" height="4" rx="2" fill="#FF9800"/>
              <rect x="270" y="158" width="8" height="8" rx="4" fill="#FFC107"/>
              
              <!-- 成功图标 -->
              <circle cx="320" cy="100" r="15" fill="#4CAF50"/>
              <path d="M312 100 L318 106 L328 94" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              
              <!-- 装饰元素 -->
              <circle cx="100" cy="80" r="4" fill="#FF5722" opacity="0.7"/>
              <circle cx="320" cy="200" r="6" fill="#9C27B0" opacity="0.6"/>
              <circle cx="80" cy="200" r="3" fill="#4CAF50" opacity="0.8"/>
              <circle cx="350" cy="150" r="5" fill="#FF9800" opacity="0.7"/>
              
              <!-- 星星装饰 -->
              <path d="M150 60 L152 66 L158 66 L153 70 L155 76 L150 72 L145 76 L147 70 L142 66 L148 66 Z" fill="#FFC107" opacity="0.8"/>
              <path d="M280 50 L281 54 L285 54 L282 57 L283 61 L280 59 L277 61 L278 57 L275 54 L279 54 Z" fill="#E91E63" opacity="0.7"/>
            </svg>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const userStore = useUserStore()

// 当前模式：true为登录，false为注册
const isLoginMode = ref(true)

// 加载状态
const loading = ref(false)

// 计算属性
const currentTitle = computed(() => {
  return isLoginMode.value ? 'Welcome Back :)' : 'Create Account :)'
})

const currentSubtitle = computed(() => {
  return isLoginMode.value 
    ? '请使用您的邮箱地址和密码登录' 
    : '创建您的账户，开始您的博客之旅'
})

const switchText = computed(() => {
  return isLoginMode.value ? '还没有账号？' : '已有账号？'
})

const switchButtonText = computed(() => {
  return isLoginMode.value ? 'Create Account' : 'Login Now'
})

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

// 处理登录成功
const handleLoginSuccess = () => {
  const redirect = router.currentRoute.value.query.redirect as string
  router.push(redirect || '/')
}

// 处理注册成功
const handleRegisterSuccess = () => {
  // 注册成功后可以直接登录或跳转到登录模式
  isLoginMode.value = true
  // 或者直接跳转到首页
  // router.push('/')
}

// 返回博客首页
const goToBlog = () => {
  router.push('/')
}

// 组件挂载时检查是否已登录
onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="less">
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

// 装饰性背景元素
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .shape-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
    background: linear-gradient(45deg, #81C784, #4FC3F7);
    opacity: 0.3;
  }
  
  .shape-2 {
    width: 150px;
    height: 150px;
    bottom: -75px;
    left: -75px;
    background: linear-gradient(45deg, #FFB74D, #FF8A65);
    opacity: 0.3;
  }
  
  .shape-3 {
    width: 100px;
    height: 100px;
    top: 50%;
    left: 10%;
    background: linear-gradient(45deg, #E1BEE7, #BA68C8);
    opacity: 0.2;
  }
}

.login-wrapper {
  display: flex;
  min-width: 1200px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.6s ease;
  
  &.register-mode {
    .form-section {
      order: 1;
    }
    
    .illustration-section {
      order: 2;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
      
      .back-to-blog {
        left: auto;
        right: 30px;
      }
    }
  }
}

// 左侧插画区域
.illustration-section {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  
  .back-to-blog {
    position: absolute;
    top: 30px;
    left: 30px;
    z-index: 10;
    
    .back-button {
      color: #6c757d;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 20px;
      transition: all 0.3s ease;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      
      &:hover {
        color: #495057;
        background-color: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .el-icon {
        margin-right: 6px;
      }
    }
  }
  
  .brand-section {
    margin-bottom: 40px;
    
    .brand-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .brand-subtitle {
      font-size: 1.1rem;
      color: #7f8c8d;
      margin-bottom: 2rem;
    }
  }
  
  .illustration {
    width: 100%;
    max-width: 400px;
    
    .login-illustration {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
    }
  }
}

// 右侧表单区域
.form-section {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 500px;
  position: relative;
  
  .form-content {
    width: 100%;
  }
  

}

.form-header {
  margin-bottom: 40px;
  
  h2 {
    color: #2c3e50;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px 0;
    line-height: 1.2;
  }
  
  p {
    color: #6c757d;
    font-size: 16px;
    margin: 0;
    line-height: 1.5;
  }
}

.form-footer {
  text-align: center;
  margin: 24px 0;
  
  p {
    font-size: 14px;
    color: #6b7280;
    
    .switch-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
      
      &:hover {
        color: #5a67d8;
        text-decoration: underline;
      }
    }
  }
}

.social-login {
  text-align: center;
  margin-top: 24px;
  
  p {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 16px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }
  }
  
  .social-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    
    .social-btn {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      
      span {
        font-weight: 600;
        font-size: 16px;
        background: white;
        padding: 0 16px;
        position: relative;
        z-index: 1;
      }
      
      &.google {
        span {
          color: #ea4335;
        }
        
        &:hover {
          border-color: #ea4335;
          background: #fef2f2;
        }
      }
      
      &.facebook {
        span {
          color: #1877f2;
        }
        
        &:hover {
          border-color: #1877f2;
          background: #eff6ff;
        }
      }
      
      &.twitter {
        span {
          color: #1da1f2;
        }
        
        &:hover {
          border-color: #1da1f2;
          background: #eff6ff;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }
  
  .illustration-section {
    min-height: 300px;
    padding: 30px 20px;
    
    .brand-section {
      margin-bottom: 20px;
    }
    
    .illustration {
      max-width: 300px;
    }
  }
  
  .form-section {
    padding: 40px 30px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .illustration-section {
    .back-to-blog {
       top: 20px;
       left: 20px;
     }
     
     .register-mode .back-to-blog {
       left: auto;
       right: 20px;
     }
  }
  }

// 渐入渐出动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
