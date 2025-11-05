<template>
  <main class="page" v-cloak>
    <!-- Hero -->
    <header class="hero">
      <h1>Culinary Harmony</h1>
      <p class="sub">
        Discover how fine wines and exquisite dishes come together in perfect balance.
      </p>
    </header>

    <section class="cp-wrap">
      <!-- Sidebar: Categories + Rating -->
      <aside class="cp-sidebar" aria-label="Filters">
        <!-- Categories -->
        <h3 class="cp-filters-title">Dishes</h3>
        <div class="cp-cats">
          <button
              v-for="c in CATS"
              :key="c.key"
              class="cp-cat"
              :class="{ active: selectedKey === c.key }"
              @click="selectCategory(c)"
              :aria-pressed="selectedKey === c.key"
          >
            <span class="cp-emoji" aria-hidden="true">{{ c.emoji }}</span>
            <span class="cp-label">{{ c.label }}</span>
          </button>
        </div>

        <!-- Average rating -->
        <h4 class="cp-filters-sub">Average rating</h4>
        <div class="cp-segbar" role="group" aria-label="Average rating">
          <button
              v-for="r in RATING_STEPS"
              :key="r"
              class="cp-seg"
              :class="{ active: minRating === r }"
              @click="setRating(r)"
          >
            {{ r === 0 ? 'All' : r.toFixed(1) + '+' }}
          </button>
        </div>

        <!-- Clear filters -->
        <button
            class="cp-clear"
            @click="onClearFilters"
            :disabled="isClearing || (minRating === 0 && !selectedKey)"
        >
          Clear filters
        </button>
      </aside>

      <!-- Main content -->
      <section class="cp-main" aria-live="polite">
        <!-- Error -->
        <p v-if="error" class="err">{{ error }}</p>

        <!-- Loading skeleton -->
        <div v-else-if="loading" class="cp-grid">
          <article v-for="n in 8" :key="n" class="card sk">
            <div class="imgbox sk-block"></div>
            <div class="body">
              <p class="name sk-line"></p>
              <p class="title sk-line"></p>
              <p class="meta sk-line small"></p>
            </div>
          </article>
        </div>

        <!-- Empty -->
        <p v-else-if="shownWines.length === 0 && tried" class="empty">
          No wines found for “{{ lastQuery }}”. Try a nearby category above or clear filters.
        </p>

        <!-- Results grid -->
        <div v-else class="cp-grid">
          <article v-for="w in shownWines" :key="w.id" class="card">
            <div class="imgbox">
              <img v-if="w.image" :src="w.image" :alt="w.name || 'Wine'" />
              <div v-else class="ph">🍷</div>
            </div>
            <div class="body">
              <h3 class="name">{{ w.name }}</h3>
              <p class="title">{{ w.winery || w.grape || '—' }}</p>
              <p class="meta">
                <span v-if="w.location">{{ w.location }}</span>
                <span v-if="w.rating"> · ★ {{ asNumber(w.rating).toFixed(1) }}</span>
              </p>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>
<script setup>
import { ref, computed } from 'vue'

/**
 * Minimal, dependency-free version to avoid “blank page” issues:
 * - Emojis only (no icon packages)
 * - Calls your existing backend endpoint: /api/wine-browser/search
 * - Robust rating parsing (number or {average})
 */

const CATS = [
  { key: 'beef',       label: 'Beef',        emoji: '🥩' },
  { key: 'pork',       label: 'Pork',        emoji: '🥓' },
  { key: 'lamb',       label: 'Lamb',        emoji: '🍖' },
  { key: 'poultry',    label: 'Poultry',     emoji: '🍗' },
  { key: 'fish',       label: 'Fish',        emoji: '🐟' },
  { key: 'pasta',      label: 'Pasta',       emoji: '🍝' },
  { key: 'spicy',      label: 'Spicy Food',  emoji: '🌶️' },
  { key: 'cheese',     label: 'Cheese',      emoji: '🧀' },
  { key: 'vegetarian', label: 'Vegetarian',  emoji: '🥗' },
]

// Rating steps for the segmented control
const RATING_STEPS = [0, 3.0, 3.5, 4.0, 4.5]

const selectedKey = ref('')
const minRating   = ref(0)
const isClearing  = ref(false)

const tried   = ref(false)
const loading = ref(false)
const error   = ref('')
const wines   = ref([])
const lastQuery = ref('')

/** Guarded number extraction for rating (handles number or {average}) */
function asNumber(r) {
  if (r == null) return 0
  if (typeof r === 'number') return r
  if (typeof r === 'object' && typeof r.average === 'number') return r.average
  const n = Number(r)
  return Number.isFinite(n) ? n : 0
}

/** Map category -> search query */
function queryFor(key) {
  switch (key) {
    case 'beef':       return 'cabernet';
    case 'pork':       return 'zinfandel';
    case 'lamb':       return 'syrah';
    case 'poultry':    return 'chardonnay';
    case 'fish':       return 'sauvignon';
    case 'pasta':      return 'chianti';
    case 'spicy':      return 'riesling';
    case 'cheese':     return 'chardonnay';
    case 'vegetarian': return 'pinot noir';
    default:           return 'red';
  }
}

/** Backend call (your existing route) */
async function fetchWinesFor(term) {
  tried.value = true
  lastQuery.value = term
  wines.value = []
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`/api/wine-browser/search?q=${encodeURIComponent(term)}&limit=60`)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || `Request failed (${res.status})`)
    }
    const data = await res.json()
    wines.value = Array.isArray(data?.results) ? data.results : []
  } catch (e) {
    error.value = e?.message || 'Failed to load wines.'
  } finally {
    loading.value = false
  }
}

