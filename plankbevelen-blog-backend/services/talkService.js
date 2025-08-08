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
    // 点赞切换
    async toggle(likeData) {
        return new Promise((resolve, reject) => {
            // 首先检查用户是否已经有点赞记录
            pool.query('SELECT * FROM talk_likes WHERE talk_id = ? AND user_id = ?', [likeData.id, likeData.user_id], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (result.length === 0) {
                    // 用户没有点赞记录，创建新的点赞记录
                    pool.query('INSERT INTO talk_likes (talk_id, user_id, is_like) VALUES (?, ?, 1)', [likeData.id, likeData.user_id], (err, insertResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            // 增加说说的点赞数
                            pool.query('UPDATE talks SET likes_count = likes_count + 1 WHERE id = ?', likeData.id, (err, updateResult) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ action: 'liked', result: updateResult });
                                }
                            });
                        }
                    });
                } else {
                    // 用户已有记录，切换点赞状态
                    const currentLike = result[0];
                    const newLikeStatus = currentLike.is_like === 1 ? 0 : 1;
                    
                    pool.query('UPDATE talk_likes SET is_like = ? WHERE talk_id = ? AND user_id = ?', [newLikeStatus, likeData.id, likeData.user_id], (err, updateLikeResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            // 根据新状态更新说说的点赞数
                            const countChange = newLikeStatus === 1 ? 1 : -1;
                            pool.query('UPDATE talks SET likes_count = likes_count + ? WHERE id = ?', [countChange, likeData.id], (err, updateResult) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    const action = newLikeStatus === 1 ? 'liked' : 'unliked';
                                    resolve({ action, result: updateResult });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // 获取说说的评论列表
    async getComments(talkId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c.*, u.nickname, u.avatar, ru.nickname as reply_to_nickname
                FROM talk_comments c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN users ru ON c.reply_to_user_id = ru.id
                WHERE c.talk_id = ? AND c.status = 'active'
                ORDER BY c.created_at ASC
            `;
            pool.query(sql, [talkId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // 添加评论
    async addComment(commentData) {
        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO talk_comments SET ?', commentData, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    // 更新说说的评论数量
                    pool.query('UPDATE talks SET comments_count = comments_count + 1 WHERE id = ?', commentData.talk_id, (err, updateResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: result.insertId, ...commentData });
                        }
                    });
                }
            });
        });
    }

    // 删除评论
    async deleteComment(commentId, talkId) {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE talk_comments SET status = "deleted" WHERE id = ?', commentId, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    // 更新说说的评论数量
                    pool.query('UPDATE talks SET comments_count = comments_count - 1 WHERE id = ?', talkId, (err, updateResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        });
    }       
}

export default new TalkService();
