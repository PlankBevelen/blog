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
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
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
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	status ENUM('active', 'deleted') DEFAULT 'active' COMMENT '状态',
	FOREIGN KEY (talk_id) REFERENCES talks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES talk_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
	INDEX idx_comments_talk_id (talk_id),
	INDEX idx_comments_parent_id(parent_id)
) COMMENT '评论表';