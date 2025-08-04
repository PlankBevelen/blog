export interface UserInfo {
    id: number
    email: string
    nickname: string
    avatar: string
    
    flink: string
    flink_bio: string
    flink_cover: string
    created_at?: string
    last_login?: string
}

export interface UserState {
    isLoggedIn: boolean,
    userInfo: UserInfo | null,
    token: string | null,
    refreshToken: string | null
}

