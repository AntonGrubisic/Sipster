<template>
  <main class="page">
    <!-- Fade-in hero -->
    <header class="hero" v-cloak>
      <h1>The Journey of Wine</h1>
      <p class="sub">
        Discover timeless vintages and modern favorites, curated by style and flavor.
      </p>
    </header>

    <!-- 🔎 Elegant search (name or grape) -->
    <section class="search-wrap" aria-label="Wine search">
      <div class="search">
        <input
            v-model="searchTerm"
            @keyup.enter="searchWines"
            type="text"
            inputmode="search"
            autocomplete="off"
            placeholder="Search by name or grape…"
            aria-label="Search wines by name or grape"
        />
        <button class="search-btn" @click="searchWines">Search</button>
      </div>
    </section>

    <!-- 🍇 Wine categories -->
    <section class="tiles" aria-label="Wine styles">
      <TransitionGroup name="fadeup" tag="div" class="tiles-inner" appear>
        <button
            v-for="(c, idx) in CATS"
            :key="c.key"
            class="tile"
            :class="{ active: c.key === selectedStyle }"
            @click="selectStyle(c.key)"
            :aria-pressed="c.key === selectedStyle"
            :style="{ transitionDelay: (idx * 60) + 'ms' }"
            @mousemove="onTileMove($event, idx)"
            @mouseleave="onTileLeave(idx)"
            ref="tileRefs"
        >
          <div class="image-wrap">
            <img
                :src="`/images/${c.key}.jpg`"
                :alt="c.label"
                class="tile-img"
                @error="(e) => e.target.style.visibility = 'hidden'"
                :style="tileStyles[idx]?.img"
            />
            <div class="overlay" :style="tileStyles[idx]?.overlay">
              <span class="label">{{ c.label }}</span>
            </div>
          </div>
        </button>
      </TransitionGroup>
    </section>

    <!-- 🕓 State messages -->
    <p v-if="error" class="err">{{ error }}</p>
    <p v-else-if="loading" class="loading">Loading…</p>
    <p v-else-if="!loading && wines.length === 0 && (selectedStyle || searchTerm)" class="empty">
      No wines found for “{{ selectedStyle ? labelFor(selectedStyle) : searchTerm }}”.
    </p>

    <!-- 🍷 Results grid -->
    <section v-if="wines.length" class="grid" aria-live="polite">
      <TransitionGroup name="fadeup" tag="div" appear>
        <div
            v-for="(countryWines, country) in groupedWines"
            :key="country"
            class="country-section"
        >
          <h2 class="country-title">{{ country }}</h2>

          <!-- ✅ Lagt vinerna i en grid som matchar layouten på din bild -->
          <div class="grid-inner">
            <article
                v-for="(w, idx) in countryWines"
                :key="w.id"
                class="card"
                :style="{ transitionDelay: (idx * 30) + 'ms' }"
            >
              <div class="thumb">
                <img v-if="w.image" :src="w.image" alt=""/>
                <div v-else class="ph">🍷</div>
              </div>
              <div class="info">
                <h3 class="name">{{ w.name }}</h3>
                <div class="meta">
                  <span v-if="w.grape">{{ w.grape }}</span>
                  <span v-if="w.winery"> • {{ w.winery }}</span>
                  <span v-if="w.location"> • {{ w.location }}</span>
                </div>
                <div class="foot">
                  <span class="badge">{{ labelFor(w.style) }}</span>
                  <span v-if="w.rating" class="rating">★ {{ w.rating }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </TransitionGroup>
    </section>


  </main>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'

const CATS = [
  { key: 'reds', label: 'Red' },
  { key: 'whites', label: 'White' },
  { key: 'rose', label: 'Rosé' },
  { key: 'sparkling', label: 'Sparkling' },
  { key: 'dessert', label: 'Dessert' },
]

const selectedStyle = ref('')
const wines = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')

// --- Parallax hover state (per tile) ---
const tileRefs = ref([])
const tileStyles = reactive([])

function ensureTileStyle(i) {
  if (!tileStyles[i]) {
    tileStyles[i] = { img: {}, overlay: {} }
  }
}

function onTileMove(e, i) {
  ensureTileStyle(i)
  const el = tileRefs.value[i]
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const cx = (x / rect.width) - 0.5
  const cy = (y / rect.height) - 0.5

  const drift = 8
  tileStyles[i].img = {
    transform: `translate(${(-cx * drift)}px, ${(-cy * drift)}px) scale(1.04)`,
    filter: `brightness(0.9)`
  }

  const overlayLift = 6
  tileStyles[i].overlay = {
    transform: `translateY(${(-Math.abs(cy) * overlayLift)}px)`,
    opacity: 1
  }
}

function onTileLeave(i) {
  ensureTileStyle(i)
  tileStyles[i].img = { transform: 'translate(0,0) scale(1)', filter: 'brightness(1)' }
  tileStyles[i].overlay = { transform: 'translateY(0)' }
}

// --- Sorting helpers ---
function displayName(w) {
  return (w.name || w.wine || '').toString()
}

function sortByName(arr) {
  return (arr || []).slice().sort((a, b) => {
    const countryA = (a.location || '').toLowerCase()
    const countryB = (b.location || '').toLowerCase()
    const nameA = displayName(a)
    const nameB = displayName(b)

    if (countryA < countryB) return -1
    if (countryA > countryB) return 1
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })
}

// --- Computed: group wines per country ---
const groupedWines = computed(() => {
  const groups = {}
  for (const wine of wines.value) {
    const country = (wine.location || 'Unknown Country').trim()
    if (!groups[country]) groups[country] = []
    groups[country].push(wine)
  }
  // Sortera länder i alfabetisk ordning
  const sorted = {}
  Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .forEach(key => {
        sorted[key] = groups[key].sort((a, b) =>
            displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' })
        )
      })
  return sorted
})

function labelFor(styleKey) {
  const f = CATS.find(c => c.key === styleKey)
  return f ? f.label : styleKey
}

// --- Load by style ---
async function selectStyle(style) {
  if (selectedStyle.value === style) return
  selectedStyle.value = style
  searchTerm.value = ''
  wines.value = []
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`/api/wines/by-style?style=${encodeURIComponent(style)}&limit=60`)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || `Request failed (${res.status})`)
    }
    const data = await res.json()
    wines.value = sortByName(data.results || [])
    await nextTick()
  } catch (e) {
    error.value = e.message || 'Failed to load wines.'
  } finally {
    loading.value = false
  }
}

