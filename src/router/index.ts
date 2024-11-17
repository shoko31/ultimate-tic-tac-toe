import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'

export const enum RouteNames {
  HOME = 'Home',
  GAME = 'Game'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteNames.HOME,
      component: HomeView
    },
    {
      path: '/:id',
      name: RouteNames.GAME,
      component: GameView
    }
  ]
})

router.beforeEach((to, _, next) => {
  if (to.name === RouteNames.HOME) {
    const oldId = localStorage.getItem('ultimate-tic-tac-toc--uuid')
    if (oldId !== null && oldId !== undefined) {
      localStorage.clear()
      location.reload()
      return
    }
  }
  next()
})

export default router
