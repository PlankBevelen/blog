import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pool } from '../pool/index.js';

class AlbumService {
    // 获取相册列表
    async getAlbums(params = {}) {
        const {
            page = 1,
            size = 12,
            category_id = null,
            keyword = null,
            sort_by = 'created_at',
            is_featured = null
        } = params;

        const offset = (page - 1) * size;
        let whereConditions = [];
        let queryParams = [];

        // 构建查询条件
        if (category_id) {
            whereConditions.push('a.category_id = ?');
            queryParams.push(category_id);
        }

        if (keyword) {
            whereConditions.push('(a.name LIKE ? OR a.description LIKE ?)');
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (is_featured !== null) {
            whereConditions.push('a.is_featured = ?');
            queryParams.push(is_featured);
        }

        // 只显示公开的相册
        whereConditions.push('a.is_private = 0');

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // 排序
        let orderBy = 'a.created_at DESC';
        switch (sort_by) {
            case 'name':
                orderBy = 'a.name ASC';
                break;
            case 'views':
                orderBy = 'a.views DESC';
                break;

            case 'photo_count':
                orderBy = 'a.photo_count DESC';
                break;
            case 'updated_at':
                orderBy = 'a.updated_at DESC';
                break;
        }

        // 查询相册列表
        const albumQuery = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name,
                (
                    SELECT GROUP_CONCAT(p.thumbnail_url ORDER BY p.created_at DESC LIMIT 3)
                    FROM album_photos p 
                    WHERE p.album_id = a.id
                ) as preview_images
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        // 查询总数
        const countQuery = `
            SELECT COUNT(*) as total
            FROM albums a
            ${whereClause}
        `;

        const albums = await pool.promise().query(albumQuery, [...queryParams, size, offset]);
        const countResult = await pool.promise().query(countQuery, queryParams);
        const total = countResult[0].total;

        // 处理预览图片
        albums.forEach(album => {
            if (album.preview_images) {
                album.preview_images = album.preview_images.split(',').filter(img => img);
            } else {
                album.preview_images = [];
            }
        });

        return {
            albums,
            pagination: {
                page,
                size,
                total,
                pages: Math.ceil(total / size)
            }
        };
    }

    // 获取相册详情
    async getAlbumById(albumId) {
        const query = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `;

        const result = await pool.promise().query(query, [albumId]);
        return result[0] || null;
    }

    // 获取相册照片列表
    async getAlbumPhotos(albumId, params = {}) {
        const {
            page = 1,
            size = 20,
            sort_by = 'created_at'
        } = params;

        const offset = (page - 1) * size;

        // 排序
        let orderBy = 'created_at DESC';
        switch (sort_by) {
            case 'name':
                orderBy = 'filename ASC';
                break;
            case 'size':
                orderBy = 'size DESC';
                break;
            case 'taken_at':
                orderBy = 'taken_at DESC';
                break;
        }

        // 查询照片列表
        const photoQuery = `
            SELECT *
            FROM album_photos
            WHERE album_id = ?
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        // 查询总数
        const countQuery = `
            SELECT COUNT(*) as total
            FROM album_photos
            WHERE album_id = ?
        `;

        const photos = await pool.promise().query(photoQuery, [albumId, size, offset]);
        const countResult = await pool.promise().query(countQuery, [albumId]);
        const total = countResult[0].total;

        return {
            photos,
            pagination: {
                page,
                size,
                total,
                pages: Math.ceil(total / size)
            }
        };
    }

    // 获取相册分类
    async getAlbumCategories() {
        const query = 'SELECT * FROM album_categories ORDER BY sort_order ASC, name ASC';
        return await pool.promise().query(query);
    }

    // 创建相册
    async createAlbum(albumData) {
        const { name, description, category_id, is_private, user_id } = albumData;
        
        const query = `
            INSERT INTO albums (name, description, category_id, is_private, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const result = await pool.promise().query(query, [name, description, category_id, is_private, user_id]);
        return result.insertId;
    }

    // 更新相册
    async updateAlbum(albumId, albumData) {
        const { name, description, category_id, is_private } = albumData;
        
        const query = `
            UPDATE albums 
            SET name = ?, description = ?, category_id = ?, is_private = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await pool.promise().query(query, [name, description, category_id, is_private, albumId]);
    }

    // 删除相册
    async deleteAlbum(albumId) {
        // 开始事务
        await pool.promise().query('START TRANSACTION');
        
        try {
            // 获取相册中的所有照片
            const photos = await pool.promise().query('SELECT * FROM album_photos WHERE album_id = ?', [albumId]);
            
            // 删除物理文件
            for (const photo of photos) {
                try {
                    if (fs.existsSync(photo.file_path)) {
                        fs.unlinkSync(photo.file_path);
                    }
                    if (photo.thumbnail_path && fs.existsSync(photo.thumbnail_path)) {
                        fs.unlinkSync(photo.thumbnail_path);
                    }
                } catch (error) {
                    console.error('删除文件失败:', error);
                }
            }
            
            // 删除照片记录
            await pool.promise().query('DELETE FROM album_photos WHERE album_id = ?', [albumId]);
            
            // 删除相册
            await pool.promise().query('DELETE FROM albums WHERE id = ?', [albumId]);
            
            await pool.promise().query('COMMIT');
        } catch (error) {
            await pool.promise().query('ROLLBACK');
            throw error;
        }
    }

    // 增加浏览量
    async incrementViews(albumId) {
        const query = 'UPDATE albums SET views = views + 1 WHERE id = ?';
        await pool.promise().query(query, [albumId]);
    }



    // 上传照片
    async uploadPhotos(albumId, files, descriptions = []) {
        const photoIds = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const description = descriptions[i] || '';
            
            const query = `
                INSERT INTO album_photos (
                    album_id, filename, original_name, file_path, url, thumbnail_url,
                    description, size, width, height, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const url = `/uploads/albums/${file.filename}`;
            const thumbnailUrl = `/uploads/albums/thumbnails/${file.filename}`;
            
            const result = await pool.promise().query(query, [
                albumId,
                file.filename,
                file.originalname,
                file.path,
                url,
                thumbnailUrl,
                description,
                file.size,
                0, // width - 需要图片处理库来获取
                0  // height - 需要图片处理库来获取
            ]);
            
            photoIds.push(result.insertId);
        }
        
        // 更新相册照片数量
        await this.updateAlbumPhotoCount(albumId);
        
        return photoIds;
    }

    // 删除照片
    async deletePhoto(photoId) {
        // 获取照片信息
        const photo = await pool.promise().query('SELECT * FROM album_photos WHERE id = ?', [photoId]);
        if (photo.length === 0) {
            throw new Error('照片不存在');
        }
        
        const photoData = photo[0];
        
        // 删除物理文件
        try {
            if (fs.existsSync(photoData.file_path)) {
                fs.unlinkSync(photoData.file_path);
            }
            if (photoData.thumbnail_path && fs.existsSync(photoData.thumbnail_path)) {
                fs.unlinkSync(photoData.thumbnail_path);
            }
        } catch (error) {
            console.error('删除文件失败:', error);
        }
        
        // 删除数据库记录
        await pool.promise().query('DELETE FROM album_photos WHERE id = ?', [photoId]);
        
        // 更新相册照片数量
        await this.updateAlbumPhotoCount(photoData.album_id);
    }

    // 设置相册封面
    async setAlbumCover(albumId, photoId) {
        // 获取照片URL
        const photo = await pool.promise().query('SELECT url FROM album_photos WHERE id = ? AND album_id = ?', [photoId, albumId]);
        if (photo.length === 0) {
            throw new Error('照片不存在');
        }
        
        const coverImage = photo[0].url;
        
        // 更新相册封面
        await pool.promise().query('UPDATE albums SET cover_image = ? WHERE id = ?', [coverImage, albumId]);
    }

    // 更新相册照片数量
    async updateAlbumPhotoCount(albumId) {
        const countResult = await pool.promise().query('SELECT COUNT(*) as count FROM album_photos WHERE album_id = ?', [albumId]);
        const photoCount = countResult[0].count;
        
        await pool.promise().query('UPDATE albums SET photo_count = ? WHERE id = ?', [photoCount, albumId]);
    }

    // 生成下载链接
    async generateDownloadUrl(albumId, photoIds) {
        // 这里应该生成一个临时的下载链接
        // 实际项目中可能需要创建压缩包并返回下载链接
        const timestamp = Date.now();
        const downloadToken = `${albumId}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 可以将下载任务存储到数据库或缓存中
        // 这里简化处理，直接返回一个模拟的下载链接
        return `/api/albums/${albumId}/download/${downloadToken}`;
    }

    // 搜索相册
    async searchAlbums(keyword, params = {}) {
        const { page = 1, size = 12 } = params;
        const offset = (page - 1) * size;
        
        const query = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name,
                (
                    SELECT GROUP_CONCAT(p.thumbnail_url ORDER BY p.created_at DESC LIMIT 3)
                    FROM album_photos p 
                    WHERE p.album_id = a.id
                ) as preview_images
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.is_private = 0 AND (a.name LIKE ? OR a.description LIKE ?)
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM albums a
            WHERE a.is_private = 0 AND (a.name LIKE ? OR a.description LIKE ?)
        `;
        
        const searchTerm = `%${keyword}%`;
        const albums = await pool.promise().query(query, [searchTerm, searchTerm, size, offset]);
        const countResult = await pool.promise().query(countQuery, [searchTerm, searchTerm]);
        const total = countResult[0].total;
        
        // 处理预览图片
        albums.forEach(album => {
            if (album.preview_images) {
                album.preview_images = album.preview_images.split(',').filter(img => img);
            } else {
                album.preview_images = [];
            }
        });
        
        return {
            albums,
            pagination: {
                page,
                size,
                total,
                pages: Math.ceil(total / size)
            }
        };
    }

    // 获取推荐相册
    async getRecommendedAlbums(limit = 6) {
        const query = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name,
                (
                    SELECT GROUP_CONCAT(p.thumbnail_url ORDER BY p.created_at DESC LIMIT 3)
                    FROM album_photos p 
                    WHERE p.album_id = a.id
                ) as preview_images
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.is_private = 0 AND a.is_featured = 1
            ORDER BY a.views DESC
            LIMIT ?
        `;
        
        const albums = await pool.promise().query(query, [limit]);
        
        // 处理预览图片
        albums.forEach(album => {
            if (album.preview_images) {
                album.preview_images = album.preview_images.split(',').filter(img => img);
            } else {
                album.preview_images = [];
            }
        });
        
        return albums;
    }

    // 获取热门相册
    async getPopularAlbums(limit = 6) {
        const query = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name,
                (
                    SELECT GROUP_CONCAT(p.thumbnail_url ORDER BY p.created_at DESC LIMIT 3)
                    FROM album_photos p 
                    WHERE p.album_id = a.id
                ) as preview_images
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.is_private = 0
            ORDER BY a.views DESC
            LIMIT ?
        `;
        
        const albums = await pool.promise().query(query, [limit]);
        
        // 处理预览图片
        albums.forEach(album => {
            if (album.preview_images) {
                album.preview_images = album.preview_images.split(',').filter(img => img);
            } else {
                album.preview_images = [];
            }
        });
        
        return albums;
    }

    // 获取最新相册
    async getLatestAlbums(limit = 6) {
        const query = `
            SELECT 
                a.*,
                ac.name as category_name,
                u.nickname as author_name,
                (
                    SELECT GROUP_CONCAT(p.thumbnail_url ORDER BY p.created_at DESC LIMIT 3)
                    FROM album_photos p 
                    WHERE p.album_id = a.id
                ) as preview_images
            FROM albums a
            LEFT JOIN album_categories ac ON a.category_id = ac.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.is_private = 0
            ORDER BY a.created_at DESC
            LIMIT ?
        `;
        
        const albums = await pool.promise().query(query, [limit]);
        
        // 处理预览图片
        albums.forEach(album => {
            if (album.preview_images) {
                album.preview_images = album.preview_images.split(',').filter(img => img);
            } else {
                album.preview_images = [];
            }
        });
        
        return albums;
    }
}

export default new AlbumService();