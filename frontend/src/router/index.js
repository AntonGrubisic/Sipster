import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from "@/views/DashboardView.vue";
import QuizView from "@/views/QuizView.vue";
import ProfileView from "@/views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // pass BASE_URL (recommended)
  routes: [
    { path: '/', component: LandingView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: DashboardView},
    { path: '/quiz', component: QuizView },
    { path: '/dashboard', component: DashboardView},
    { path: '/profile', component: ProfileView }
  ]
})

export default router
