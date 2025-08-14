import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import photoService from '@/services/photo.service'
import type { Photo } from '@/types/photo'
import { toRaw } from 'vue'


export const usePhotoStore = defineStore('photo', {
    state: () => ({
        photos: [] as Photo[],
        currentPhoto: null as Photo | null,
        loading: false,
        pagination: {
            current: 1,
            pageSize: 36,
            total: 0
        }
    }),

    getters: {
        getPhotos: (state) => state.photos,
        getCurrentPhoto: (state) => state.currentPhoto,
        isLoading: (state) => state.loading,
        getPagination: (state) => state.pagination
    },

    actions: {
        // 获取相册照片列表
        async fetchPhotosByAlbum(albumId : number, append = false) {
            try {
                this.loading = true
                const response = await photoService.getPhotosByAlbum(albumId, this.pagination.current, this.pagination.pageSize)
                
                if (response.status === 200) {
                    const data = response.data 
                    if(data.length) {
                        if (append) {
                            this.photos = [...this.photos, ...data]
                        } else {
                            this.photos = data
                        }
                    }
                } else {
                    ElMessage.error('获取照片列表失败')
                }
            } catch (error) {
                console.error('获取照片列表失败:', error)
                ElMessage.error('获取照片列表失败')
            } finally {
                this.loading = false
            }
        },

        // 上传照片
        async uploadPhotos(albumId: number, photos: string[]) {
            try {
                this.loading = true
                const response = await photoService.uploadPhotos(albumId, photos)
                
                if (response.status === 200) {
                    ElMessage.success('照片上传成功')
                    // 重新获取照片列表
                    await this.fetchPhotosByAlbum(albumId)
                    return true
                } else {
                    ElMessage.error('照片上传失败')
                    return false
                }
            } catch (error) {
                console.error('照片上传失败:', error)
                ElMessage.error('照片上传失败')
                return false
            } finally {
                this.loading = false
            }
        },

        // 更新照片信息
        async updatePhoto(photoData: Partial<Photo>) {
            try {
                this.loading = true
                const response = await photoService.updatePhoto(photoData)
                
                if (response.status === 200) {
                    ElMessage.success('照片更新成功')
                    // 更新本地状态
                    const index = this.photos.findIndex(p => p.id === photoData.id)
                    if (index !== -1) {
                        this.photos[index] = { ...this.photos[index], ...photoData }
                    }
                    return true
                } else {
                    ElMessage.error('照片更新失败')
                    return false
                }
            } catch (error) {
                console.error('照片更新失败:', error)
                ElMessage.error('照片更新失败')
                return false
            } finally {
                this.loading = false
            }
        },

        // 删除单张照片
        async deletePhoto(photoId: number) {
            try {
                this.loading = true
                const response = await photoService.deletePhoto(photoId)
                
                if (response.status === 200) {
                    ElMessage.success('照片删除成功')
                    // 从本地状态中移除
                    this.photos = this.photos.filter(p => p.id !== photoId)
                    this.pagination.total -= 1
                    return true
                } else {
                    ElMessage.error('照片删除失败')
                    return false
                }
            } catch (error) {
                console.error('照片删除失败:', error)
                ElMessage.error('照片删除失败')
                return false
            } finally {
                this.loading = false
            }
        },

        // 批量删除照片
        async deletePhotos(photoIds: number[]) {
            try {
                this.loading = true
                const response = await photoService.deletePhotos(photoIds)
                
                if (response.status === 200) {
                    ElMessage.success(`成功删除 ${photoIds.length} 张照片`)
                    // 从本地状态中移除
                    this.photos = this.photos.filter(p => !photoIds.includes(p.id))
                    this.pagination.total -= photoIds.length
                    return true
                } else {
                    ElMessage.error('批量删除失败')
                    return false
                }
            } catch (error) {
                console.error('批量删除失败:', error)
                ElMessage.error('批量删除失败')
                return false
            } finally {
                this.loading = false
            }
        },

        // 设置当前查看的照片
        setCurrentPhoto(photo: Photo | null) {
            this.currentPhoto = photo
        },

        // 清空照片列表
        clearPhotos() {
            this.photos = []
            this.currentPhoto = null
            this.pagination = {
                current: 1,
                pageSize: 20,
                total: 0
            }
        }
    }
})