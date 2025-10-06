<template>
  <main class="page">
    <header class="hero">
      <h1>Explore Wines by Style</h1>
      <p class="sub">Tap a style to browse examples from our catalog.</p>
    </header>

    <!-- Category tiles -->
    <section class="tiles">
      <button
          v-for="c in CATS"
          :key="c.key"
          class="tile"
          :class="{ active: c.key === selectedStyle }"
          @click="selectStyle(c.key)"
          :aria-pressed="c.key === selectedStyle"
      >
        <div class="emoji">{{ c.icon }}</div>
        <div class="label">{{ c.label }}</div>
      </button>
    </section>

    <!-- Filter input -->
    <section class="filter" v-if="selectedStyle">
      <input
          v-model="query"
          class="input"
          type="text"
          placeholder="Filter by wine, grape, or winery…"
          aria-label="Filter wines"
      />
    </section>

    <!-- State -->
    <p v-if="error" class="err">{{ error }}</p>
    <p v-else-if="loading" class="loading">Loading…</p>
    <p
        v-else-if="!loading && filteredWines.length === 0 && selectedStyle"
        class="empty"
    >
      No wines match “{{ query }}” in “{{ labelFor(selectedStyle) }}”.
    </p>

    <!-- Results -->
    <section v-if="filteredWines.length" class="grid">
      <article v-for="w in filteredWines" :key="w.id" class="card">
        <div class="thumb">
          <img v-if="w.image" :src="w.image" alt="" />
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
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

const CATS = [
  { key: 'reds', label: 'Red', icon: '🍷' },
  { key: 'whites', label: 'White', icon: '🥂' },
  { key: 'rose', label: 'Rosé', icon: '🌸' },
  { key: 'sparkling', label: 'Sparkling', icon: '✨' },
  { key: 'dessert', label: 'Dessert', icon: '🍮' }
]

const selectedStyle = ref('')
const wines = ref([])
const loading = ref(false)
const error = ref('')
const query = ref('')

function labelFor(styleKey) {
  const f = CATS.find(c => c.key === styleKey)
  return f ? f.label : styleKey
}

async function selectStyle(style) {
  if (selectedStyle.value === style) return
  selectedStyle.value = style
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
    wines.value = data.results || []
  } catch (e) {
    error.value = e.message || 'Failed to load wines.'
  } finally {
    loading.value = false
  }
}

const filteredWines = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return wines.value
  return wines.value.filter(w => {
    const name = (w.name || '').toLowerCase()
    const grape = (w.grape || '').toLowerCase()
    const winery = (w.winery || '').toLowerCase()
    return name.includes(q) || grape.includes(q) || winery.includes(q)
  })
})
</script>

<style scoped>
.page { min-height: 100vh; padding: 2rem 1rem; display: grid; gap: 1.25rem; }
.hero h1 { margin: 0; font-size: 2rem; font-weight: 800; }
.sub { margin: .25rem 0 0; opacity: .75; }

.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: .75rem; }
.tile {
  border: 1px solid #eee; border-radius: 16px; padding: 1rem;
  background: #fff; cursor: pointer; text-align: center;
  display: grid; gap: .4rem; place-items: center;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.tile:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,.05); }
.tile.active { border-color: #111; box-shadow: 0 10px 18px rgba(0,0,0,.06); }
.emoji { font-size: 1.6rem; }
.label { font-weight: 700; }

.filter { display: flex; margin-top: .25rem; }
.filter .input {
  flex: 1 1 auto; max-width: 520px; padding: .75rem 1rem;
  border: 1px solid #e7e7e7; border-radius: 12px;
}
.filter .input:focus { border-color: #bdbdbd; outline: none; }

.err { color: #b00020; }
.loading, .empty { opacity: .8; }

.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card {
  display: grid; grid-template-columns: 80px 1fr; gap: .75rem;
  border: 1px solid #eee; border-radius: 16px; padding: .75rem; background: #fff;
}
.thumb { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 1px solid #eee; display: grid; place-items: center; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.ph { font-size: 1.5rem; }
.info { display: grid; gap: .25rem; }
.name { margin: 0; font-size: 1rem; font-weight: 700; }
.meta { font-size: .9rem; opacity: .75; }
.foot { display: flex; gap: .5rem; align-items: center; margin-top: .25rem; }
.badge { font-size: .75rem; padding: .15rem .45rem; border: 1px solid #eee; border-radius: 999px; background: #f7f7f9; }
.rating { font-size: .85rem; }
</style>
