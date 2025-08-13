// 相册类型定义
export interface Album {
    id: number
    name: string
    description?: string
    cover?: string
    preview_images?: string[]
    photos_count: number
    views_count: number

    is_featured: boolean
    is_private: boolean
    created_at: string
    updated_at: string
}

// 照片类型定义
export interface Photo {
    id: number
    name: string
    url: string
    thumbnail_url?: string
    size: number
    width: number
    height: number
    description?: string
    tags?: string[]
    album_id: number
    created_at: string
    updated_at: string
}

// 创建相册请求类型
export interface CreateAlbumRequest {
    id?: number
    name: string
    description?: string
    cover?: string
    is_private?: boolean
}

// 更新相册请求类型
export interface UpdateAlbumRequest {
    id: number
    name?: string
    description?: string
    cover?: string
    is_private?: boolean
}

// 上传照片请求类型
export interface UploadPhotoRequest {
    album_id: number
    files: File[]
    description?: string
    tags?: string[]
}



// 相册查询参数类型
export interface AlbumQueryParams {
    page?: number
    pageSize?: number
    category_id?: number | null
    sort_by?: 'latest' | 'oldest' | 'most_photos' | 'recent_update'
    is_featured?: boolean
    search?: string
}

// 照片查询参数类型
export interface PhotoQueryParams {
    album_id: number
    page?: number
    pageSize?: number
    sort_by?: 'latest' | 'oldest' | 'name' | 'size'
}

// API响应类型
export interface AlbumListResponse {
    albums: Album[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface PhotoListResponse {
    photos: Photo[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface AlbumStatsResponse {
    total_albums: number
    total_photos: number
    total_views: number
}