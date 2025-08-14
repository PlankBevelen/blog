import { defineStore } from 'pinia'
import type { UserInfo, UserState } from '@/types/user'
import { cookie } from '@/utils/cookie'
import http from '@/utils/http-common'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'

export const useUserStore = defineStore('user', {
    state: () : UserState => ({
        isLoggedIn: false,
        userInfo: null,
        token: null,
        refreshToken: null
    }),

    getters: {
        // 获取用户头像
        userAvatar: (state) => {
            return state.userInfo?.avatar || '/default-avatar.svg'
        },
        // 用户昵称
        userName: (state) => {
            return state.userInfo?.nickname || '未登录'
        },
    },
    actions : {
        // 初始化用户态
        async initUserState() {
            try {
                const token = cookie.get('token')
                const refreshToken = cookie.get('refreshToken')
                const userInfo = cookie.get('userInfo')
                const rememberMe = cookie.get('rememberMe')

                this.token = token || null
                this.refreshToken = refreshToken || null
                this.userInfo = (userInfo && userInfo !== 'undefined') ? JSON.parse(userInfo) : null
                
                // 如果有token但没有userInfo，尝试获取用户信息
                if (token && refreshToken && !userInfo) {
                    const result = await this.fetchUserProfile()
                    if (result.success) {
                        this.isLoggedIn = true
                        console.log('用户信息获取成功，登录状态已恢复')
                    } else {
                        console.log('用户信息获取失败，清除无效token')
                        this.logout()
                    }
                } else {
                    this.isLoggedIn = !!(token && refreshToken && userInfo)
                }
                
            } catch (error) {
                console.error('初始化用户态失败', error)
                // 重置状态
                this.isLoggedIn = false
                this.token = null
                this.refreshToken = null
                this.userInfo = null
            }
        },

        // 创建用户
        createUser(userInfo: UserInfo) {
            this.userInfo = userInfo
            this.isLoggedIn = true
        },
        
        // 用户登录
        async login(email: string, password: string, rememberMe: boolean = false) {
            try {
                const response = await http.post('/user/login', {
                    email,
                    password
                })
                
                if (response.data.success) {
                    const { userInfo, token, refreshToken } = response.data.data
                    
                    // 更新状态
                    this.userInfo = userInfo
                    this.token = token
                    this.refreshToken = refreshToken
                    this.isLoggedIn = true
                    console.log("登陆成功")
                    // 保存到cookie
                    // 如果记住我，设置7天过期；否则设置1天过期（避免会话cookie在刷新时丢失）
                    const cookieOptions: Cookies.CookieAttributes = rememberMe ? 
                        { expires: 7, sameSite: 'lax', secure: false } : 
                        { expires: 1, sameSite: 'lax', secure: false }
                    cookie.set('token', token, cookieOptions)
                    cookie.set('refreshToken', refreshToken, cookieOptions)
                    cookie.set('userInfo', JSON.stringify(userInfo), cookieOptions)
                    cookie.set('rememberMe', rememberMe.toString(), cookieOptions)
                    
                    console.log('登录成功，已保存cookie:', {
                        token: token ? '已设置' : '未设置',
                        refreshToken: refreshToken ? '已设置' : '未设置',
                        userInfo: userInfo ? '已设置' : '未设置',
                        rememberMe: rememberMe.toString()
                    })
                    
                    return { success: true, message: '登录成功' }
                } else {
                    throw new Error(response.data.message || '登录失败')
                }
            } catch (error: any) {
                console.error('登录失败:', error)
                const message = error.response?.data?.message || error.message || '登录失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },
        
        // 用户注册
        async register(nickname: string, email: string, password: string) {
            try {
                const response = await http.post('/user/register', {
                    nickname,
                    email,
                    password
                })
                
                if (response.data.success) {
                    return { success: true, message: '注册成功' }
                } else {
                    throw new Error(response.data.message || '注册失败')
                }
            } catch (error: any) {
                console.error('注册失败:', error)
                const message = error.response?.data?.message || error.message || '注册失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },
        
        // 用户登出
        logout() {
            this.userInfo = null
            this.token = null
            this.refreshToken = null
            this.isLoggedIn = false
            
            // 清除cookie
            cookie.remove('token')
            cookie.remove('refreshToken')
            cookie.remove('userInfo')
            cookie.remove('rememberMe')
            
            ElMessage.success('已退出登录')
        },

        // 获取用户信息
        async fetchUserProfile() {
            try {
                const response = await http.get('/user/profile')
                
                if (response.data.success) {
                     this.userInfo = response.data.data
                    // 更新cookie中的用户信息，保持原有的过期时间设置
                    const rememberMe = cookie.get('rememberMe') === 'true'
                    const cookieOptions: Cookies.CookieAttributes = rememberMe ? 
                        { expires: 7, sameSite: 'lax', secure: false } : 
                        { expires: 1, sameSite: 'lax', secure: false }
                    cookie.set('userInfo', JSON.stringify(this.userInfo), cookieOptions)
                    return { success: true, data: response.data.data }
                } else {
                    throw new Error(response.data.message || '获取用户信息失败')
                }
            } catch (error: any) {
                console.error('获取用户信息失败:', error)
                const message = error.response?.data?.message || error.message || '获取用户信息失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },

        // 更新用户信息
        async updateProfile(profileData: { nickname: string; flink?: string; flink_bio?: string }) {
            try {
                const response = await http.put('/user/profile', profileData)
                
                if (response.data.success) {
                    // 重新获取用户信息
                    await this.fetchUserProfile()
                    ElMessage.success('个人信息更新成功')
                    return { success: true, message: '个人信息更新成功' }
                } else {
                    throw new Error(response.data.message || '更新失败')
                }
            } catch (error: any) {
                console.error('更新用户信息失败:', error)
                const message = error.response?.data?.message || error.message || '更新失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },

        // 更新用户头像
        async updateAvatar(avatar: string) {
            try {
                const response = await http.put('/user/avatar', { avatar })
                
                if (response.data.success) {
                    // 重新获取用户信息
                    await this.fetchUserProfile()
                    ElMessage.success('头像更新成功')
                    return { success: true, message: '头像更新成功' }
                } else {
                    throw new Error(response.data.message || '头像更新失败')
                }
            } catch (error: any) {
                console.error('头像更新失败:', error)
                const message = error.response?.data?.message || error.message || '头像更新失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },

        // 修改密码
        async changePassword(currentPassword: string, newPassword: string) {
            try {
                const response = await http.put('/user/password', {
                    currentPassword,
                    newPassword
                })
                
                if (response.data.success) {
                    ElMessage.success('密码修改成功')
                    return { success: true, message: '密码修改成功' }
                } else {
                    throw new Error(response.data.message || '密码修改失败')
                }
            } catch (error: any) {
                console.error('密码修改失败:', error)
                const message = error.response?.data?.message || error.message || '密码修改失败'
                ElMessage.error(message)
                return { success: false, message }
            }
        },

        // 刷新token
        async refreshAccessToken() {
            try {
                if (!this.refreshToken) {
                    throw new Error('刷新令牌不存在')
                }
                
                const response = await http.post('/user/refresh-token', {
                    refreshToken: this.refreshToken
                })
                
                if (response.data.success) {
                    this.token = response.data.data.token
                    this.refreshToken = response.data.data.refreshToken
                    
                    // 更新cookie
                    if (this.token) {
                        cookie.set('token', this.token)
                    }
                    if (this.refreshToken) {
                        cookie.set('refreshToken', this.refreshToken)
                    }
                    
                    return { success: true }
                } else {
                    throw new Error(response.data.message || '刷新令牌失败')
                }
            } catch (error: any) {
                console.error('刷新令牌失败:', error)
                // 刷新失败，清除所有认证信息
                this.logout()
                return { success: false, message: '登录已过期，请重新登录' }
            }
        }
    }
})