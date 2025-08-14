import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pool } from '../pool/index.js';

class AlbumService {
    // 获取相册列表
    async getAllAlbums() {
        return new Promise((resolve, reject) => {
            // 首先获取所有相册
            const albumQuery = 'SELECT * FROM albums ORDER BY updated_at DESC';
            pool.query(albumQuery, async (err, albums) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                try {
                    // 为每个相册获取前三张预览照片
                    const albumsWithPreviews = await Promise.all(
                        albums.map(async (album) => {
                            return new Promise((resolveAlbum, rejectAlbum) => {
                                const photoQuery = `
                                    SELECT photo 
                                    FROM album_photos 
                                    WHERE album_id = ? 
                                    ORDER BY created_at ASC 
                                    LIMIT 3
                                `;
                                pool.query(photoQuery, [album.id], (photoErr, photos) => {
                                    if (photoErr) {
                                        rejectAlbum(photoErr);
                                    } else {
                                        // 添加预览图片到相册对象
                                        album.preview_images = photos.map(photo => photo.photo);
                                        resolveAlbum(album);
                                    }
                                });
                            });
                        })
                    );
                    
                    resolve(albumsWithPreviews);
                } catch (error) {
                    reject(error);
                }
            });
        })
    }
    // 创建相册
    async createAlbum(albumData) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO albums SET ?';
            pool.query(query, albumData, (err, result) => { 
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }
    // 更新相册
    async updateAlbum(albumData) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE albums SET ? WHERE id = ?';
            pool.query(query, [albumData, albumData.id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }
    // 删除相册
    async deleteAlbum(albumId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM albums WHERE id = ?';
            pool.query(query, [albumId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }
    // 获取相册详情
    async getAlbumDetail(albumId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM albums WHERE id = ?';
            pool.query(query, [albumId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }
}       

export default new AlbumService();