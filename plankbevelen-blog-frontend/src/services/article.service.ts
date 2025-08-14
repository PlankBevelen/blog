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
    async getArticleDetail(id: number) {
        return http.post('/article/detail', { id })
    }
    async updateViewsCount(id: number) {
        return http.post('/article/views', { id })
    }
    
    // 评论相关方法
    async getComments(articleId: number) {
        return http.post('/article/comments', { article_id: articleId })
    }
    
    async addComment(articleId: number, content: string, parentId?: number, replyToUserId?: number) {
        return http.post('/article/comment/add', {
            article_id: articleId,
            content,
            parent_id: parentId || null,
            reply_to_user_id: replyToUserId || null
        })
    }
    
    async deleteComment(commentId: number) {
        return http.post('/article/comment/delete', { id: commentId })
    }
    
    // 评分相关方法
    async rateArticle(ratingData: any) {
        return await http.post('/article/rate', ratingData)
    }

    async getUserRating(articleId: number) {
        return await http.post('/article/rating', { articleId })
    }

    async getTopArticle() {
        return await http.get('/article/top')
    }
}

export default new ArticleService();