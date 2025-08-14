import express from 'express'
import articleService from '../services/articleService.js'
import { authenticateToken } from '../middleware/auth.js';

const articleRouter = express.Router()

articleRouter.post('/category/all', async (req, res) => {
    try {
        const categories = await articleService.getAllCategory()
        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/publish', authenticateToken, async (req, res) => {
    try {
        const articleData = {
            ...req.body,
            user_id: req.user.userId
        }
        const article = await articleService.publishArticle(articleData)
        res.status(200).json(article)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/all', authenticateToken, async (req, res) => {
    try {
        const articles = await articleService.getAllArticle(req.user.userId)
        articles.forEach(article => {
            article.is_top = Boolean(article.is_top)
            article.views_count = Number(article.views_count)
            article.comments_count = Number(article.comments_count)
            article.average_score = Number(article.average_score).toFixed(1)
        })
        res.status(200).json(articles)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

articleRouter.post('/published', async (req, res) => {
    try {
        const articles = await articleService.getAllPublishedArticle()
        articles.forEach(article => {
            article.is_top = Boolean(article.is_top)
            article.views_count = Number(article.views_count)
            article.comments_count = Number(article.comments_count)
            article.average_score = Number(article.average_score).toFixed(1)
        })
        res.status(200).json(articles)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})


articleRouter.post('/top', authenticateToken, async (req, res) => {
    try {
        const { id, is_top } = req.body
        const article = await articleService.toggleTop(id, is_top)
        res.status(200).json(article)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

articleRouter.get('/top', async (req, res) => {
    try {
        const articles = await articleService.getTopArticle()
        articles.forEach(article => {
            article.is_top = Boolean(article.is_top)
            article.views_count = Number(article.views_count)
            article.comments_count = Number(article.comments_count)
            article.average_score = Number(article.average_score).toFixed(1)
        })
        res.status(200).json(articles)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


articleRouter.post('/update', async (req, res) => {
    try {
        const { id, title, category_id, summary, content, cover, tags, status, is_top } = req.body
        const article = await articleService.updateArticle({ id, title, category_id, summary, content, cover, tags, status, is_top })
        res.status(200).json(article)
    } catch (error) {
        console.log(error)

        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/delete', async (req, res) => {
    try {
        const { id } = req.body
        const article = await articleService.deleteArticle(id)
        res.status(200).json(article)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/detail', async (req, res) => {
    try {
        const { id } = req.body
        const article = await articleService.getArticleDetail(id)
        res.status(200).json(article)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/views', async (req, res) => {
    try {
        const { id } = req.body
        const article = await articleService.updateViewsCount(id)
        res.status(200).json(article)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 评论相关路由
articleRouter.post('/comments', async (req, res) => {
    try {
        const { article_id } = req.body
        const comments = await articleService.getComments(article_id)
        res.status(200).json(comments)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/comment/add', authenticateToken, async (req, res) => {
    try {
        const commentData = {
            ...req.body,
            user_id: req.user.userId
        }
        const comment = await articleService.addComment(commentData)
        res.status(200).json(comment)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

articleRouter.post('/comment/delete', authenticateToken, async (req, res) => {
    try {
        const { id } = req.body
        await articleService.deleteComment(id, req.user.userId)
        res.status(200).json({ message: '删除成功' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 文章评分
articleRouter.post('/rate', authenticateToken, async (req, res) => {
    try {
        const { article_id, score } = req.body
        const user_id = req.user.userId
        
        const result = await articleService.rateArticle({ article_id, user_id, score })
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// 获取用户对文章的评分
articleRouter.post('/rating', authenticateToken, async (req, res) => {
    try {
        const { articleId } = req.body
        const userId = req.user.userId
        
        const result = await articleService.getUserRating(articleId, userId)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

export default articleRouter

