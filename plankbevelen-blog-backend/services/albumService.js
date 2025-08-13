import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pool } from '../pool/index.js';

class AlbumService {
    // 获取相册列表
    async getAllAlbums() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM albums';
            pool.query(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
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
}       

export default new AlbumService();