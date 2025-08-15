import {pool} from '../pool/index.js';

class MessageService {
    // 获取所有留言
    async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT m.*, u.nickname, u.avatar 
                FROM messages m 
                LEFT JOIN users u ON m.user_id = u.id 
                WHERE m.status = 'active' 
                ORDER BY m.created_at DESC
            `;
            
            pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // 获取最新留言（用于滚动显示）
    async getLatest(limit = 10) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT m.*, u.nickname, u.avatar 
                FROM messages m 
                LEFT JOIN users u ON m.user_id = u.id 
                WHERE m.status = 1
                ORDER BY m.created_at DESC 
                LIMIT ?
            `;
            
            pool.query(query, [limit], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // 添加留言
    async create(user_id, content) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO messages (user_id, content, created_at) 
                VALUES (?, ?, NOW())
            `;
            
            pool.query(query, [user_id, content], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    // 顺带要搜索用户信息
                    const userQuery = `
                        SELECT nickname, avatar FROM users WHERE id = ?
                    `;
                    pool.query(userQuery, [user_id], (error, userResults) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({
                                id: results.insertId,
                                user_id,
                                content,
                                nickname: userResults[0].nickname,
                                avatar: userResults[0].avatar,
                                status: 1
                            });
                        }
                    });
                }
            });
        });
    }

    // 删除留言（软删除）
    async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE messages SET status = "deleted" WHERE id = ?';
            
            pool.query(query, [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }
}

export default new MessageService();
