<template>
  <el-form 
    ref="loginFormRef" 
    :model="loginForm" 
    :rules="loginRules" 
    class="auth-form"
    @submit.prevent="handleLogin"
  >
    <el-form-item prop="email">
      <div class="input-wrapper">
        <el-icon class="input-icon"><Message /></el-icon>
        <el-input
          v-model="loginForm.email"
          placeholder="邮箱"
          class="custom-input"
        />
        <el-icon v-if="loginForm.email" class="status-icon success"><Check /></el-icon>
      </div>
    </el-form-item>
    
    <el-form-item prop="password">
      <div class="input-wrapper">
        <el-icon class="input-icon"><Lock /></el-icon>
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          class="custom-input"
          show-password
          @keyup.enter="handleLogin"
        />
      </div>
    </el-form-item>
    
    <div class="form-options">
      <el-checkbox v-model="loginForm.rememberMe" class="remember-me">
        记住我
      </el-checkbox>
      <el-link type="primary" :underline="false" class="forgot-password">
        忘记密码？
      </el-link>
    </div>
    
    <el-button
      type="primary"
      class="auth-button"
      :loading="loading"
      @click="handleLogin"
    >
      {{ loading ? '登录中...' : 'Login Now' }}
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { Message, Lock, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  success: []
}>()

const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱或用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 验证表单
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    // 调用登录接口
    const result = await userStore.login(
      loginForm.email,
      loginForm.password,
      loginForm.rememberMe
    )
    if (result.success) {
      ElMessage.success('登录成功！')
      emit('success')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  }
}
</script>

<style lang="less" scoped>
.auth-form {
  .el-form-item {
    margin-bottom: 24px;
    
    .input-wrapper {
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      
      .input-icon {
        position: absolute;
        left: 16px;
        color: #adb5bd;
        z-index: 2;
        font-size: 18px;
      }
      
      .custom-input {
        width: 100%;
        
        :deep(.el-input__wrapper) {
          width: 100%;
          padding-left: 50px;
          padding-right: 50px;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #e9ecef;
          box-shadow: none;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #ced4da;
          }
          
          &.is-focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }
        
        :deep(.el-input__inner) {
          font-size: 16px;
          color: #495057;
          
          &::placeholder {
            color: #adb5bd;
          }
        }
      }
      
      .status-icon {
        position: absolute;
        right: 16px;
        color: #28a745;
        z-index: 2;
        font-size: 18px;
        
        &.success {
          color: #28a745;
        }
      }
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    
    .remember-me {
      :deep(.el-checkbox__label) {
        color: #6c757d;
        font-size: 14px;
      }
    }
    
    .forgot-password {
      font-size: 14px;
      color: #667eea;
      
      &:hover {
        color: #5a6fd8;
      }
    }
  }
  
  .auth-button {
    width: 100%;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    margin-bottom: 24px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

/* 暗色模式 */
.dark {
  .auth-form {
    .input-wrapper {
      .input-icon {
        color: #6c757d;
      }
      
      .custom-input {
        :deep(.el-input__wrapper) {
          background-color: #2d3748;
          border-color: #4a5568;
          
          &:hover {
            border-color: #718096;
          }
          
          &.is-focus {
            border-color: #667eea;
            background-color: #2d3748;
          }
        }
        
        :deep(.el-input__inner) {
          color: #e2e8f0;
          background-color: transparent;
          
          &::placeholder {
            color: #a0aec0;
          }
        }
      }
    }
    
    .form-options {
      .remember-me {
        :deep(.el-checkbox__label) {
          color: #a0aec0;
        }
      }
    }
  }
}
</style>