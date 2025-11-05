<template>
  <div class="wrap">
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

      <router-link to="/profile" class="profile" aria-label="Profile">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                fill="currentColor"/>
        </svg>
        <span>Profile</span>
      </router-link>
    </header>

    <!-- MENY -->
    <nav class="tabs" aria-label="Main menu">
      <router-link class="tab" to="/wine-browser" :class="{ active: isActive('/wine-browser') }">Wines</router-link>
      <router-link class="tab" to="/culinary-pairings" :class="{ active: isActive('/culinary-pairings') }">Pairings</router-link>
      <router-link class="tab" to="/quiz" :class="{ active: isActive('/quiz') }">Quiz</router-link>
    </nav>


    <main class="content">
      <h2>Recommended Wines</h2>
      <section class="grid">
        <article v-for="w in wines" :key="w.id" class="card">
          <div class="imgbox">
            <img :src="w.image" :alt="w.name"/>
          </div>
          <h3 class="name">{{ w.producer }}</h3>
          <p class="title">{{ w.name }}</p>
          <p class="meta">{{ w.region }}, {{ w.country }}</p>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter, useRoute} from 'vue-router'

const router = useRouter()
const route = useRoute()
const q = ref('')

const wines = ref([
  {
    id: 1,
    image: 'public/wines/1.jpg',
    producer: 'Terre di Mario',
    name: 'Terre di Mario',
    region: 'Abruzzo',
    country: 'Italy'
  },
  {
    id: 2,
    image: 'public/wines/2.jpg',
    producer: 'Torre il Ceretto',
    name: 'Borgo la Piaggia',
    region: 'Toscana',
    country: 'Italy'
  },
  {id: 3, image: 'public/wines/3.jpg', producer: 'Casa Ermelinda Freitas', name: 'Fat Baron', region: "Setúbal", country: 'Portugal'},
  {
    id: 4,
    image: '/wines/4.jpg',
    producer: 'Arnaldo Rivera',
    name: 'Arnaldo Rivera Barolo Undicicomuni 2016',
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

function isActive(prefix) {
  return route.path.startsWith(prefix)
}

function goSearch() {
  const query = q.value.trim()
  router.push({path: '/wines', query: query ? {q: query} : undefined})
}
</script>

<style scoped>
.wrap {
  min-height: 100svh;
  background: #fff;
  color: #111;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}


.topbar {
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns:auto 1fr auto; /* logo | search | profile */
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}


.logo {
  height: 120px;
  width: auto;
  display: block;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}

/* Sökfält i mitten */
.search {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.search input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 999px;
  font-size: 14px;
  outline: none;
}

.search input:focus {
  border-color: #111;
}

.search-btn {
  border: 1px solid #ddd;
  border-radius: 999px;
  background: #fff;
  padding: 9px 12px;
  cursor: pointer;
}

.search-btn:hover {
  background: #f7f7f7;
}


.profile {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid #111;
  border-radius: 12px;
  padding: 8px 12px;
  color: #111;
  font-weight: 700;
  text-decoration: none;
  background: #fff;
}

.profile:hover {
  background: #f7f7f7;
}


.tabs {
  width: 100%;
  max-width: 1180px;
  display: flex;
  gap: 28px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 22px;
}

.tab {
  position: relative;
  padding: 10px 2px;
  text-decoration: none;
  color: #111;
  font-weight: 700;
}

.tab:hover {
  opacity: .85;
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


.content {
  width: 100%;
  max-width: 1180px;
  text-align: center;
}

.content h2 {
  font-size: 22px;
  margin: 6px 0 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  justify-items: center;
}

.card {
  width: 200px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, .05);
  overflow: hidden;
  transition: transform .15s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.imgbox {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fafafa, #fff);
}

.imgbox img {
  max-height: 180px;
  width: auto;
  object-fit: contain;
  display: block;
}

.name {
  font-size: 14px;
  font-weight: 700;
  margin: 10px 10px 4px;
}

.title {
  font-size: 13px;
  color: #333;
  margin: 0 10px 6px;
}

.meta {
  font-size: 12px;
  color: #666;
  margin: 0 10px 12px;
}


@media (max-width: 720px) {
  .profile span {
    display: none;
  }
}
</style>
