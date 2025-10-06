// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import WineSearchView from '../views/WineSearchView.vue'

// Lazy-load Pairings to keep initial bundle small
const PairingsView = () => import('../views/PairingsView.vue')

// Optional (nice UX): simple 404 page (create NotFoundView.vue if you want)
const NotFoundView = () => import('../views/NotFoundView.vue').catch(() => LandingView)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/wines', name: 'wines', component: WineSearchView },
    { path: '/pairings', name: 'pairings', component: PairingsView }, // ← new
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView } // ← fallback
  ]
})

export default router
