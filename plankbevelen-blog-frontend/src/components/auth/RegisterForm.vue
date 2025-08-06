<template>
  <el-form 
    ref="registerFormRef" 
    :model="registerForm" 
    :rules="registerRules" 
    class="auth-form"
    @submit.prevent="handleRegister"
  >
    <el-form-item prop="nickname">
      <div class="input-wrapper">
        <el-icon class="input-icon"><User /></el-icon>
        <el-input
          v-model="registerForm.nickname"
          placeholder="昵称"
          class="custom-input"
        />
        <el-icon v-if="registerForm.nickname" class="status-icon success"><Check /></el-icon>
      </div>
    </el-form-item>
    
    <el-form-item prop="email">
      <div class="input-wrapper">
        <el-icon class="input-icon"><Message /></el-icon>
        <el-input
          v-model="registerForm.email"
          placeholder="邮箱地址"
          class="custom-input"
        />
        <el-icon v-if="registerForm.email" class="status-icon success"><Check /></el-icon>
      </div>
    </el-form-item>
    
    <el-form-item prop="password">
      <div class="input-wrapper">
        <el-icon class="input-icon"><Lock /></el-icon>
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="密码"
          class="custom-input"
          show-password
        />
      </div>
    </el-form-item>
    
    <el-form-item prop="confirmPassword">
      <div class="input-wrapper">
        <el-icon class="input-icon"><Lock /></el-icon>
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="确认密码"
          class="custom-input"
          show-password
          @keyup.enter="handleRegister"
        />
      </div>
    </el-form-item>
    
    <div class="form-options">
      <el-checkbox v-model="registerForm.agreeTerms" class="agree-terms">
        我同意 <el-link type="primary" :underline="false">《服务条款》</el-link> 
        和 <el-link type="primary" :underline="false">《隐私政策》</el-link>
      </el-checkbox>
    </div>
    
    <el-button
      type="primary"
      class="auth-button"
      :loading="loading"
      @click="handleRegister"
    >
      {{ loading ? '注册中...' : 'Create Account' }}
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElForm, ElMessage, type FormRules } from 'element-plus'
import { Message, Lock, Check, User } from '@element-plus/icons-vue'
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
const registerFormRef = ref<InstanceType<typeof ElForm>>()

// 注册表单数据
const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 自定义验证器
const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateAgreeTerms = (rule: any, value: boolean, callback: Function) => {
  if (!value) {
    callback(new Error('请同意服务条款和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreeTerms: [
    { validator: validateAgreeTerms, trigger: 'change' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 验证表单
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    // 调用注册接口
    const result = await userStore.register(
      registerForm.nickname,
      registerForm.email,
      registerForm.password
    )
    
    if (result.success) {
      ElMessage.success('注册成功！请登录您的账户')
      emit('success')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请稍后重试')
  }
}
</script>

<style lang="less" scoped>
.auth-form {
  .el-form-item {
    margin-bottom: 24px;
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      
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
    margin-bottom: 32px;
    
    .agree-terms {
      :deep(.el-checkbox__label) {
        color: #6c757d;
        font-size: 14px;
        line-height: 1.5;
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
      .agree-terms {
        :deep(.el-checkbox__label) {
          color: #a0aec0;
        }
      }
    }
  }
}
</style>