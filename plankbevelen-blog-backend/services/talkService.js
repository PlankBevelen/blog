import { pool } from '../pool/index.js';

class TalkService {
    // 获取全部说说
    async getAll() {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM talks', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    // 创建说说
    async create(talk) {
        const talkData = {
            ...talk,
            images: JSON.stringify(talk.images || []),
        };        
        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO talks SET ?', talkData, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    
    // 获取已发布的说说列表
    async getPublishedTalks() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT t.*, u.nickname, u.avatar 
                FROM talks t 
                LEFT JOIN users u ON t.user_id = u.id 
                WHERE t.status = 'published' 
                ORDER BY t.create_at DESC
            `;
            pool.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    
    // 更新说说
    async update(id, talk) {
        const talkData = {
            ...talk,
            images: JSON.stringify(talk.images || []),
        };
        return new Promise((resolve, reject) => {
            pool.query('UPDATE talks SET ? WHERE id = ?', [talkData, id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    // 删除说说
    async delete(id) {
        return new Promise((resolve, reject) => {
            pool.query('DELETE FROM talks WHERE id = ?', id, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

}

export default new TalkService();
