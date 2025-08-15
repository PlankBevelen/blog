import { defineStore } from 'pinia'
import type { TalkEntity, TalkCreateRequest, Comment } from '@/types/talk'
import talkService from '@/services/talk.service'

export const useTalkStore = defineStore('talk', {
    state: () => ({
        talks: [] as TalkEntity[],
        publishedTalks: [] as TalkEntity[],
        comments: {} as Record<number, Comment[]>, // 按talk_id存储评论
        likeStatus: {} as Record<number, boolean>, // 按talk_id存储点赞状态
        loading: false,
        error: null as string | null,
    }),

    getters: {
        getTalkById: (state) => (id: number) => {
            return state.talks.find(talk => talk.id === id) || 
                   state.publishedTalks.find(talk => talk.id === id)
        },

        getCommentsByTalkId: (state) => (talkId: number) => {
            return state.comments[talkId] || []
        },

        getLikeStatusByTalkId: (state) => (talkId: number) => {
            return state.likeStatus[talkId] || false
        },

        getTotalCommentsCount: (state) => {
            return state.publishedTalks.reduce((total, talk) => total + talk.comments_count, 0)
        },

        getTotalLikesCount: (state) => {
            return state.publishedTalks.reduce((total, talk) => total + talk.likes_count, 0)
        },
    },

    actions: {
        // 获取全部说说
        async fetchAllTalks() {
            this.loading = true
            this.error = null
            try {
                const response = await talkService.getAll()
                if (response.status === 200) {
                    this.talks = response.data
                    return response.data
                } else {
                    this.error = '获取说说失败'
                    return []
                }
            } catch (error) {
                this.error = '获取说说失败'
                console.error('Error fetching all talks:', error)
                return []
            } finally {
                this.loading = false
            }
        },

        // 获取已发布的说说
        async fetchPublishedTalks() {
            this.loading = true
            this.error = null
            try {
                const response = await talkService.getPublished()
                if (response.status === 200) {
                    this.publishedTalks = response.data
                    return response.data
                } else {
                    this.error = '获取已发布说说失败'
                    return []
                }
            } catch (error) {
                this.error = '获取已发布说说失败'
                console.error('Error fetching published talks:', error)
                return []
            } finally {
                this.loading = false
            }
        },

        // 创建说说
        async createTalk(talk: TalkCreateRequest) {
            this.loading = true
            this.error = null
            try {
                const response = await talkService.create(talk)
                if (response.status === 200) {
                    // 重新获取说说列表
                    await this.fetchAllTalks()
                    return true
                } else {
                    this.error = '创建说说失败'
                    return false
                }
            } catch (error) {
                this.error = '创建说说失败'
                console.error('Error creating talk:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        // 删除说说
        async deleteTalk(id: number) {
            this.loading = true
            this.error = null
            try {
                const response = await talkService.delete(id)
                if (response.status === 200) {
                    // 从本地状态中移除
                    this.talks = this.talks.filter(talk => talk.id !== id)
                    this.publishedTalks = this.publishedTalks.filter(talk => talk.id !== id)
                    // 清理相关的评论和点赞状态
                    delete this.comments[id]
                    delete this.likeStatus[id]
                    return true
                } else {
                    this.error = '删除说说失败'
                    return false
                }
            } catch (error) {
                this.error = '删除说说失败'
                console.error('Error deleting talk:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        // 更新说说
        async updateTalk(id: number, talk: TalkCreateRequest) {
            this.loading = true
            this.error = null
            try {
                const response = await talkService.update(id, talk)
                if (response.status === 200) {
                    // 重新获取说说列表
                    await this.fetchAllTalks()
                    return true
                } else {
                    this.error = '更新说说失败'
                    return false
                }
            } catch (error) {
                this.error = '更新说说失败'
                console.error('Error updating talk:', error)
                return false
            } finally {
                this.loading = false
            }
        },

        // 切换点赞状态
        async toggleLike(id: number, type: 'like' | 'unlike') {
            try {
                const response = await talkService.toggle(id, type)
                if (response.status === 200) {
                    // 更新本地状态
                    this.likeStatus[id] = type === 'like'
                    
                    // 更新说说的点赞数
                    const updateTalkLikes = (talks: TalkEntity[]) => {
                        const talk = talks.find(t => t.id === id)
                        if (talk) {
                            talk.likes_count = type === 'like' ? talk.likes_count + 1 : talk.likes_count - 1
                        }
                    }
                    
                    updateTalkLikes(this.talks)
                    updateTalkLikes(this.publishedTalks)
                    
                    return true
                } else {
                    this.error = '操作失败'
                    return false
                }
            } catch (error) {
                this.error = '操作失败'
                console.error('Error toggling like:', error)
                return false
            }
        },

        // 点赞
        async likeTalk(id: number) {
            return await this.toggleLike(id, 'like')
        },

        // 取消点赞
        async unlikeTalk(id: number) {
            return await this.toggleLike(id, 'unlike')
        },

        // 获取评论列表
        async fetchComments(talkId: number) {
            try {
                const response = await talkService.getComments(talkId)
                if (response.status === 200) {
                    this.comments[talkId] = response.data
                    return response.data
                } else {
                    this.error = '获取评论失败'
                    return []
                }
            } catch (error) {
                this.error = '获取评论失败'
                console.error('Error fetching comments:', error)
                return []
            }
        },

        // 添加评论
        async addComment(talkId: number, content: string, parentId?: number, replyToUserId?: number) {
            try {
                const response = await talkService.addComment(talkId, content, parentId, replyToUserId)
                if (response.status === 200) {
                    // 重新获取评论列表
                    await this.fetchComments(talkId)
                    
                    // 更新说说的评论数
                    const updateTalkComments = (talks: TalkEntity[]) => {
                        const talk = talks.find(t => t.id === talkId)
                        if (talk) {
                            talk.comments_count += 1
                        }
                    }
                    
                    updateTalkComments(this.talks)
                    updateTalkComments(this.publishedTalks)
                    
                    return response.data
                } else {
                    this.error = '添加评论失败'
                    return null
                }
            } catch (error) {
                this.error = '添加评论失败'
                console.error('Error adding comment:', error)
                return null
            }
        },

        // 删除评论
        async deleteComment(talkId: number, commentId: number) {
            try {
                const response = await talkService.deleteComment(talkId, commentId)
                if (response.status === 200) {
                    // 从本地状态中移除评论
                    if (this.comments[talkId]) {
                        const deletedComment = this.comments[talkId].find(c => c.id === commentId)
                        this.comments[talkId] = this.comments[talkId].filter(c => c.id !== commentId)
                        
                        // 如果删除的是父评论，还需要删除其子评论
                        if (deletedComment && !deletedComment.parent_id) {
                            this.comments[talkId] = this.comments[talkId].filter(c => c.parent_id !== commentId)
                        }
                    }
                    
                    // 更新说说的评论数
                    const updateTalkComments = (talks: TalkEntity[]) => {
                        const talk = talks.find(t => t.id === talkId)
                        if (talk) {
                            talk.comments_count = Math.max(0, talk.comments_count - 1)
                        }
                    }
                    
                    updateTalkComments(this.talks)
                    updateTalkComments(this.publishedTalks)
                    
                    return true
                } else {
                    this.error = '删除评论失败'
                    return false
                }
            } catch (error) {
                this.error = '删除评论失败'
                console.error('Error deleting comment:', error)
                return false
            }
        },

        // 获取用户对说说的点赞状态
        async fetchLikeStatus(talkId: number) {
            try {
                const response = await talkService.getLikeStatus(talkId)
                if (response.status === 200) {
                    this.likeStatus[talkId] = response.data.liked
                    return response.data.liked
                } else {
                    return false
                }
            } catch (error) {
                console.error('Error fetching like status:', error)
                return false
            }
        },

        // 清除错误状态
        clearError() {
            this.error = null
        },

        // 重置store状态
        resetStore() {
            this.talks = []
            this.publishedTalks = []
            this.comments = {}
            this.likeStatus = {}
            this.loading = false
            this.error = null
        },
    },
})