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
