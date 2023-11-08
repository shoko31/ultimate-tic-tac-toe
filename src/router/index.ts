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

export default router