/** Category click */
function selectCategory(c) {
  if (selectedKey.value === c.key) return
  selectedKey.value = c.key
  const term = queryFor(c.key)
  fetchWinesFor(term)
}

/** Rating segment click */
function setRating(r) {
  minRating.value = r
}

/** Derived list applying rating filter */
const shownWines = computed(() => {
  if (!Array.isArray(wines.value)) return []
  const min = minRating.value || 0
  return wines.value.filter(w => asNumber(w.rating) >= min)
})

/** Clear all filters and results */
async function onClearFilters() {
  try {
    isClearing.value = true
    minRating.value = 0
    selectedKey.value = ''
    wines.value = []
    error.value = ''
    lastQuery.value = ''
  } finally {
    isClearing.value = false
  }
}
</script>
<style scoped>
[v-cloak] { opacity: 0; }

/* Page — match LandingView’s light look */
.page{
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background:
      radial-gradient(1200px 500px at 10% -10%, #ffe8f0 0%, transparent 45%),
      radial-gradient(1200px 500px at 90% -10%, #fff3d6 0%, transparent 45%),
      linear-gradient(180deg, #ffffff, #f9fafb);
  color: #111;
  padding: 18px;
}

/* ===== Hero ===== */
.hero{
  text-align:center;
  margin: 4px auto 0;
  max-width: 900px;
  padding: 0 16px 8px;
}
.hero h1{
  margin: 0;
  font-weight: 900;
  font-size: clamp(2.1rem, 4.2vw, 3rem);
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #111; /* black for readability */
}
.hero .sub{
  margin: 10px auto 0;
  max-width: 720px;
  font-size: clamp(.98rem, 1.4vw, 1.05rem);
  line-height: 1.55;
  color: #333;
  opacity: .9;
}

/* ===== Layout: sidebar + main ===== */
.cp-wrap{
  width:100%;
  max-width:1200px;
  display:grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  margin-top: 8px;
}
@media (max-width: 900px){
  .cp-wrap{ grid-template-columns: 1fr; }
}

/* Sidebar */
.cp-sidebar{
  position: sticky;
  top: 16px;
  align-self: start;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
}
.cp-filters-title{
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #222;
}
.cp-filters-sub{
  margin: 14px 0 8px;
  font-size: .95rem;
  font-weight: 800;
  color: #333;
}

/* Categories */
.cp-cats{
  display: grid;
  gap: 8px;
}
.cp-cat{
  display:flex;
  align-items:center;
  gap:10px;
  width:100%;
  padding:10px 12px;
  border:1px solid #eee;
  background:#fafafa;
  border-radius:12px;
  cursor:pointer;
  transition: background .2s ease, box-shadow .2s ease, transform .1s ease;
}
.cp-cat:hover{ background:#f3f1f1; transform: translateY(-1px); }
.cp-cat.active{
  background:#fff;
  border-color:#ddd;
  box-shadow: inset 0 3px 8px rgba(0,0,0,.05);
}
.cp-emoji{ font-size: 1.1rem; }
.cp-label{ font-size: .98rem; color:#2f2724; }

/* Rating segmented control */
.cp-segbar{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cp-seg{
  border:1px solid #e9e3de;
  background:#faf7f4;
  color:#3a2c28;
  border-radius:999px;
  padding:.45rem .9rem;
  font-size:.95rem;
  line-height:1;
  cursor:pointer;
  transition: all .2s ease;
}
.cp-seg:hover{
  background:#f5f0ec;
  border-color:#d8ccc4;
  transform: scale(1.03);
}
.cp-seg.active{
  background:#111; color:#fff; border-color:#111;
}

/* Clear button */
.cp-clear{
  margin-top: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fafafa;
  cursor: pointer;
  transition: .15s ease;
}
.cp-clear:hover{ box-shadow: 0 2px 10px rgba(0,0,0,.06); }
.cp-clear:disabled{ opacity: .55; cursor: not-allowed; }

/* Main results */
.cp-main{ min-height: 240px; }

/* Grid of cards (Vivino-like) */
.cp-grid{
  display:grid;
  gap: 22px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (min-width:1100px){
  .cp-grid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width:900px){
  .cp-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width:520px){
  .cp-grid{ grid-template-columns: 1fr; }
}

.card{
  border:1px solid #eee; border-radius:14px; background:#fff;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
  overflow:hidden;
  transition: transform .14s ease;
}
.card:hover{ transform: translateY(-2px); }

.imgbox{
  height: 220px; display:flex; align-items:center; justify-content:center;
  background:#fafafa;
}
.imgbox img{
  max-height:200px; width:auto; object-fit:contain;
}
.ph{ font-size: 2rem; }

.body{ padding: 10px 12px 14px; text-align:center; }
.name{ font-size:14px; font-weight:700; margin:0 0 4px; color:#111; }
.title{ font-size:13px; margin:0 0 6px; color:#333; }
.meta{ font-size:12px; color:#666; margin:0; }

/* Error / Empty */
.err{ color:#b00020; text-align:center; }
.empty{ opacity:.9; text-align:center; }

/* Skeleton */
.sk .sk-block{ width:100%; height:220px; background:#f0f0f0; }
.sk .sk-line{ height:12px; background:#eee; border-radius:8px; margin:8px 0; }
.sk .sk-line.small{ width:60%; margin-inline:auto; }
</style>
