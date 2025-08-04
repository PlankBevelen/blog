<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-background"></div>
      <div class="profile-info">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="userStore.userAvatar" alt="用户头像" class="avatar" />
            <div class="avatar-overlay" @click="handleAvatarUpload">
              <el-icon><Camera /></el-icon>
            </div>
          </div>
        </div>
        <div class="user-details">
          <h1 class="username">{{ userStore.userName }}</h1>
          <p class="email">{{ userStore.userInfo?.email }}</p>
          <p class="join-date">加入时间：{{ formatDate(userStore.userInfo?.created_at) }}</p>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="content-wrapper">
        <!-- 个人信息卡片 -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="editMode = !editMode">
                {{ editMode ? '取消编辑' : '编辑资料' }}
              </el-button>
            </div>
          </template>
          
          <el-form 
            ref="profileFormRef" 
            :model="profileForm" 
            :rules="profileRules" 
            label-width="100px"
            :disabled="!editMode"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" disabled />
            </el-form-item>
            
            <el-form-item label="个人网站" prop="flink">
              <el-input v-model="profileForm.flink" placeholder="请输入个人网站链接" />
            </el-form-item>
            
            <el-form-item label="个人简介" prop="flink_bio">
              <el-input 
                v-model="profileForm.flink_bio" 
                type="textarea" 
                :rows="4" 
                placeholder="介绍一下自己吧..." 
              />
            </el-form-item>
            
            <el-form-item v-if="editMode">
              <el-button type="primary" @click="handleSaveProfile" :loading="saving">
                保存修改
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 统计信息卡片 -->
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <span>统计信息</span>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">文章数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">访问量</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">点赞数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">评论数</div>
            </div>
          </div>
        </el-card>

        <!-- 安全设置卡片 -->
        <el-card class="security-card" shadow="hover">
          <template #header>
            <span>安全设置</span>
          </template>
          
          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <h4>修改密码</h4>
                <p>定期修改密码可以提高账户安全性</p>
              </div>
              <el-button type="primary" @click="showPasswordDialog = true">
                修改密码
              </el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>最后登录</h4>
                <p>{{ formatDate(userStore.userInfo?.last_login) || '暂无记录' }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form 
        ref="passwordFormRef" 
        :model="passwordForm" 
        :rules="passwordRules" 
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 头像上传对话框 -->
    <el-dialog v-model="showAvatarDialog" title="更换头像" width="400px">
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarChange"
        >
          <img v-if="newAvatar" :src="newAvatar" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tips">
          <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAvatarChange" :loading="uploadingAvatar">
          确认更换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import type { UserInfo } from '@/types/user'

const userStore = useUserStore()

// 编辑模式
const editMode = ref(false)
const saving = ref(false)

// 表单引用
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 个人信息表单
const profileForm = reactive({
  nickname: '',
  email: '',
  flink: '',
  flink_bio: ''
})

// 密码修改
const showPasswordDialog = ref(false)
const changingPassword = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像上传
const showAvatarDialog = ref(false)
const uploadingAvatar = ref(false)
const newAvatar = ref('')

// 表单验证规则
const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  flink: [
    { type: 'url', message: '请输入正确的网址格式', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname || ''
    profileForm.email = userStore.userInfo.email || ''
    profileForm.flink = userStore.userInfo.flink || ''
    profileForm.flink_bio = userStore.userInfo.flink_bio || ''
  }
}

// 重置表单
const resetForm = () => {
  initFormData()
}

// 保存个人信息
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    const result = await userStore.updateProfile({
      nickname: profileForm.nickname,
      flink: profileForm.flink,
      flink_bio: profileForm.flink_bio
    })
    
    if (result.success) {
      editMode.value = false
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    const result = await userStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )
    
    if (result.success) {
      showPasswordDialog.value = false
      
      // 重置表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (error) {
    console.error('密码修改失败:', error)
  } finally {
    changingPassword.value = false
  }
}

// 头像上传相关
const handleAvatarUpload = () => {
  showAvatarDialog.value = true
  newAvatar.value = ''
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    newAvatar.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  return false // 阻止自动上传
}

const handleAvatarChange = () => {
  // 这里只是预览，实际上传在确认时进行
}

const confirmAvatarChange = async () => {
  if (!newAvatar.value) {
    ElMessage.error('请选择头像')
    return
  }
  
  try {
    uploadingAvatar.value = true
    
    const result = await userStore.updateAvatar(newAvatar.value)
    
    if (result.success) {
      showAvatarDialog.value = false
      newAvatar.value = ''
    }
  } catch (error) {
    console.error('头像上传失败:', error)
  } finally {
    uploadingAvatar.value = false
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 组件挂载时初始化
onMounted(async () => {
  // 如果用户已登录但没有详细信息，则获取用户信息
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchUserProfile()
  }
  initFormData()
})
</script>

<style scoped lang="less">
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-header {
  position: relative;
  height: 300px;
  overflow: hidden;
  
  .header-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      opacity: 0.3;
    }
  }
  
  .profile-info {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 30px;
    color: white;
    
    .avatar-section {
      .avatar-wrapper {
        position: relative;
        
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
          object-fit: cover;
          transition: all 0.3s ease;
        }
        
        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.3s ease;
          
          &:hover {
            opacity: 1;
          }
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
        }
      }
    }
    
    .user-details {
      .username {
        font-size: 32px;
        font-weight: 600;
        margin: 0 0 8px 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .email {
        font-size: 16px;
        opacity: 0.9;
        margin: 0 0 4px 0;
      }
      
      .join-date {
        font-size: 14px;
        opacity: 0.8;
        margin: 0;
      }
    }
  }
}

.profile-content {
  padding: 40px 20px;
  
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.info-card, .stats-card, .security-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  .stat-item {
    text-align: center;
    padding: 20px;
    border-radius: 8px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    
    &:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }
    
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #6c757d;
    }
  }
}

.security-items {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .security-info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #6c757d;
      }
    }
  }
}

.avatar-upload {
  text-align: center;
  
  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
      }
    }
  }
  
  .avatar-preview {
    width: 178px;
    height: 178px;
    object-fit: cover;
    display: block;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  
  .upload-tips {
    margin-top: 16px;
    
    p {
      margin: 0;
      font-size: 12px;
      color: #999;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-header {
    height: 250px;
    
    .profile-info {
      flex-direction: column;
      text-align: center;
      gap: 20px;
      
      .avatar-section .avatar-wrapper .avatar {
        width: 100px;
        height: 100px;
      }
      
      .user-details .username {
        font-size: 24px;
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 20px 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>