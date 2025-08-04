import express from "express";
import userRouter from './user.js';

import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.use('/user', userRouter);

// 健康检查接口
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});


export default router;