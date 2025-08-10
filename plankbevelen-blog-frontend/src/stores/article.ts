import http from '@/utils/http-common'
import { cookie } from '@/utils/cookie'
import { defineStore } from 'pinia'
import type { ArticleCategory, ArticleCreateRequest, ArticleEntity } from '@/types/article'
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
        }
    }
})
