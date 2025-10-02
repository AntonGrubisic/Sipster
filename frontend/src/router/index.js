import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import WineSearchView from '../views/WineSearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // pass BASE_URL (recommended)
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/wines', name: 'wines', component: WineSearchView },
  ]
})

export default router
