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

    // 点赞
    async like(id: number) {
        return http.post(`/talk/${id}/like`)
    }

    // 取消点赞
    async unlike(id: number) {
        return http.post(`/talk/${id}/unlike`)
    }

    // 评论
    async comment(id: number, comment: string) {
        return http.post(`/talk/${id}/comment`, { comment })
    }

    // 删除评论
    async deleteComment(id: number) {
        return http.delete(`/talk/${id}/comment`)
    }
}

export default new TalkService()