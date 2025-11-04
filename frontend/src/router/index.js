import {createRouter, createWebHistory} from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import QuizView from "@/views/QuizView.vue";
import ProfileView from "@/views/ProfileView.vue";
import WineBrowserView from "@/views/WineBrowserView.vue";
import CulinaryPairingsView from "@/views/CulinaryPairingsView.vue";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // pass BASE_URL (recommended)
    routes: [
        {path: '/', component: LandingView},
        {path: '/login', component: LoginView},
        {path: '/register', component: RegisterView},
        {path: '/quiz', component: QuizView, meta: {requiresAuth: true}},
        {path: '/profile', component: ProfileView},
        {path: "/wine-browser", name: "wine-browser", component: WineBrowserView},
        {path: "/culinary-pairings", name: "culinary-pairings", component: CulinaryPairingsView},

    ]
})

export default router
