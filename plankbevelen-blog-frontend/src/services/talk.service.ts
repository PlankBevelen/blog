import http from "@/utils/http-common"
import type { TalkEntity, TalkCreateRequest } from "@/types/talk"


class TalkService {
    // 获取全部说说
    async getAll() {
        return http.post('/talk/all')
    }

    // 获取已发布的说说
    async getPublished() {
        return http.get('/talk/published')
    }

    // 创建
    async create(talk: TalkCreateRequest) {
        return http.post('/talk/create', talk)
    }

    // 删除
    async delete(id: number) {
        return http.delete(`/talk/delete/${id}`)
    }

    // 更新
    async update(id: number, talk: TalkCreateRequest) {
        return http.post(`/talk/update`, { id, talk })
    }

    // 点赞切换
    async toggle(id: number, type: 'like' | 'unlike') {
        return http.post(`/talk/toggle`, { id, type })
    }

    // 点赞
    async like(id: number) {
        return http.post(`/talk/toggle`, { id, type: 'like' })
    }

    // 取消点赞
    async unlike(id: number) {
        return http.post(`/talk/toggle`, { id, type: 'unlike' })
    }

    // 获取评论列表
    async getComments(id: number) {
        return http.get(`/talk/${id}/comments`)
    }

    // 添加评论
    async addComment(id: number, content: string, parentId?: number, replyToUserId?: number) {
        return http.post(`/talk/${id}/comment`, { 
            content, 
            parent_id: parentId, 
            reply_to_user_id: replyToUserId 
        })
    }

    // 删除评论
    async deleteComment(talkId: number, commentId: number) {
        return http.delete(`/talk/${talkId}/comment/${commentId}`)
    }

    // 评论（保持兼容性）
    async comment(id: number, comment: string) {
        return this.addComment(id, comment)
    }
}

export default new TalkService()