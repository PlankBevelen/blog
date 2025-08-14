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

-- 插入默认用户数据
INSERT INTO users (nickname, email, password, avatar) VALUES 
('PlankBevelen', 'admin@plankbevelen.com', '$2b$10$example.hash.password', '"/uploads/avatars/admin.jpg"');

-- 插入默认分类数据
INSERT INTO article_categories (name) VALUES 
('工程化'),
('前端'),
('生活日常'),
('学习笔记'),
('旅游');

-- 插入测试文章数据
INSERT INTO articles (title, summary, content, cover, category_id, user_id, views_count, comments_count, average_score, status, is_top, tags) VALUES 
('Vue 3 Composition API 深度解析', 'Vue 3 带来了全新的 Composition API，让我们能够更好地组织和复用代码逻辑。本文将深入探讨 Composition API 的使用方法和最佳实践。', '# Vue 3 Composition API 深度解析\n\nVue 3 的 Composition API 是一个重大的更新...', '"/uploads/covers/vue3-composition.jpg"', 2, 1, 1250, 15, 4.8, 'published', TRUE, '["Vue.js", "前端", "JavaScript"]'),
('现代前端工程化实践指南', '从零开始构建一个现代化的前端工程，包括项目架构、构建工具、代码规范、自动化部署等方面的最佳实践。', '# 现代前端工程化实践指南\n\n在现代前端开发中，工程化是必不可少的...', '"/uploads/covers/frontend-engineering.jpg"', 1, 1, 980, 12, 4.6, 'published', TRUE, '["工程化", "前端", "构建工具"]'),
('TypeScript 进阶技巧与实战', 'TypeScript 作为 JavaScript 的超集，为前端开发带来了强类型支持。本文分享一些 TypeScript 的进阶使用技巧。', '# TypeScript 进阶技巧与实战\n\nTypeScript 的类型系统非常强大...', '"/uploads/covers/typescript-advanced.jpg"', 2, 1, 756, 8, 4.5, 'published', TRUE, '["TypeScript", "前端", "JavaScript"]'),
('Node.js 性能优化实战', '深入探讨 Node.js 应用的性能优化策略，包括内存管理、异步处理、数据库优化等方面的实践经验。', '# Node.js 性能优化实战\n\n性能优化是 Node.js 应用开发中的重要环节...', '"/uploads/covers/nodejs-performance.jpg"', 1, 1, 642, 6, 4.4, 'published', TRUE, '["Node.js", "后端", "性能优化"]'),
('React Hooks 最佳实践', 'React Hooks 改变了我们编写 React 组件的方式。本文总结了 Hooks 使用的最佳实践和常见陷阱。', '# React Hooks 最佳实践\n\nReact Hooks 让函数组件拥有了状态管理能力...', '"/uploads/covers/react-hooks.jpg"', 2, 1, 534, 4, 4.3, 'published', TRUE, '["React", "前端", "JavaScript"]'),
('CSS Grid 布局完全指南', 'CSS Grid 是现代 CSS 布局的强大工具。本文将全面介绍 Grid 布局的使用方法和实际应用场景。', '# CSS Grid 布局完全指南\n\nCSS Grid 提供了二维布局能力...', '"/uploads/covers/css-grid.jpg"', 2, 1, 423, 3, 4.2, 'published', TRUE, '["CSS", "前端", "布局"]'),
('JavaScript 异步编程深入理解', '从回调函数到 Promise，再到 async/await，深入理解 JavaScript 异步编程的演进和最佳实践。', '# JavaScript 异步编程深入理解\n\n异步编程是 JavaScript 的核心特性...', '"/uploads/covers/js-async.jpg"', 2, 1, 367, 2, 4.1, 'published', TRUE, '["JavaScript", "前端", "异步编程"]'),
('前端性能优化全面指南', '从加载优化到运行时优化，全面介绍前端性能优化的策略和技巧，让你的网站飞起来。', '# 前端性能优化全面指南\n\n性能优化是前端开发的永恒话题...', '"/uploads/covers/frontend-performance.jpg"', 2, 1, 289, 1, 4.0, 'published', TRUE, '["前端", "性能优化", "JavaScript"]');

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

-- 插入示例相册数据
INSERT INTO albums (name, description, cover, user_id, photos_count, views_count, is_featured, is_private) VALUES 
('春日风光', '春天的美丽景色', '/uploads/albums/spring-cover.jpg', 1, 12, 156, TRUE, FALSE),
('旅行记录', '2024年春季旅行照片', '/uploads/albums/travel-cover.jpg', 1, 25, 89, FALSE, FALSE),
('日常生活', '生活中的美好瞬间', '/uploads/albums/life-cover.jpg', 1, 8, 45, FALSE, FALSE),
('人像摄影', '人物摄影作品集', '/uploads/albums/portrait-cover.jpg', 1, 15, 78, TRUE, FALSE);