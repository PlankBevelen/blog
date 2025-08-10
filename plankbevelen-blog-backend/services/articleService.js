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
}

export default new ArticleService();

