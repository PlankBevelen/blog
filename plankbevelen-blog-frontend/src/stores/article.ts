import http from '@/utils/http-common'
import { cookie } from '@/utils/cookie'
import { defineStore } from 'pinia'
import type { ArticleCategory, ArticleCreateRequest, ArticleEntity, ArticleComment, ArticleRating, RatingRequest } from '@/types/article'
import articleService from '@/services/article.service'

export const useArticleStore = defineStore('article', {
    state: () => ({
        categories: [] as ArticleCategory[],
        all_articles: [] as ArticleCreateRequest[],
        published_articles: [] as ArticleEntity[],
        total: 0,
    }),
    getters: {
        getCategoryNameById: (state) => (id: number) => {
            return state.categories.find((item) => item.id === id)?.name
        },

        getCategoryById: (state) => (id: number) => {
            return state.categories.find((item) => item.id === id)
        },

        getPublishedArticlesTotal: (state) => {
            return state.published_articles.length
        },

        getPopularArticles: (state) => {
            return state.published_articles.sort((a, b) => b.views_count - a.views_count).slice(0, 5)

        },

        getRecentArticles: (state) => {
            return state.published_articles.sort((a, b) => b.id - a.id).slice(0, 5)
        },
    },
    actions: {
        async initArticleStore() {
            if (this.categories.length === 0) {
                await articleService.getAllCategory().then(res => {
                    if (res.status === 200) {
                        this.categories = res.data
                    } else {
                        this.categories = []
                    }
                })
            }
        },

        async fetchAllArticles() {
            await articleService.getAllArticle().then(res => {
                if (res.status === 200) {
                    this.all_articles = res.data
                    this.total = res.data.length
                    console.log(res.data)
                } else {
                    this.all_articles = []
                }
            })
        },

        async fetchPublishedArticles() {
            await articleService.getPublishedArticle().then(res => {
                if (res.status === 200) {
                    this.published_articles = res.data as ArticleEntity[]
                } else {
                    this.published_articles = []
                }
            })
        },

        async updateArticle(article: ArticleCreateRequest) : Promise<Boolean> {
           try {
            const res = await articleService.updateArticle(article)
            if(res.status === 200) {
                return true
            } else {
                return false
            }
           } catch (error) {
            console.log(error)
            return false
           } 
        },

        async publishArticle(data: ArticleCreateRequest) : Promise<number | null> {
            try {
                const res = await articleService.publishArticle(data) 
                if(res.status === 200) {
                    return res.data.insertId
                } else {
                    return null
                }
            } catch (err) {
                console.log(err)
                return null
            }
        },

        async deleteArticle(id: number) : Promise<Boolean> {
            try {
                const res = await articleService.deleteArticle(id)
                if(res.status === 200) {
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        },

        // 更新浏览量
        async updateViewsCount(id: number) : Promise<Boolean> {
            try {
                const res = await articleService.updateViewsCount(id)
                if(res.status === 200) {
                    // 更新数据
                    this.published_articles.forEach(item => {
                        if(item.id === id) {
                            item.views_count++
                        }
                    })
                    this.all_articles.forEach(item => {
                        if(item.id === id) {
                            item.views_count++
                        }
                    })
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        },

        // 评论相关方法
        async getComments(articleId: number): Promise<ArticleComment[]> {
            try {
                const res = await articleService.getComments(articleId)
                if (res.status === 200) {
                    return res.data
                } else {
                    return []
                }
            } catch (error) {
                console.log(error)
                return []
            }
        },

        /* async addComment(commentData: any): Promise<boolean> {
            try {
                const res = await articleService.addComment(commentData)
                if (res.status === 200) {
                    // 更新文章评论数
                    this.published_articles.forEach(item => {
                        if (item.id === commentData.article_id) {
                            item.comments_count++
                        }
                    })
                    this.all_articles.forEach(item => {
                        if (item.id === commentData.article_id) {
                            item.comments_count++
                        }
                    })
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        }, */

        async deleteComment(commentId: number, articleId: number): Promise<boolean> {
            try {
                const res = await articleService.deleteComment(commentId)
                if (res.status === 200) {
                    // 重新获取评论数量（因为删除可能是递归的）
                    const comments = await this.getComments(articleId)
                    const newCount = comments.length
                    
                    // 更新文章评论数
                    this.published_articles.forEach(item => {
                        if (item.id === articleId) {
                            item.comments_count = newCount
                        }
                    })
                    this.all_articles.forEach(item => {
                        if (item.id === articleId) {
                            item.comments_count = newCount
                        }
                    })
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        },

        // 评分相关方法
        async rateArticle(ratingData: RatingRequest): Promise<boolean> {
            try {
                const res = await articleService.rateArticle(ratingData)
                if (res.status === 200) {
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        },

        async getUserRating(articleId: number): Promise<ArticleRating | null> {
            try {
                const res = await articleService.getUserRating(articleId)
                if (res.status === 200 && res.data) {
                    return res.data
                } else {
                    return null
                }
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }
})
