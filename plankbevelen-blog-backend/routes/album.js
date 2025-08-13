import express from 'express';
import albumService from '../services/albumService.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// 获取所有相册
router.post('/', async (req, res) => {
    try {
        const albums = await albumService.getAllAlbums()
        res.status(200).json(albums)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 创建相册
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const albumData = {
            ...req.body,
            cover: JSON.stringify(req.body.cover),
            user_id: req.user.userId
        }
        const album = await albumService.createAlbum(albumData)
        res.status(200).json(album)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 更新相册
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const albumData = {
            ...req.body,
            cover: JSON.stringify(req.body.cover),
            user_id: req.user.userId
        }
        const album = await albumService.updateAlbum(albumData)
        res.status(200).json(album)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 删除相册
router.post('/delete', authenticateToken, async (req, res) => {
    try {
        const { album_id } = req.body
        const album = await albumService.deleteAlbum(album_id)
        res.status(200).json(album)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

export default router;