import express from 'express';
import albumService from '../services/albumService.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/albums/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// 获取相册列表
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            size = 12,
            category_id,
            keyword,
            sort_by = 'created_at',
            is_featured
        } = req.query;

        const result = await albumService.getAlbums({
            page: parseInt(page),
            size: parseInt(size),
            category_id: category_id ? parseInt(category_id) : null,
            keyword,
            sort_by,
            is_featured: is_featured ? is_featured === 'true' : null
        });

        res.json({
            code: 200,
            message: '获取成功',
            data: result
        });
    } catch (error) {
        console.error('获取相册列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取相册列表失败',
            data: null
        });
    }
});

// 获取相册详情
router.get('/:id', async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        
        // 验证ID是否为有效数字
        if (isNaN(albumId) || albumId <= 0) {
            return res.status(400).json({
                code: 400,
                message: '无效的相册ID',
                data: null
            });
        }
        
        const album = await albumService.getAlbumById(albumId);
        
        if (!album) {
            return res.status(404).json({
                code: 404,
                message: '相册不存在',
                data: null
            });
        }

        // 增加浏览量
        await albumService.incrementViews(albumId);

        res.json({
            code: 200,
            message: '获取成功',
            data: album
        });
    } catch (error) {
        console.error('获取相册详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取相册详情失败',
            data: null
        });
    }
});

// 获取相册照片列表
router.get('/:id/photos', async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const {
            page = 1,
            size = 20,
            sort_by = 'created_at'
        } = req.query;

        const result = await albumService.getAlbumPhotos(albumId, {
            page: parseInt(page),
            size: parseInt(size),
            sort_by
        });

        res.json({
            code: 200,
            message: '获取成功',
            data: result
        });
    } catch (error) {
        console.error('获取相册照片失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取相册照片失败',
            data: null
        });
    }
});

// 获取相册分类
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await albumService.getAlbumCategories();
        res.json({
            code: 200,
            message: '获取成功',
            data: categories
        });
    } catch (error) {
        console.error('获取相册分类失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取相册分类失败',
            data: null
        });
    }
});

// 创建相册 (需要登录)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, category_id, is_private = false } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                code: 400,
                message: '相册名称不能为空',
                data: null
            });
        }

        const albumId = await albumService.createAlbum({
            name,
            description,
            category_id: parseInt(category_id),
            is_private,
            user_id: userId
        });

        res.json({
            code: 200,
            message: '创建成功',
            data: { id: albumId }
        });
    } catch (error) {
        console.error('创建相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '创建相册失败',
            data: null
        });
    }
});

// 更新相册 (需要登录)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const userId = req.user.id;
        const { name, description, category_id, is_private } = req.body;

        // 检查权限
        const album = await albumService.getAlbumById(albumId);
        if (!album || album.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权限操作此相册',
                data: null
            });
        }

        await albumService.updateAlbum(albumId, {
            name,
            description,
            category_id: category_id ? parseInt(category_id) : null,
            is_private
        });

        res.json({
            code: 200,
            message: '更新成功',
            data: null
        });
    } catch (error) {
        console.error('更新相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '更新相册失败',
            data: null
        });
    }
});

// 删除相册 (需要登录)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const userId = req.user.id;

        // 检查权限
        const album = await albumService.getAlbumById(albumId);
        if (!album || album.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权限操作此相册',
                data: null
            });
        }

        await albumService.deleteAlbum(albumId);

        res.json({
            code: 200,
            message: '删除成功',
            data: null
        });
    } catch (error) {
        console.error('删除相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除相册失败',
            data: null
        });
    }
});



