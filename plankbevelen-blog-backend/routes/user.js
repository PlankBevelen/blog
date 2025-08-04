import express from 'express';
import userService from '../services/userService.js';
import { authenticateToken } from '../middleware/auth.js';

import jwt from 'jsonwebtoken';

const userRouter = express.Router();

// 注册
userRouter.post('/register', async (req, res) => {
    const { nickname, email, password } = req.body;
    const result = await userService.register(nickname, email, password);
    res.status(result.success ? 200 : 400).json(result);
});

// 登录
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    const result = await userService.login(email, password);
    res.status(result.success ? 200 : 400).json(result);
});

// 获取当前用户信息
userRouter.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: '获取用户信息失败'
        });
    }
});

// 更新用户信息
userRouter.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { nickname, flink, flink_bio } = req.body;
        
        // 验证必填字段
        if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
            return res.status(400).json({
                success: false,
                message: '昵称长度必须在2-20个字符之间'
            });
        }
        
        await userService.updateUserProfile(req.user.userId, {
            nickname: nickname.trim(),
            flink: flink ? flink.trim() : null,
            flink_bio: flink_bio ? flink_bio.trim() : null
        });
        
        res.json({
            success: true,
            message: '用户信息更新成功'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: '更新用户信息失败'
        });
    }
});

// 更新用户头像
userRouter.put('/avatar', authenticateToken, async (req, res) => {
    try {
        const { avatar } = req.body;
        
        if (!avatar) {
            return res.status(400).json({
                success: false,
                message: '头像数据不能为空'
            });
        }
        
        await userService.updateUserAvatar(req.user.userId, avatar);
        
        res.json({
            success: true,
            message: '头像更新成功'
        });
    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({
            success: false,
            message: '头像更新失败'
        });
    }
});

// 修改密码
userRouter.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // 验证输入
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '当前密码和新密码不能为空'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '新密码长度不能少于6位'
            });
        }
        
        // 验证密码强度
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: '新密码必须包含大小写字母和数字'
            });
        }
        
        const result = await userService.changePassword(req.user.userId, currentPassword, newPassword);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: '修改密码失败'
        });
    }
});

// 刷新token
userRouter.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: '刷新令牌不能为空'
            });
        }
        
        const result = await userService.refreshToken(refreshToken);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: '刷新令牌失败'
        });
    }
});

export default userRouter;


