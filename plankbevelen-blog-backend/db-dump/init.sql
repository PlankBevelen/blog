CREATE DATABASE IF NOT EXISTS `plankbevelen-blog`;

USE `plankbevelen-blog`;

CREATE TABLE IF NOT EXISTS users(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
	nickname VARCHAR(50) NOT NULL COMMENT '昵称',
	email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
	password VARCHAR(255) NOT NULL COMMENT '密码(加密后)',
	avatar JSON DEFAULT NULL COMMENT '头像URL',

	flink VARCHAR(255) DEFAULT NULL COMMENT '个人网站',
	flink_bio TEXT DEFAULT NULL COMMENT '个人简介',
	flink_cover JSON DEFAULT NULL COMMENT '个人网站封面',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	last_login TIMESTAMP DEFAULT NULL COMMENT '最后登录时间'
) COMMENT '用户表';

CREATE TABLE IF NOT EXISTS talks(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '说说ID',
	user_id INT NOT NULL COMMENT '用户ID',
	content TEXT NOT NULL COMMENT '说说内容',
	images JSON DEFAULT NULL COMMENT '图片',
	create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	status VARCHAR(55) DEFAULT 'draft' NOT NULL COMMENT '状态',
	
	likes_count INT DEFAULT 0 COMMENT '点赞数量',
	comments_count INT DEFAULT 0 COMMENT '评论数量',
	FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT '说说表';

CREATE TABLE IF NOT EXISTS talk_likes(
	talk_id INT NOT NULL COMMENT '说说ID',
	user_id INT NOT NULL COMMENT '用户ID',
	is_like TINYINT NOT NULL DEFAULT 1 COMMENT '是否喜欢',
	created_at TIMESTAMP DEFAULT NOW() COMMENT '点赞时间',
	UNIQUE KEY unique_like (talk_id, user_id),
	FOREIGN KEY (talk_id) REFERENCES talks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '点赞表';

CREATE TABLE IF NOT EXISTS talk_comments(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
	talk_id INT NOT NULL COMMENT '说说ID',
  user_id INT NOT NULL COMMENT '评论用户ID',
	parent_id INT DEFAULT NULL COMMENT '父评论ID（回复时使用）',
	reply_to_user_id INT DEFAULT NULL COMMENT '回复的用户ID',
	
	content TEXT NOT NULL COMMENT '评论内容',
	created_at TIMESTAMP DEFAULT NOW() COMMENT '创建时间',
	status ENUM('active', 'deleted') DEFAULT 'active' COMMENT '状态',
	FOREIGN KEY (talk_id) REFERENCES talks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES talk_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
	INDEX idx_comments_talk_id (talk_id),
	INDEX idx_comments_parent_id(parent_id)
) COMMENT '评论表';

-- 文章分类表
CREATE TABLE IF NOT EXISTS article_categories(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
	name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称',
	article_count INT DEFAULT 0 COMMENT '文章数量',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '文章分类表';

-- 文章表
CREATE TABLE IF NOT EXISTS articles(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
	title VARCHAR(255) NOT NULL COMMENT '文章标题',
	summary TEXT COMMENT '文章摘要',
	content LONGTEXT COMMENT '文章内容',
	cover JSON COMMENT '封面图片',
	category_id INT NOT NULL COMMENT '分类ID',
	user_id INT NOT NULL COMMENT '作者ID',
	views_count INT DEFAULT 0 COMMENT '浏览次数',
	likes_count INT DEFAULT 0 COMMENT '点赞数量',
	comments_count INT DEFAULT 0 COMMENT '评论数量',
	average_score DECIMAL(3,2) DEFAULT 0.00 COMMENT '平均评分',
	status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
	is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
	tags JSON DEFAULT NULL COMMENT '标签',
	FOREIGN KEY (category_id) REFERENCES article_categories(id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	INDEX idx_articles_category_id (category_id),
	INDEX idx_articles_user_id (user_id),
	INDEX idx_articles_status (status),
	INDEX idx_articles_created_at (created_at)
) COMMENT '文章表';

-- 文章评论表
CREATE TABLE IF NOT EXISTS article_comments(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
	article_id INT NOT NULL COMMENT '文章ID',
	user_id INT NOT NULL COMMENT '评论用户ID',
	parent_id INT DEFAULT NULL COMMENT '父评论ID（回复时使用）',
	reply_to_user_id INT DEFAULT NULL COMMENT '回复的用户ID',
	content TEXT NOT NULL COMMENT '评论内容',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	status ENUM('active', 'deleted') DEFAULT 'active' COMMENT '状态',
	FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (parent_id) REFERENCES article_comments(id) ON DELETE CASCADE,
	FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
	INDEX idx_comments_article_id (article_id),
	INDEX idx_comments_parent_id (parent_id)
) COMMENT '文章评论表';

-- 文章评分表
CREATE TABLE IF NOT EXISTS article_ratings(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评分ID',
	article_id INT NOT NULL COMMENT '文章ID',
	user_id INT NOT NULL COMMENT '用户ID',
	score TINYINT NOT NULL CHECK (score >= 1 AND score <= 5) COMMENT '评分(1-5)',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
	UNIQUE KEY unique_rating (article_id, user_id),
	FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '文章评分表';

-- 插入默认分类数据
INSERT INTO article_categories (name) VALUES 
('工程化'),
('前端'),
('生活日常'),
('学习笔记'),
('旅游');

-- 相册表
CREATE TABLE IF NOT EXISTS albums(
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '相册ID',
    name VARCHAR(100) NOT NULL COMMENT '相册名称',
    description TEXT COMMENT '相册描述',
    cover JSON COMMENT '封面图片',
    user_id INT NOT NULL COMMENT '创建用户ID',
    photos_count INT DEFAULT 0 COMMENT '照片数量',
    views_count INT DEFAULT 0 COMMENT '浏览量',

    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
    is_private BOOLEAN DEFAULT FALSE COMMENT '是否私有',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_featured (is_featured),
    INDEX idx_private (is_private)
) COMMENT '相册表';

-- 相册照片表
CREATE TABLE IF NOT EXISTS album_photos(
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '照片ID',
    album_id INT NOT NULL COMMENT '相册ID',
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    photo JSON NOT NULL COMMENT '照片数据',
    description TEXT COMMENT '照片描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    INDEX idx_album (album_id)
) COMMENT '相册照片表';

-- 留言表
CREATE TABLE IF NOT EXISTS messages(
		id INT AUTO_INCREMENT PRIMARY KEY COMMENT '留言ID',
		user_id INT NOT NULL COMMENT '作者ID',
		content TEXT NOT NULL COMMENT '留言内容',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
		status TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		INDEX idx_id (id),
		INDEX idx_user (user_id)
) COMMENT '留言表';
