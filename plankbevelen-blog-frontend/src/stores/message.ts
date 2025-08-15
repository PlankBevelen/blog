import { defineStore } from "pinia"
import messageService from "@/services/message.service"
import type { MessageEntity } from "@/types/message"

export const useMessageStore = defineStore('message', {
    state: () => ({
        messages: [] as MessageEntity[],
        scrollingMessages: [] as MessageEntity[],
        loading: false,
        error: null as string | null
    }),
    
    getters: {
        getMessageById: (state) => (id: number) => {
            return state.messages.find(message => message.id === id)
        },
        getLatestMessages: (state) => {
            return state.scrollingMessages.slice(0, 10)
        }
    },
    
    actions: {
        // 获取所有留言
        async fetchAllMessages() {
            this.loading = true
            this.error = null
            try {
                const response = await messageService.getAll()
                if (response.status === 200) {
                    this.messages = response.data
                }
            } catch (error) {
                this.error = '获取留言失败'
                console.error('获取留言失败:', error)
            } finally {
                this.loading = false
            }
        },
        
        // 获取最新留言（用于滚动显示）
        async fetchLatestMessages(limit: number = 10) {
            try {
                const response = await messageService.getLatest(limit)
                if (response.status === 200) {
                    this.scrollingMessages = response.data.data
                }
            } catch (error) {
                console.error('获取最新留言失败:', error)
            }
        },
        
        // 创建留言
        async createMessage(content: string) {
            this.loading = true
            this.error = null
            try {
                const response = await messageService.create(content) 
                console.log(response)
                if (response.status === 200) {
                    // 添加到消息列表
                    this.messages.unshift(response.data as MessageEntity)
                    this.scrollingMessages.unshift(response.data as MessageEntity)
                    return response.data
                }
            } catch (error) {
                this.error = '发送留言失败'
                console.error('发送留言失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        // 删除留言
        async deleteMessage(id: number) {
            this.loading = true
            this.error = null
            try {
                const response = await messageService.delete(id)
                if (response.status === 200) {
                    // 从消息列表中移除
                    this.messages = this.messages.filter(message => message.id !== id)
                    this.scrollingMessages = this.scrollingMessages.filter(message => message.id !== id)
                    return true
                }
                return false
            } catch (error) {
                this.error = '删除留言失败'
                console.error('删除留言失败:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        // 清除错误
        clearError() {
            this.error = null
        },
        
        // 重置store
        resetStore() {
            this.messages = []
            this.scrollingMessages = []
            this.loading = false
            this.error = null
        }
    }
})
