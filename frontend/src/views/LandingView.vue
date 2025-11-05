<template>
  <div class="page">
    <!-- TOPBAR -->
    <header class="topbar">
      <router-link to="/" class="brand" aria-label="Sipster home">
        <img src="/sipster-logo.png" alt="Sipster" class="logo"/>
      </router-link>

      <div class="search">
        <input
            type="search"
            v-model.trim="q"
            placeholder="Search wines…"
            aria-label="Search wines"
            @keyup.enter="goSearch"
        />
        <button class="search-btn" aria-label="Search" @click="goSearch">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- AUTH-ACTIONS -->
      <div class="auth-actions">
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="btn tiny primary">Login</router-link>
          <router-link to="/register" class="btn tiny ghost">Signup</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" class="btn tiny ghost">Profile</router-link>
          <button @click="handleLogout" class="btn tiny primary">Logout</button>
        </template>
      </div>
    </header>

    <!-- MENY -->
    <nav class="tabs" aria-label="Main menu">
      <router-link class="tab" to="/wine-browser" :class="{ active: isActive('/wine-browser') }">Wines</router-link>
      <router-link class="tab" to="/culinary-pairings" :class="{ active: isActive('/culinary-pairings') }">Pairings
      </router-link>
      <router-link class="tab" to="/quiz" :class="{ active: isActive('/quiz') }">Quiz</router-link>
    </nav>

    <!-- Recommended Wines -->
    <main class="content">
      <h2 class="cards-title">Recommended Wines</h2>
      <div class="grid">
        <article v-for="w in wines" :key="w.id" class="card">
          <div class="imgbox">
            <img :src="w.image" :alt="w.name"/>
          </div>
          <div class="body">
            <h3 class="name">{{ w.producer }}</h3>
            <p class="title">{{ w.name }}</p>
            <p class="meta">{{ w.region }}, {{ w.country }}</p>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {getProtectedData, logoutUser} from '@/services/authService'

const router = useRouter()
const route = useRoute()

// Sök
const q = ref('')

function goSearch() {
  const query = q.value.trim()
      + router.push({ path: '/wine-browser', query: query ? { q: query } : undefined })
}

function isActive(prefix) {
  return route.path.startsWith(prefix)
}

// Auth
const isAuthenticated = computed(() => !!localStorage.getItem('userToken'))

function handleLogout() {
  logoutUser()
  router.push('/login')
}

// Dummy-data
const wines = ref([
  {
    id: 1,
    image: '/wines/1.jpg',
    producer: 'Terre di Mario',
    name: 'Terre di Mario',
    region: 'Abruzzo',
    country: 'Italy'
  },
  {
    id: 2,
    image: '/wines/2.jpg',
    producer: 'Torre il Ceretto',
    name: 'Borgo la Piaggia',
    region: 'Toscana',
    country: 'Italy'
  },
  {
    id: 3,
    image: '/wines/3.jpg',
    producer: 'Casa Ermelinda Freitas',
    name: 'Fat Baron',
    region: 'Setúbal',
    country: 'Portugal'
  },
  {
    id: 4,
    image: '/wines/4.jpg',
    producer: 'Arnaldo Rivera',
    name: 'Barolo Undicicomuni 2016',
    region: 'Piemonte',
    country: 'Italy'
  },
  {
    id: 5,
    image: '/wines/5.jpg',
    producer: 'Famille Bougrier',
    name: "L'Artiste Pinot Noir 2024",
    region: 'Vin De France',
    country: 'France'
  },
])

onMounted(() => {
  if (isAuthenticated.value) {
    getProtectedData().catch(() => {
    })
  }
})
</script>

<style scoped>
.page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(1200px 500px at 10% -10%, #ffe8f0 0%, transparent 45%),
  radial-gradient(1200px 500px at 90% -10%, #fff3d6 0%, transparent 45%),
  linear-gradient(180deg, #ffffff, #f9fafb);
  color: #111;
  padding: 18px;
}

/* ===== Topbar ===== */
.topbar {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
}

.logo {
  height: 72px;
  width: auto;
}

.search {
  display: grid;
  grid-template-columns:1fr auto;
  gap: 8px;
  align-items: center;
}

.search input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 999px;
}

.search-btn {
  border: 1px solid #ddd;
  border-radius: 999px;
  background: #fff;
  padding: 9px 12px;
  cursor: pointer;
}

.auth-actions {
  display: flex;
  gap: 8px;
  justify-self: end;
  align-items: center;
}

.btn {
  text-decoration: none;
  padding: .6em 1em;
  border-radius: 12px;
  font-weight: 600;
}

.btn.tiny {
  font-size: .9rem;
}

.primary {
  background: #111;
  color: #fff;
  border: 2px solid #111;
}

.ghost {
  background: #fff;
  color: #111;
  border: 1px solid #ddd;
}

/* ===== Tabs ===== */
.tabs {
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 28px;
  border-bottom: 2px solid #eee;
  padding: 10px 0;
  margin: 14px 0 18px;
}

.tab {
  position: relative;
  padding: 10px 2px;
  text-decoration: none;
  color: #111;
  font-weight: 700;
}

.tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 3px;
  background: #111;
  border-radius: 2px;
}

/* ===== Content / Wines ===== */
.content {
  width: 100%;
  max-width: 1200px;
}

.cards-title {
  font-size: 22px;
  margin: 0 0 16px;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 22px;
}

.card {
  border: 1px solid #eee;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
  overflow: hidden;
  transition: transform .14s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.imgbox {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.imgbox img {
  max-height: 200px;
  width: auto;
  object-fit: contain;
}

.body {
  padding: 10px 12px 14px;
  text-align: center;
}

.name {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px;
}

.title {
  font-size: 13px;
  margin: 0 0 6px;
  color: #333;
}

.meta {
  font-size: 12px;
  color: #666;
  margin: 0;
}
</style>
