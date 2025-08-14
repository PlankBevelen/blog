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
}

export default new PhotoService();

