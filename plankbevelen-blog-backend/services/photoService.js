import { pool } from '../pool/index.js';

class PhotoService {
    async getPhotosByAlbum(albumId, page, pageSize) {
        return new Promise((resolve, reject) => {
            // 获取从 page * pageSize 开始的 pageSize 条数据
            // 分页查询
            const query = 'SELECT * FROM album_photos WHERE album_id = ? LIMIT ? OFFSET ?';
            pool.query(query, [albumId, pageSize, (page - 1) * pageSize], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }
    async uploadPhotos(uploadData) {
        const { album_id, photos } = uploadData;
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO album_photos(album_id, photo) VALUES ?';
            pool.query(query, [photos.map(photo => [album_id, JSON.stringify(photo)])], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    }

    // 删除单张照片
    async deletePhoto(photoId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM album_photos WHERE id = ?';
            pool.query(query, [photoId], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve({ success: true, affectedRows: result.affectedRows });
                }
            });
        });
    }

    // 批量删除照片
    async deletePhotos(photoIds) {
        return new Promise((resolve, reject) => {
            if (!photoIds || photoIds.length === 0) {
                resolve({ success: true, affectedRows: 0 });
                return;
            }
            
            const query = 'DELETE FROM album_photos WHERE id IN (?)';
            pool.query(query, [photoIds], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve({ success: true, affectedRows: result.affectedRows });
                }
            });
        });
    }
}

export default new PhotoService();

