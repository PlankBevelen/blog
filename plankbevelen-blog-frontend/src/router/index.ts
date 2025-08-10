import { createRouter, createWebHistory } from 'vue-router'
import { cookie } from '@/utils/cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('@/pages/Index.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/pages/HomeView.vue')
        },
        {
          path: '/talk',
          name: 'Talk',
          component: () => import('@/pages/TalkView.vue')
        },
        {
          path: '/article',
          name: 'Article',
          component: () => import('@/pages/ArticleView.vue')
        },
        {
          path: '/login',
          name: 'Login',
          component: () => import('@/pages/LoginView.vue')
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/pages/ProfileView.vue')
        }
      ]
    },
    {
      path: '/manage',
      name: 'Manage',
      component: () => import('@/pages/ManageView.vue'),
      children: [
        {
          path: '',
          redirect: '/manage/articles'
        },
        {
          path: 'talks',
          name: 'TalksManage',
          component: () => import('@/pages/manage/TalksManage.vue')
        },
        {
          path: 'albums',
          name: 'ManageAlbums',
          component: () => import('@/pages/manage/AlbumsManage.vue')
        },
        {
          path: 'friends',
          name: 'ManageFriends',
          component: () => import('@/pages/manage/FriendsManage.vue')
        },
        {
          path: 'articles',
          name: 'ManageArticles',
          component: () => import('@/pages/manage/ArticlesManage.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/404.vue')
    },
  ],
})

// 路由守卫
/* router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !cookie.get('token')) {
    next({ name: 'Login' })
  } else {
    next()
  }
}) */

export default router
