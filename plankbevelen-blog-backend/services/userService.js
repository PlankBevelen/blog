import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../pool/index.js';

class UserService {
    // 生成JWT token
    generateToken(userId, email) {
        const payload = {
            userId,
            email,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'plankbevelen_blog_jwt_secret_key', {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
        
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'plankbevelen_blog_refresh_secret_key', {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        });
        
        return { token, refreshToken };
    }
    
    // 验证密码
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // 加密密码
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    
    // 验证JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'plankbevelen_blog_jwt_secret_key');
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    
    // 验证刷新token
    verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'plankbevelen_blog_refresh_secret_key');
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    
    // 根据邮箱或用户名查找用户
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, nickname, email, password, avatar, created_at, last_login
                FROM users 
                WHERE email = ? 
            `;
            console.log(email);
            
            pool.query(query, [email], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }
    
    // 更新最后登录时间
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
            
            pool.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    }
    
    // 用户登录
    async login(email, password) {
        try {
            // 查找用户
            const user = await this.findUserByEmail(email);
            if (!user) {
                return {
                    success: false,
                    message: '用户不存在'
                };
            }
            
            // 验证密码
            const isPasswordValid = await this.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: '密码错误'
                };
            }
            
            // 生成token
            const { token, refreshToken } = this.generateToken(user.id, user.email);
            
            // 更新最后登录时间
            await this.updateLastLogin(user.id);
            
            // 返回用户信息（不包含密码）
            const { password: _, ...userInfo } = user;
            
            return {
                success: true,
                message: '登录成功',
                data: {
                    user: userInfo,
                    token,
                    refreshToken
                }
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '登录失败，请稍后重试'
            };
        }
    }
    
    // 用户注册
    async register(nickname, email, password) {
        try {
            // 检查邮箱是否已存在
            const existingEmail = await this.findUserByEmail(email);
            if (existingEmail) {
                throw new Error('邮箱已被注册');
            }
            
            // 加密密码
            const hashedPassword = await this.hashPassword(password);
            
            // 创建用户
            const userId = await this.createUser(nickname, email, hashedPassword);
            
            return {
                success: true,
                message: '注册成功',
                data: {
                    userId
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    // 创建用户
    async createUser(nickname, email, hashedPassword) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO users (nickname, email, password) 
                VALUES (?, ?, ?)
            `;
            
            pool.query(query, [nickname, email, hashedPassword], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.insertId);
            });
        });
    }
    
    // 刷新token
    async refreshToken(refreshToken) {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);
            const { token, refreshToken: newRefreshToken } = this.generateToken(decoded.userId, decoded.email);
            
            return {
                success: true,
                data: {
                    token,
                    refreshToken: newRefreshToken
                }
            };
        } catch (error) {
            return {
                success: false,
                message: '刷新token失败'
            };
        }
    }

    // 根据用户ID获取用户信息
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, nickname, email, avatar, flink, flink_bio, flink_cover, created_at, last_login
                FROM users 
                WHERE id = ? 
            `;
            
            pool.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    // 更新用户信息
    async updateUserProfile(userId, profileData) {
        try {
            const { nickname, flink, flink_bio } = profileData;
            
            return new Promise((resolve, reject) => {
                const query = `
                    UPDATE users 
                    SET nickname = ?, flink = ?, flink_bio = ?
                    WHERE id = ?
                `;
                
                pool.query(query, [nickname, flink, flink_bio, userId], (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });
        } catch (error) {
            throw error;
        }
    }

    // 更新用户头像
    async updateUserAvatar(userId, avatar) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET avatar = ? WHERE id = ?';
            
            pool.query(query, [JSON.stringify(avatar), userId], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    }

    // 修改密码
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // 先获取用户当前密码
            const user = await new Promise((resolve, reject) => {
                const query = 'SELECT password FROM users WHERE id = ?';
                pool.query(query, [userId], (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results.length > 0 ? results[0] : null);
                });
            });

            if (!user) {
                return {
                    success: false,
                    message: '用户不存在'
                };
            }

            // 验证当前密码
            const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return {
                    success: false,
                    message: '当前密码错误'
                };
            }

            // 加密新密码
            const hashedNewPassword = await this.hashPassword(newPassword);

            // 更新密码
            await new Promise((resolve, reject) => {
                const query = 'UPDATE users SET password = ? WHERE id = ?';
                pool.query(query, [hashedNewPassword, userId], (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            return {
                success: true,
                message: '密码修改成功'
            };
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: '密码修改失败，请稍后重试'
            };
        }
    }
}

export default new UserService();