// 上传照片到相册 (需要登录)
router.post('/:id/photos', authenticateToken, upload.array('photos', 10), async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const userId = req.user.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的照片',
                data: null
            });
        }

        // 检查权限
        const album = await albumService.getAlbumById(albumId);
        if (!album || album.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权限操作此相册',
                data: null
            });
        }

        const photoIds = await albumService.uploadPhotos(albumId, files, req.body.descriptions);

        res.json({
            code: 200,
            message: '上传成功',
            data: { photoIds }
        });
    } catch (error) {
        console.error('上传照片失败:', error);
        res.status(500).json({
            code: 500,
            message: '上传照片失败',
            data: null
        });
    }
});

// 删除照片 (需要登录)
router.delete('/:albumId/photos/:photoId', authenticateToken, async (req, res) => {
    try {
        const albumId = parseInt(req.params.albumId);
        const photoId = parseInt(req.params.photoId);
        const userId = req.user.id;

        // 检查权限
        const album = await albumService.getAlbumById(albumId);
        if (!album || album.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权限操作此相册',
                data: null
            });
        }

        await albumService.deletePhoto(photoId);

        res.json({
            code: 200,
            message: '删除成功',
            data: null
        });
    } catch (error) {
        console.error('删除照片失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除照片失败',
            data: null
        });
    }
});

// 设置相册封面 (需要登录)
router.put('/:id/cover', authenticateToken, async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const { photo_id } = req.body;
        const userId = req.user.id;

        // 检查权限
        const album = await albumService.getAlbumById(albumId);
        if (!album || album.user_id !== userId) {
            return res.status(403).json({
                code: 403,
                message: '无权限操作此相册',
                data: null
            });
        }

        await albumService.setAlbumCover(albumId, photo_id);

        res.json({
            code: 200,
            message: '设置成功',
            data: null
        });
    } catch (error) {
        console.error('设置封面失败:', error);
        res.status(500).json({
            code: 500,
            message: '设置封面失败',
            data: null
        });
    }
});

// 批量下载照片
router.post('/:id/download', async (req, res) => {
    try {
        const albumId = parseInt(req.params.id);
        const { photo_ids } = req.body;

        if (!photo_ids || !Array.isArray(photo_ids) || photo_ids.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '请选择要下载的照片',
                data: null
            });
        }

        const downloadUrl = await albumService.generateDownloadUrl(albumId, photo_ids);

        res.json({
            code: 200,
            message: '生成下载链接成功',
            data: { download_url: downloadUrl }
        });
    } catch (error) {
        console.error('生成下载链接失败:', error);
        res.status(500).json({
            code: 500,
            message: '生成下载链接失败',
            data: null
        });
    }
});

// 搜索相册
router.get('/search/query', async (req, res) => {
    try {
        const { keyword, page = 1, size = 12 } = req.query;

        if (!keyword) {
            return res.status(400).json({
                code: 400,
                message: '搜索关键词不能为空',
                data: null
            });
        }

        const result = await albumService.searchAlbums(keyword, {
            page: parseInt(page),
            size: parseInt(size)
        });

        res.json({
            code: 200,
            message: '搜索成功',
            data: result
        });
    } catch (error) {
        console.error('搜索相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '搜索相册失败',
            data: null
        });
    }
});

// 获取推荐相册
router.get('/recommend/list', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const albums = await albumService.getRecommendedAlbums(parseInt(limit));

        res.json({
            code: 200,
            message: '获取成功',
            data: albums
        });
    } catch (error) {
        console.error('获取推荐相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取推荐相册失败',
            data: null
        });
    }
});

// 获取热门相册
router.get('/popular/list', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const albums = await albumService.getPopularAlbums(parseInt(limit));

        res.json({
            code: 200,
            message: '获取成功',
            data: albums
        });
    } catch (error) {
        console.error('获取热门相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取热门相册失败',
            data: null
        });
    }
});

// 获取最新相册
router.get('/latest/list', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const albums = await albumService.getLatestAlbums(parseInt(limit));

        res.json({
            code: 200,
            message: '获取成功',
            data: albums
        });
    } catch (error) {
        console.error('获取最新相册失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取最新相册失败',
            data: null
        });
    }
});

export default router;