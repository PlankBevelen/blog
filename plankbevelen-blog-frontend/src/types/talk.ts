
export interface TalkCreateRequest {
    content: string
    images: string[]
    status: string
}

export interface TalkEntity {
    id: number
    user_id: number
    content: string
    images: string[]
    create_at: string
    status: string
    likes_count: number,
    comments_count: number

}

