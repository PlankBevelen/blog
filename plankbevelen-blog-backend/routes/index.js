import express from "express";
import userRouter from './user.js';
import talkRouter from "./talk.js";
import articleRouter from "./article.js";

const router = express.Router();

router.use('/user', userRouter);
router.use('/talk', talkRouter);
router.use('/article', articleRouter);

// 健康检查接口
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});


export default router;