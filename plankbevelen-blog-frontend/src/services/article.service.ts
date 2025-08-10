import http from "@/utils/http-common"
import type { ArticleCreateRequest } from "@/types/article"

class ArticleService {
    async getAllCategory() {
        return http.post('/article/category/all')
    }
    async publishArticle(data: ArticleCreateRequest) {
        return http.post('/article/publish', data)
    }
    async toggleTop(id: number, is_top: boolean) {
        return http.post('/article/top', { id, is_top })
    }
    async getAllArticle() {
        return http.post('/article/all')
    }
    async getPublishedArticle() {
        return http.post('/article/published')
    }
    async updateArticle(data: ArticleCreateRequest) {
        return http.post('/article/update', data)
    }
    async deleteArticle(id: number) {
        return http.post('/article/delete', { id })
    }
}

export default new ArticleService();