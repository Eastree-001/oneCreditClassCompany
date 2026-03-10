<template>
  <div class="user-management">
    <el-page-header @back="goBack" content="用户管理" />
    
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="请选择用户类型" clearable>
            <el-option label="企业用户" value="enterprise" />
            <el-option label="高校用户" value="university" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>用户列表</span>
        <el-button type="primary" size="small" style="float: right;" @click="exportUsers">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
      
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getUserTypeTag(row.userType)">
              {{ getUserTypeText(row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewUser(row)">查看</el-button>
            <el-button 
              size="small" 
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="toggleUserStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="userDialogVisible" title="用户详情" width="600px">
      <el-form :model="currentUser" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" disabled />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-input :value="getUserTypeText(currentUser.userType)" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="currentUser.email" disabled />
        </el-form-item>
        <el-form-item label="注册时间">
          <el-input v-model="currentUser.createTime" disabled />
        </el-form-item>
        <el-form-item label="最后登录">
          <el-input v-model="currentUser.lastLogin" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
            {{ currentUser.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const router = useRouter()

const searchForm = ref({
  userType: '',
  username: '',
  status: ''
})

const userList = ref([
  {
    id: 1,
    username: 'admin001',
    userType: 'admin',
    email: 'admin001@edunexus.com',
    createTime: '2024-01-10 09:30:25',
    lastLogin: '2024-01-15 14:20:18',
    status: 'active'
  },
  {
    id: 2,
    username: 'company123',
    userType: 'enterprise',
    email: 'contact@company123.com',
    createTime: '2024-01-12 11:15:30',
    lastLogin: '2024-01-15 10:05:42',
    status: 'active'
  },
  {
    id: 3,
    username: 'university456',
    userType: 'university',
    email: 'admin@university456.edu',
    createTime: '2024-01-08 16:45:12',
    lastLogin: '2024-01-14 08:30:55',
    status: 'disabled'
  }
])

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)
const userDialogVisible = ref(false)
const currentUser = ref({})

const goBack = () => {
  router.back()
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchUserList()
}

const resetSearch = () => {
  searchForm.value = {
    userType: '',
    username: '',
    status: ''
  }
  pagination.value.currentPage = 1
  fetchUserList()
}

const fetchUserList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.value.total = userList.value.length
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchUserList()
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
  fetchUserList()
}

const viewUser = (user) => {
  currentUser.value = { ...user }
  userDialogVisible.value = true
}

const toggleUserStatus = async (user) => {
  try {
    const action = user.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}用户 "${user.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟状态切换
    user.status = user.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`用户已${action}`)
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const exportUsers = () => {
  ElMessage.success('导出功能开发中')
}

const getUserTypeTag = (type) => {
  const tags = {
    'enterprise': 'success',
    'university': 'warning',
    'admin': 'danger'
  }
  return tags[type] || 'info'
}

const getUserTypeText = (type) => {
  const texts = {
    'enterprise': '企业用户',
    'university': '高校用户',
    'admin': '管理员'
  }
  return texts[type] || '未知类型'
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>