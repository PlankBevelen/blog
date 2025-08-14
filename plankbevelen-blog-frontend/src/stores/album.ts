import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { albumService } from '@/services/album.service'
import type {
    Album,
    CreateAlbumRequest,
    UpdateAlbumRequest,
    AlbumListResponse

} from '@/types/album'

export const useAlbumStore = defineStore('album', {
    state: () => ({
        albums: [] as Album[],  
        albumDetail: {} as Album,
    }),
    getters: {
        getAlbums: (state) => state.albums,
    },
    actions: {
        async fetchAllAlbums() {
            try {
                const res = await albumService.getAllAlbums()
                this.albums = res.data
            } catch (error) {
                ElMessage.error('获取相册失败')
            }
        },

        async createAlbum(albumData: CreateAlbumRequest) {
            try {
                const res = await albumService.createAlbum(albumData)
                if (res.status === 200) {
                    ElMessage.success('创建相册成功')
                    this.albums.push({id: res.data.insertId, ...albumData, 
                        photos_count: 0, views_count: 0, is_featured: false, is_private: false,
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                        preview_images: [] as string[],
                        user_id: res.data.user_id
                    })
                } else {
                    ElMessage.error('创建相册失败')
                }
            } catch (error) {
                ElMessage.error('创建相册失败')
            }
        },

        async updateAlbum(albumData: UpdateAlbumRequest) {
            try {
                const res = await albumService.updateAlbum(albumData)
                if (res.status === 200) {
                    ElMessage.success('更新相册成功')
                } else {
                    ElMessage.error('更新相册失败')
                }
            } catch (error) {
                ElMessage.error('更新相册失败')
            }
        },

        async deleteAlbum(albumId: number) {
            try {
                const res = await albumService.deleteAlbum(albumId)
                if (res.status === 200) {
                    ElMessage.success('删除相册成功')
                } else {
                    ElMessage.error('删除相册失败')
                }
            } catch (error) {
                ElMessage.error('删除相册失败')
            }
        },

        async fetchAlbumDetail(albumId: number) {
            try {
                const res = await albumService.getAlbumDetail(albumId)
                if (res.status === 200) {
                    this.albumDetail = res.data[0]

                    ElMessage.success('获取相册详情成功')
                } else {
                    ElMessage.error('获取相册详情失败')
                }
            } catch (error) {
                ElMessage.error('获取相册详情失败')
            }
        }

    }
})