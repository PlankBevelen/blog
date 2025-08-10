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
	cover VARCHAR(500) COMMENT '封面图片URL',
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

-- 文章标签表
CREATE TABLE IF NOT EXISTS article_tags(
	id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
	name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
	color VARCHAR(7) DEFAULT '#409EFF' COMMENT '标签颜色',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '文章标签表';

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS article_tag_relations(
	article_id INT NOT NULL COMMENT '文章ID',
	tag_id INT NOT NULL COMMENT '标签ID',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	PRIMARY KEY (article_id, tag_id),
	FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
	FOREIGN KEY (tag_id) REFERENCES article_tags(id) ON DELETE CASCADE
) COMMENT '文章标签关联表';

-- 文章点赞表
CREATE TABLE IF NOT EXISTS article_likes(
	article_id INT NOT NULL COMMENT '文章ID',
	user_id INT NOT NULL COMMENT '用户ID',
	is_like TINYINT NOT NULL DEFAULT 1 COMMENT '是否喜欢',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
	UNIQUE KEY unique_like (article_id, user_id),
	FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '文章点赞表';

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

-- 插入默认标签数据
INSERT INTO article_tags (name, color) VALUES 
('Vue.js', '#4FC08D'),
('React', '#61DAFB'),
('JavaScript', '#F7DF1E'),
('TypeScript', '#3178C6'),
('Node.js', '#339933'),
('CSS', '#1572B6'),
('HTML', '#E34F26'),
('前端', '#409EFF'),
('后端', '#67C23A'),
('全栈', '#E6A23C'),
('数据库', '#F56C6C'),
('算法', '#909399');