import Cookies from 'js-cookie'

export const cookie = {
    // 设置
    set(key: string, value: string, options?:Cookies.CookieAttributes) {
        Cookies.set(key, value, options)
    },
    // 获取
    get(key: string) {
        return Cookies.get(key)
    },
    // 删除
    remove(key: string, options?:Cookies.CookieAttributes) {
        return Cookies.remove(key, options)
    },
    // 获取所有
    getAll() {
        return Cookies.get()
    },
    // 清除所有
    clear() {
        Cookies.remove()
    }
}