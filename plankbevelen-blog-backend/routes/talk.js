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



export default talkRouter;


