import { pool } from "../pool/index.js";

class ArticleService {
    async getAllCategory() {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM article_categories', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async publishArticle(articleData) {
        return new Promise((resolve, reject) => {
            const { title, summary, content, cover, category_id, user_id, status, is_top, tags } = articleData;
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    // 插入文章
                    connection.query(
                        'INSERT INTO articles (title, summary, content, cover, category_id, user_id, status, is_top, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [title, summary, content, JSON.stringify(cover), category_id, user_id, status, is_top, JSON.stringify(tags)],
                        (err, articleResult) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            // 更新分类计数
                            connection.query(
                                'UPDATE article_categories SET article_count = article_count + 1 WHERE id = ?',
                                [category_id],
                                (err, categoryResult) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }

                                    // 提交事务
                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }

                                        connection.release();
                                        // 返回文章插入的结果，包含新文章的ID
                                        resolve({
                                            insertId: articleResult.insertId,
                                            affectedRows: articleResult.affectedRows
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            });
        });
    }

    async getAllArticle(user_id) {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM articles WHERE user_id = ?', [user_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async getAllPublishedArticle() {
        return new Promise((resolve, reject) => {
            // 综合排序
            pool.query("SELECT * FROM articles WHERE status = 'published'  \
                ORDER BY is_top DESC, views_count DESC, comments_count DESC, average_score DESC", (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async toggleTop(id, is_top) {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE articles SET is_top = ? WHERE id = ?', [is_top, id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async getTopArticle() {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM articles WHERE is_top = 1 ORDER BY views_count DESC, comments_count DESC, average_score DESC', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }


    async updateArticle(articleData) {
        return new Promise((resolve, reject) => {
            const { id, title, category_id, summary, content, cover, tags, status, is_top } = articleData;
            console.log(id, title, category_id, summary, content, tags, status, is_top)

            pool.query(
                'UPDATE articles SET title = ?, summary = ?, content = ?, cover = ?, category_id = ?, status = ?, is_top = ?, tags = ?, updated_at = ? WHERE id = ?',
                [title, summary, content, JSON.stringify(cover), category_id, status, is_top, JSON.stringify(tags), new Date(), id],
                (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err);
                    } else {
                        console.log(result)

                        resolve(result);
                    }
                }
            )
        })
    }

    async deleteArticle(id) {
        return new Promise((resolve, reject) => {
            /* pool.query('DELETE FROM articles WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }) */
           pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                connection.query("UPDATE article_categories SET article_count = article_count - 1 WHERE id = (SELECT category_id FROM articles WHERE id = ?)", [id], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            reject(err);
                        });
                    }
                    connection.query("DELETE FROM articles WHERE id = ?", [id], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(err);
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }
                            connection.release();
                            resolve(result);
                        });
                    });
                });
              });
           })
        })
    }

    async getArticleDetail(id) {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM articles WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async updateViewsCount(id) {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE articles SET views_count = views_count + 1 WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    // 评论相关方法
    async getComments(articleId) {
        return new Promise((resolve, reject) => {
            pool.query(`
                SELECT ac.*, u.nickname, u.avatar,
                       ru.nickname as reply_to_nickname
                FROM article_comments ac
                LEFT JOIN users u ON ac.user_id = u.id
                LEFT JOIN users ru ON ac.reply_to_user_id = ru.id
                WHERE ac.article_id = ?
                ORDER BY ac.created_at ASC
            `, [articleId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async addComment(commentData) {
        return new Promise((resolve, reject) => {
            const { article_id, user_id, content, parent_id, reply_to_user_id } = commentData;
            
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    // 插入评论
                    connection.query(
                        'INSERT INTO article_comments (article_id, user_id, content, parent_id, reply_to_user_id) VALUES (?, ?, ?, ?, ?)',
                        [article_id, user_id, content, parent_id, reply_to_user_id],
                        (err, commentResult) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            // 更新文章评论数
                            connection.query(
                                'UPDATE articles SET comments_count = comments_count + 1 WHERE id = ?',
                                [article_id],
                                (err, updateResult) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }

                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }

                                        connection.release();
                                        resolve({
                                            id: commentResult.insertId,
                                            affectedRows: commentResult.affectedRows
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            });
        })
    }

    async deleteComment(commentId, userId) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    // 首先获取评论信息，验证权限
                    connection.query(
                        'SELECT article_id, user_id FROM article_comments WHERE id = ?',
                        [commentId],
                        (err, commentResult) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            if (commentResult.length === 0) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(new Error('评论不存在'));
                                });
                            }

                            const comment = commentResult[0];
                            if (comment.user_id !== userId) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(new Error('无权限删除此评论'));
                                });
                            }

                            // 递归删除评论及其回复
                            const deleteCommentAndReplies = (id) => {
                                return new Promise((resolve, reject) => {
                                    // 先删除所有回复
                                    connection.query(
                                        'SELECT id FROM article_comments WHERE parent_id = ?',
                                        [id],
                                        (err, replies) => {
                                            if (err) {
                                                reject(err);
                                                return;
                                            }

                                            const deletePromises = replies.map(reply => deleteCommentAndReplies(reply.id));
                                            Promise.all(deletePromises)
                                                .then(() => {
                                                    // 删除评论本身
                                                    connection.query(
                                                        'DELETE FROM article_comments WHERE id = ?',
                                                        [id],
                                                        (err, result) => {
                                                            if (err) {
                                                                reject(err);
                                                            } else {
                                                                resolve(result);
                                                            }
                                                        }
                                                    );
                                                })
                                                .catch(reject);
                                        }
                                    );
                                });
                            };

                            deleteCommentAndReplies(commentId)
                                .then(() => {
                                    // 更新文章评论数（需要重新计算）
                                    connection.query(
                                        'UPDATE articles SET comments_count = (SELECT COUNT(*) FROM article_comments WHERE article_id = ?) WHERE id = ?',
                                        [comment.article_id, comment.article_id],
                                        (err, updateResult) => {
                                            if (err) {
                                                return connection.rollback(() => {
                                                    connection.release();
                                                    reject(err);
                                                });
                                            }

                                            connection.commit((err) => {
                                                if (err) {
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        reject(err);
                                                    });
                                                }

                                                connection.release();
                                                resolve({ message: '删除成功' });
                                            });
                                        }
                                    );
                                })
                                .catch((err) => {
                                    connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                });
                        }
                    );
                });
            });
        })
    }

    // 评分相关方法
    async rateArticle(ratingData) {
        return new Promise((resolve, reject) => {
            const { article_id, user_id, score } = ratingData;
            
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    // 检查用户是否已经评分过
                    connection.query(
                        'SELECT id FROM article_ratings WHERE article_id = ? AND user_id = ?',
                        [article_id, user_id],
                        (err, existingRating) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            if (existingRating.length > 0) {
                                // 更新现有评分
                                connection.query(
                                    'UPDATE article_ratings SET score = ? WHERE article_id = ? AND user_id = ?',
                                    [score, article_id, user_id],
                                    (err, updateResult) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }

                                        this.updateArticleAverageScore(connection, article_id)
                                            .then(() => {
                                                connection.commit((err) => {
                                                    if (err) {
                                                        return connection.rollback(() => {
                                                            connection.release();
                                                            reject(err);
                                                        });
                                                    }

                                                    connection.release();
                                                    resolve({ message: '评分更新成功' });
                                                });
                                            })
                                            .catch((err) => {
                                                connection.rollback(() => {
                                                    connection.release();
                                                    reject(err);
                                                });
                                            });
                                    }
                                );
                            } else {
                                // 插入新评分
                                connection.query(
                                    'INSERT INTO article_ratings (article_id, user_id, score) VALUES (?, ?, ?)',
                                    [article_id, user_id, score],
                                    (err, insertResult) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }

                                        this.updateArticleAverageScore(connection, article_id)
                                            .then(() => {
                                                connection.commit((err) => {
                                                    if (err) {
                                                        return connection.rollback(() => {
                                                            connection.release();
                                                            reject(err);
                                                        });
                                                    }

                                                    connection.release();
                                                    resolve({ 
                                                        id: insertResult.insertId,
                                                        message: '评分成功'
                                                    });
                                                });
                                            })
                                            .catch((err) => {
                                                connection.rollback(() => {
                                                    connection.release();
                                                    reject(err);
                                                });
                                            });
                                    }
                                );
                            }
                        }
                    );
                });
            });
        })
    }

    async updateArticleAverageScore(connection, articleId) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE articles SET average_score = (SELECT AVG(score) FROM article_ratings WHERE article_id = ?) WHERE id = ?',
                [articleId, articleId],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    async getUserRating(articleId, userId) {
        return new Promise((resolve, reject) => {
            pool.query(
                'SELECT * FROM article_ratings WHERE article_id = ? AND user_id = ?',
                [articleId, userId],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0 ? result[0] : null);
                    }
                }
            );
        })
    }
}

export default new ArticleService();

