export interface ArticleEntity {
  id: number
  title: string
  summary: string
  cover: string
  category_id: number
  views_count: number
  comments_count: number
  average_score: number
  status: 'draft' | 'published' | 'archived'
  is_top: boolean
  created_at: string
  updated_at?: string
  tags: string[]
  user_id: number
}

export interface ArticleCreateRequest extends ArticleEntity {
  content: string
}

export interface ArticleCategory {
  id: number
  name: string
  article_count: number
}

export interface ArticleComment {
  id: number
  article_id: number
  user_id: number
  parent_id: number | null
  reply_to_user_id: number | null
  content: string
  created_at: string
  nickname: string
  avatar: string
  reply_to_nickname?: string | null
}

export interface ArticleRating {
  id: number
  article_id: number
  user_id: number
  score: number
  created_at: string
}

export interface RatingRequest {
  article_id: number
  score: number
}