// --- Search wines ---
async function searchWines() {
  const q = searchTerm.value.trim()
  if (!q) return
  selectedStyle.value = ''
  wines.value = []
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`/api/wines/search?q=${encodeURIComponent(q)}&limit=60`)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || `Request failed (${res.status})`)
    }
    const data = await res.json()
    wines.value = sortByName(data.results || [])
  } catch (e) {
    error.value = e.message || 'Failed to load wines.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  tileStyles.length = CATS.length
  for (let i = 0; i < CATS.length; i++) ensureTileStyle(i)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&display=swap');

[v-cloak] {
  opacity: 0;
}

/* Page + hero base */
.page {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: grid;
  gap: 1.5rem;
  justify-content: center;
  text-align: center;
  font-family: 'Playfair Display', serif;

  /* 🌿 Elegant green background with subtle texture */
  background-color: #e8f0e5; /* fallback if image fails */
  background-image: url('/textures/green-fabric.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  color: #1a1a1a;
}

/* Hero fade-in */
.hero {
  text-align: center;
  margin: 0.5rem auto 0;
  max-width: 900px;
  padding: 0 1rem 0.5rem;
  animation: heroFade 700ms ease-out both;
  animation-delay: 60ms;
}

@keyframes heroFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero h1 {
  margin: 0;
  font-weight: 900;
  font-size: clamp(2.2rem, 4.2vw, 3.2rem);
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #f5f5f0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
}

.hero h1::after {
  content: "";
  display: block;
  width: 84px;
  height: 3px;
  margin: 0.9rem auto 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #bca897, #7b1113);
  opacity: 0.85;
}

.sub {
  margin: 0.9rem auto 0;
  max-width: 720px;
  font-size: clamp(0.98rem, 1.4vw, 1.05rem);
  line-height: 1.55;
  color: #e0e0dc;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  opacity: 0.85;
}

/* 🔎 Search */
.search-wrap {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.search {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
  background: #f7f4f1;
  border: 1px solid #d9d1cb;
  border-radius: 12px;
  padding: 0.35rem 0.6rem;
}

.search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: #3a2c28;
  padding: 0.35rem 0.25rem;
}

.search input::placeholder {
  color: #9b8f88;
}

.search-btn {
  background: #7b1113;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.search-btn:hover {
  background: #92171a;
  transform: translateY(-1px);
}

.search-btn:active {
  transform: translateY(0);
}

/* Tiles */
.tiles {
  display: flex;
  justify-content: center;
}

.tiles-inner {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 0 0.5rem;
}

.tile {
  border: none;
  border-radius: 20px;
  background: none;
  cursor: pointer;
  width: 180px;
  height: 240px;
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  will-change: transform;
}

.tile:hover {
  transform: translateY(-6px);
}

.image-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.tile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease, filter 300ms ease;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.08));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: opacity 250ms ease, transform 250ms ease;
  opacity: 0;
}

.tile:hover .overlay {
  opacity: 1;
}

.label {
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  padding-bottom: 0.9rem;
}

/* Results */
.grid {
  display: grid;
}

.country-section {
  margin-top: 2.2rem;
}

.country-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #f5f5f5; /* ljus text mot mörk bakgrund */
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6); /* gör texten mer läsbar */
  margin: 2.5rem 0 1.2rem;
  letter-spacing: 0.5px;
  font-family: 'Playfair Display', serif;
  display: inline-block;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.4); /* diskret vit underline */
}


.country-section + .country-section {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 1.5rem;
}



.grid-inner {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  justify-content: center;
}


.card {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: .75rem;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: .75rem;
  background: #fff;
}

.thumb {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  display: grid;
  place-items: center;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ph {
  font-size: 1.5rem;
}

.info {
  display: grid;
  gap: .25rem;
}

.name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.meta {
  font-size: .9rem;
  opacity: .75;
}

.foot {
  display: flex;
  gap: .5rem;
  align-items: center;
  margin-top: .25rem;
}

.badge {
  font-size: .75rem;
  padding: .15rem .45rem;
  border: 1px solid #eee;
  border-radius: 999px;
  background: #f7f7f9;
}

.rating {
  font-size: .85rem;
}

.err {
  color: #b00020;
}

.loading, .empty {
  opacity: .85;
}

/* TransitionGroup: fade/slide in + stagger */
.fadeup-enter-from, .fadeup-appear-from {
  opacity: 0;
  transform: translateY(10px);
}

.fadeup-enter-active, .fadeup-appear-active {
  transition: opacity .45s cubic-bezier(.22, .61, .36, 1), transform .45s cubic-bezier(.22, .61, .36, 1);
}

.fadeup-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fadeup-leave-active {
  transition: opacity .25s ease, transform .25s ease;
  position: relative;
}

.fadeup-move {
  transition: transform .3s ease;
}
</style>
