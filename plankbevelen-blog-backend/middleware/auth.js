import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

// 验证JWT token的中间件
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
    }

    try {
        const decoded = userService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: '无效的访问令牌'
        });
    }
};

// 可选认证中间件（不强制要求token）
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = userService.verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // 如果token无效，不阻止请求，但不设置用户信息
            console.log('Optional auth failed:', error.message);
        }
    }
    
    next();
};

// 验证刷新token的中间件
export const authenticateRefreshToken = (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: '刷新令牌缺失'
        });
    }

    try {
        const decoded = userService.verifyRefreshToken(refreshToken);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: '无效的刷新令牌'
        });
    }
};