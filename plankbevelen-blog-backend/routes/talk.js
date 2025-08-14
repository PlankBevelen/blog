import express from 'express';
import talkService from '../services/talkService.js';
import { authenticateToken } from '../middleware/auth.js';

const talkRouter = express.Router();

// 获取全部说说
talkRouter.post('/all', async (req, res) => {
    try {
        const talks = await talkService.getAll();
        console.log(talks);

        res.status(200).json(talks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 创建说说
talkRouter.post('/create', authenticateToken, async (req, res) => {
    try {
        const talkData = {
            ...req.body,
            user_id: req.user.userId
        };
        const talk = await talkService.create(talkData);
        res.json(talk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 获取已发布的说说列表
talkRouter.get('/published', async (req, res) => {
    try {
        const talks = await talkService.getPublishedTalks();
        res.status(200).json(talks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 更新说说
talkRouter.post('/update', authenticateToken, async (req, res) => {
    try {
        const { id, talk } = req.body;
        const updatedTalk = await talkService.update(id, talk);
        console.log(updatedTalk);
        res.status(200).json(updatedTalk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 删除说说
talkRouter.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTalk = await talkService.delete(Number(id));
        console.log(deletedTalk);
        res.status(200).json(deletedTalk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 点赞
talkRouter.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const { id, type } = req.body;
        const likeData = {
            id,
            type,
            user_id: req.user.userId
        };
        const talk = await talkService.toggle(likeData);
        res.status(200).json(talk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 获取评论列表
talkRouter.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await talkService.getComments(Number(id));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 添加评论
talkRouter.post('/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parent_id, reply_to_user_id } = req.body;
        const commentData = {
            talk_id: Number(id),
            user_id: req.user.userId,
            content,
            parent_id: parent_id || null,
            reply_to_user_id: reply_to_user_id || null
        };
        
        const comment = await talkService.addComment(commentData);
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 删除评论
talkRouter.delete('/:talkId/comment/:commentId', authenticateToken, async (req, res) => {
    try {
        const { talkId, commentId } = req.params;
        const result = await talkService.deleteComment(Number(commentId), Number(talkId));
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// 获取用户对说说的点赞状态
talkRouter.post('/:id/like-status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const result = await talkService.getUserLikeStatus(Number(id), userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export default talkRouter;


