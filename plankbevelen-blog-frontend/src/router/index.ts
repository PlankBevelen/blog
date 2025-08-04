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
      name: 'Home',
      component: () => import('@/pages/Index.vue'),
      children: [
        {
          path: '',
          component: () => import('@/pages/HomeView.vue')
        },
        {
          path: '/talk',
          component: () => import('@/pages/TalkView.vue')
        },
        {
          path: '/login',
          component: () => import('@/pages/LoginView.vue')
        },
        {
          path: '/profile',
          component: () => import('@/pages/ProfileView.vue')
        }
      ]
    },
    /* {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginView.vue')
    }, */
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
