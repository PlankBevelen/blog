import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import messageService from '../services/messageService.js';

const messageRouter = express.Router();

// 获取所有留言
messageRouter.get('/', async (req, res) => {
    try {
        const messages = await messageService.getAll();
        res.json({
            status: 200,
            data: messages,
            message: '获取留言列表成功'
        });
    } catch (error) {
        console.error('获取留言列表失败:', error);
        res.status(500).json({
            status: 500,
            message: '获取留言列表失败'
        });
    }
});

// 获取最新留言（用于滚动显示）
messageRouter.get('/latest', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const messages = await messageService.getLatest(limit);
        res.json({
            status: 200,
            data: messages,
            message: '获取最新留言成功'
        });
    } catch (error) {
        console.error('获取最新留言失败:', error);
        res.status(500).json({
            status: 500,
            message: '获取最新留言失败'
        });
    }
});

// 添加留言
messageRouter.post('/', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.userId;
        
        if (!content || !content.trim()) {
            return res.status(400).json({
                status: 400,
                message: '留言内容不能为空'
            });
        }
        
        const newMessage = await messageService.create(user_id, content);
        res.json({
            status: 200,
            data: newMessage,
            message: '留言发送成功'
        });
    } catch (error) {
        console.error('添加留言失败:', error);
        res.status(500).json({
            status: 500,
            message: '留言发送失败'
        });
    }
});

// 删除留言
messageRouter.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const success = await messageService.delete(id);
        
        if (success) {
            res.json({
                status: 200,
                message: '留言删除成功'
            });
        } else {
            res.status(404).json({
                status: 404,
                message: '留言不存在'
            });
        }
    } catch (error) {
        console.error('删除留言失败:', error);
        res.status(500).json({
            status: 500,
            message: '删除留言失败'
        });
    }
});

export default messageRouter;


