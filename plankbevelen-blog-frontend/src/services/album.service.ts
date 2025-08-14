import http from '@/utils/http-common'

import type {
    CreateAlbumRequest,
    UpdateAlbumRequest
} from '@/types/album'

export class AlbumService {
    async getAllAlbums() {
        return http.post('/album') 
    }
    async getAlbumDetail(albumId: number) {
        return http.post('/album/detail', { album_id: albumId })
    }
    async createAlbum(albumData: CreateAlbumRequest) {
        return http.post('/album/create', albumData)
    }
    async updateAlbum(albumData: UpdateAlbumRequest) {
        return http.post('/album/update', albumData)
    }
    async deleteAlbum(albumId: number) {
        return http.post('/album/delete', { album_id: albumId })
    }
}

export const albumService = new AlbumService()