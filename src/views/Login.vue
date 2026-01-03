<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧信息区 -->
      <div class="login-info">
        <div class="info-content">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon :size="48"><School /></el-icon>
            </div>
            <h1 class="system-name">一学分课堂</h1>
            <p class="system-desc">{{ appStore.isEnterprise ? '企业端管理平台' : '高校端管理平台' }}</p>
          </div>
          <div class="feature-list">
            <template v-if="appStore.isEnterprise">
              <div class="feature-item">
                <el-icon :size="24"><Connection /></el-icon>
                <span>智能课程匹配</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24"><User /></el-icon>
                <span>岗位画像管理</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24"><Document /></el-icon>
                <span>人才培养计划</span>
              </div>
            </template>
            <template v-else>
              <div class="feature-item">
                <el-icon :size="24"><Document /></el-icon>
                <span>课程切片管理</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24"><EditPen /></el-icon>
                <span>提案审批</span>
              </div>
              <div class="feature-item">
                <el-icon :size="24"><DataAnalysis /></el-icon>
                <span>教学反馈分析</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-box">
          <div class="login-header">
            <div class="mode-switch-container">
              <el-button-group>
                <el-button 
                  :type="appStore.isEnterprise ? 'primary' : 'default'"
                  @click="switchToEnterprise"
                  size="small"
                >
                  企业端
                </el-button>
                <el-button 
                  :type="appStore.isUniversity ? 'primary' : 'default'"
                  @click="switchToUniversity"
                  size="small"
                >
                  高校端
                </el-button>
              </el-button-group>
            </div>
            <h2 class="login-title">欢迎回来</h2>
            <p class="login-subtitle">{{ appStore.isEnterprise ? '请登录您的企业账号' : '请登录您的高校账号' }}</p>
          </div>

          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="账号登录" name="login">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login-form"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名或邮箱"
                    size="large"
                    prefix-icon="User"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    size="large"
                    prefix-icon="Lock"
                    show-password
                    clearable
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>
                <el-form-item>
                  <div class="form-options">
                    <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                    <el-link type="primary" :underline="false">忘记密码？</el-link>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="login-button"
                    :loading="loginLoading"
                    @click="handleLogin"
                  >
                    {{ loginLoading ? '登录中...' : '登录' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane :label="appStore.isEnterprise ? '企业注册' : '高校注册'" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                class="register-form"
              >
                <el-form-item :prop="appStore.isEnterprise ? 'companyName' : 'universityName'">
                  <el-input
                    v-model="registerForm.companyName"
                    :placeholder="appStore.isEnterprise ? '请输入企业名称' : '请输入高校名称'"
                    size="large"
                    prefix-icon="OfficeBuilding"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="请输入用户名"
                    size="large"
                    prefix-icon="User"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="email">
                  <el-input
                    v-model="registerForm.email"
                    :placeholder="appStore.isEnterprise ? '请输入企业邮箱' : '请输入高校邮箱'"
                    size="large"
                    prefix-icon="Message"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="phone">
                  <el-input
                    v-model="registerForm.phone"
                    placeholder="请输入联系电话"
                    size="large"
                    prefix-icon="Phone"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入密码（至少8位）"
                    size="large"
                    prefix-icon="Lock"
                    show-password
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    size="large"
                    prefix-icon="Lock"
                    show-password
                    clearable
                    @keyup.enter="handleRegister"
                  />
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="agreeTerms">
                    我已阅读并同意
                    <el-link type="primary" :underline="false">《服务协议》</el-link>
                    和
                    <el-link type="primary" :underline="false">《隐私政策》</el-link>
                  </el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="register-button"
                    :loading="registerLoading"
                    :disabled="!agreeTerms"
                    @click="handleRegister"
                  >
                    {{ registerLoading ? '注册中...' : '立即注册' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import { userApiUniversity } from '@/api/university'
import { useUserStore } from '@/stores/user'
import { useUserStoreUniversity } from '@/stores/user-university'
import { useAppStore } from '@/stores/app'
import { School, Connection, User, Document, OfficeBuilding, Message, Phone, Lock, EditPen, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const userStoreUniversity = useUserStoreUniversity()

// 页面加载时检查记住我功能
onMounted(() => {
  const rememberKey = appStore.isEnterprise ? 'rememberMe' : 'rememberMe_university'
  const usernameKey = appStore.isEnterprise ? 'username' : 'username_university'
  
  if (localStorage.getItem(rememberKey) === 'true') {
    rememberMe.value = true
    const savedUsername = localStorage.getItem(usernameKey)
    if (savedUsername) {
      loginForm.username = savedUsername
    }
  }
})
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const rememberMe = ref(false)
const agreeTerms = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  companyName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules = {
  companyName: [{ required: true, message: (rule, value, callback) => {
    return appStore.isEnterprise ? '请输入企业名称' : '请输入高校名称'
  }, trigger: 'blur' }],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入企业邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      try {
        console.log('开始登录...', appStore.currentMode)
        
        let result
        if (appStore.isEnterprise) {
          // 企业端登录
          result = await userStore.login({
            username: loginForm.username,
            password: loginForm.password
          })
          
          if (!userStore.isLoggedIn) {
            throw new Error('登录状态验证失败')
          }
        } else {
          // 高校端登录
          result = await userStoreUniversity.login({
            username: loginForm.username,
            password: loginForm.password
          })
          
          if (!userStoreUniversity.isLoggedIn) {
            throw new Error('登录状态验证失败')
          }
        }
        
        console.log('登录API返回:', result)
        
        ElMessage.success('登录成功')
        
        // 记住我功能
        const rememberKey = appStore.isEnterprise ? 'rememberMe' : 'rememberMe_university'
        const usernameKey = appStore.isEnterprise ? 'username' : 'username_university'
        
        if (rememberMe.value) {
          localStorage.setItem(rememberKey, 'true')
          localStorage.setItem(usernameKey, loginForm.username)
        } else {
          localStorage.removeItem(rememberKey)
          localStorage.removeItem(usernameKey)
        }
        
        console.log('准备跳转到首页...')
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        await router.push('/')
        
        console.log('跳转完成')
        
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loginLoading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  if (!agreeTerms.value) {
    ElMessage.warning('请先同意服务协议和隐私政策')
    return
  }
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      try {
        // 构造注册请求数据
        const registerData = appStore.isEnterprise ? {
          companyName: registerForm.companyName,
          username: registerForm.username,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password
        } : {
          universityName: registerForm.companyName,
          username: registerForm.username,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password
        }
        
        // 调用注册API
        const result = appStore.isEnterprise 
          ? await userApi.register(registerData)
          : await userApiUniversity.register(registerData)
        
        ElMessage.success('注册成功，请登录')
        
        // 切换到登录标签页
        activeTab.value = 'login'
        
        // 清空注册表单
        Object.assign(registerForm, {
          companyName: '',
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })
        registerFormRef.value?.clearValidate()
        
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        registerLoading.value = false
      }
    }
  })
}

const switchToEnterprise = () => {
  appStore.switchToEnterprise()
  // 清空表单
  loginForm.username = ''
  loginForm.password = ''
  registerForm.companyName = ''
  registerForm.username = ''
  registerForm.email = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

const switchToUniversity = () => {
  appStore.switchToUniversity()
  // 清空表单
  loginForm.username = ''
  loginForm.password = ''
  registerForm.companyName = ''
  registerForm.username = ''
  registerForm.email = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  
  .background-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    
    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;
      
      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -150px;
        left: -150px;
        animation-delay: 0s;
      }
      
      &.circle-2 {
        width: 200px;
        height: 200px;
        top: 50%;
        right: -100px;
        animation-delay: 5s;
      }
      
      &.circle-3 {
        width: 250px;
        height: 250px;
        bottom: -125px;
        left: 20%;
        animation-delay: 10s;
      }
    }
  }
  
  .login-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .login-info {
    flex: 1;
    max-width: 500px;
    color: white;
    padding: 40px;
    display: flex;
    align-items: center;
    
    .info-content {
      width: 100%;
      
      .logo-section {
        margin-bottom: 60px;
        
        .logo-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .system-name {
          font-size: 48px;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .system-desc {
          font-size: 20px;
          opacity: 0.9;
          margin: 0;
        }
      }
      
      .feature-list {
        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          font-size: 16px;
          
          .el-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }
        }
      }
    }
  }
  
  .login-form-wrapper {
    flex: 1;
    max-width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .login-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.5s ease-out;
      
      .login-header {
        text-align: center;
        margin-bottom: 30px;
        
        .mode-switch-container {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }
        
        .login-title {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        .login-subtitle {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }
      
      .login-tabs {
        :deep(.el-tabs__header) {
          margin-bottom: 24px;
        }
        
        :deep(.el-tabs__item) {
          font-size: 16px;
          font-weight: 500;
        }
        
        :deep(.el-tabs__active-bar) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      }
      
      .login-form,
      .register-form {
        .form-options {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .login-button,
        .register-button {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
        }
        
        :deep(.el-input__wrapper) {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
          
          &:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          }
          
          &.is-focus {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
          }
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 968px) {
  .login-container {
    .login-wrapper {
      flex-direction: column;
    }
    
    .login-info {
      max-width: 100%;
      padding: 20px;
      
      .info-content {
        .logo-section {
          margin-bottom: 30px;
          
          .system-name {
            font-size: 36px;
          }
        }
      }
    }
    
    .login-form-wrapper {
      max-width: 100%;
      width: 100%;
      
      .login-box {
        padding: 30px 20px;
      }
    }
  }
}
</style>
