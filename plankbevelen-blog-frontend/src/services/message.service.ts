import http from "@/utils/http-common"

class MessageService {
    // 获取所有留言
    async getAll() {
        return await http.get('/message')
    }
    
    // 获取最新留言（用于滚动显示）
    async getLatest(limit: number = 10) {
        return await http.get(`/message/latest?limit=${limit}`)
    }
    
    // 创建留言
    async create(content: string) {
        return await http.post('/message', content)
    }
    
    // 删除留言
    async delete(id: number) {
        return await http.delete(`/message/${id}`)
    }
}

export default new MessageService();