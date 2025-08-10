export interface TalkEntity {
    id: number
    user_id: number
    nickname: string
    avatar: string
    content: string
    images: string[]
    create_at: string
    status: string
    likes_count: number,
    comments_count: number
}

export interface TalkCreateRequest {
    content: string
    images: string[]
    status: string
}

export interface Comment {
  id: number
  talk_id: number
  user_id: number
  parent_id: number | null
  reply_to_user_id: number | null
  content: string
  created_at: string
  nickname: string
  avatar: string
  reply_to_nickname?: string
}

