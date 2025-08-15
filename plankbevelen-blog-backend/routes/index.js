import express from "express";
import userRouter from './user.js';
import talkRouter from "./talk.js";
import articleRouter from "./article.js";
import albumRouter from "./album.js";
import photoRouter from "./photo.js";
import messageRouter from "./message.js";

const router = express.Router();

router.use('/user', userRouter);
router.use('/talk', talkRouter);
router.use('/article', articleRouter);
router.use('/album', albumRouter);
router.use('/photo', photoRouter);
router.use('/message', messageRouter);

// 健康检查接口
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});


export default router;