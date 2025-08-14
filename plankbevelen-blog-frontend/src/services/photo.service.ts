import http from "@/utils/http-common";
import type { PhotoQueryParams } from '@/types/album'

class PhotoService {
    // 获取相册照片列表
    async getPhotosByAlbum(albumId: number, page: number, pageSize: number) {
        return http.post('/photo/list', { album_id: albumId, page, page_size: pageSize })
    }

    // 上传照片
    async uploadPhotos(albumId: number, photos: string[]) {
        return http.post('/photo/upload', { album_id: albumId, photos })
    }

    // 更新照片信息
    async updatePhoto(photoData: any) {
        return http.post('/photo/update', photoData)
    }

    // 删除单张照片
    async deletePhoto(photoId: number) {
        return http.post('/photo/delete', { photo_id: photoId })
    }

    // 批量删除照片
    async deletePhotos(photoIds: number[]) {
        return http.post('/photo/delete/batch', { photo_ids: photoIds })
    }
}

export default new PhotoService()
