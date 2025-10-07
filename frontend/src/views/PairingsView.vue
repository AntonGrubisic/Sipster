<template>
  <main class="page" v-cloak>
    <!-- Hero -->
    <header class="hero">
      <h1>Culinary Harmony</h1>
      <p class="sub">
        Discover how fine wines and exquisite dishes come together in perfect balance.
      </p>
    </header>

    <!-- Category chooser -->
    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Browse by dish or style</h2>
        <small class="panel-help">Tap a category to see recommended wine pairings</small>
      </div>

      <div class="cat-grid">
        <button
            v-for="c in CATEGORIES"
            :key="c.key"
            class="cat"
            :class="{ active: activeKey === c.key }"
            @click="selectCategory(c)"
        >
          <span class="label">{{ c.label }}</span>
        </button>
      </div>
    </section>

    <!-- States -->
    <p v-if="error" class="err">{{ error }}</p>

    <!-- Skeleton -->
    <section v-else-if="loading" class="stack" aria-busy="true">
      <article v-for="n in 6" :key="n" class="pair-card sk">
        <div class="card-head">
          <div class="sk-line sk-w-40"></div>
        </div>
        <div class="chips">
          <span v-for="m in 5" :key="m" class="chip sk-pill sk-w-20"></span>
        </div>
      </article>
    </section>

    <!-- Empty -->
    <section v-else-if="!loading && results.length === 0 && tried" class="empty">
      No pairings found for “{{ lastQuery }}”. Try a nearby category above.
    </section>

    <!-- Results -->
    <section v-else class="stack" aria-live="polite">
      <article v-for="(group, i) in results" :key="i" class="pair-card">
        <div class="card-head">
          <h3 class="title">{{ group.title }}</h3>
          <small class="subtitle" v-if="group.subtitle">{{ group.subtitle }}</small>
        </div>
        <div class="chips">
          <button
              v-for="(item, j) in group.items"
              :key="j"
              class="chip"
              @click="quickSearch(item)"
              :title="item.reason ? item.reason : ''"
              :aria-label="`Search wines for ${item.query ?? item}`"
          >
            {{ item.query ?? item }}
          </button>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const CATEGORIES = [
  { key: 'beef',        label: 'Beef' },
  { key: 'lamb',        label: 'Lamb' },
  { key: 'veal',        label: 'Veal' },
  { key: 'pork',        label: 'Pork' },
  { key: 'game',        label: 'Game (venison)' },
  { key: 'poultry',     label: 'Poultry' },

  { key: 'lean-fish',   label: 'Lean fish' },
  { key: 'rich-fish',   label: 'Rich fish (salmon, tuna)' },
  { key: 'shellfish',   label: 'Shellfish' },

  { key: 'vegetarian',  label: 'Vegetarian' },
  { key: 'mushrooms',   label: 'Mushrooms' },
  { key: 'spicy-food',  label: 'Spicy food' },

  { key: 'soft-cheese', label: 'Mild & soft cheese' },
  { key: 'hard-cheese', label: 'Mature & hard cheese' },
  { key: 'goat-cheese', label: 'Goat cheese' },

  { key: 'appetizers',  label: 'Appetizers & snacks' },
  { key: 'pasta',       label: 'Pasta' },
  { key: 'cured-meat',  label: 'Cured meat' },
  { key: 'aperitif',    label: 'Aperitif' },
]

const activeKey = ref('')
const tried     = ref(false)
const loading   = ref(false)
const error     = ref('')
const results   = ref([])
const lastQuery = ref('')

function unslug(s = '') {
  return s.replace(/-/g, ' ')
}

/**
 * Accepts either of these backend shapes:
 * 1) { ok:true, results:[ { title, subtitle?, items:[ "Cabernet", ... ] } ] }
 * 2) { ok:true, results:[ { dish:"beef", recommends:[ { query, reason? }, ... ] }, ... ] }
 * Normalizes to:
 *   [{ title, subtitle, items: (string|{query,reason})[] }]
 */
function normalizeFromApi(data) {
  const arr = Array.isArray(data?.results) ? data.results : []
  return arr.map(g => {
    // If it’s the “recommends” shape:
    if (Array.isArray(g.recommends)) {
      return {
        title: g.title || g.dish || 'Recommended Pairings',
        subtitle: g.subtitle || '',
        items: g.recommends.map(r => (typeof r === 'string' ? { query: r } : r))
      }
    }
    // If it’s the “items” shape:
    const items = Array.isArray(g.items) ? g.items : []
    return {
      title: g.title || 'Recommended Pairings',
      subtitle: g.subtitle || '',
      items: items.map(r => (typeof r === 'string' ? { query: r } : r))
    }
  })
}

async function fetchPairings(term) {
  tried.value = true
  lastQuery.value = term
  results.value = []
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`/api/pairings/suggest?dish=${encodeURIComponent(term)}`)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || `Request failed (${res.status})`)
    }
    const data = await res.json()
    results.value = normalizeFromApi(data)
  } catch (e) {
    error.value = e?.message || 'Failed to suggest pairings'
  } finally {
    loading.value = false
  }
}

function selectCategory(c) {
  if (activeKey.value === c.key) return
  activeKey.value = c.key
  fetchPairings(unslug(c.key))
}

/** Accept both strings and {query,reason} */
function quickSearch(item) {
  const term = typeof item === 'string' ? item : (item?.query ?? '')
  if (!term) return
  activeKey.value = ''
  fetchPairings(term)
}
</script>

<style scoped>
[v-cloak] { opacity: 0; }

/* Page */
.page {
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
  display: grid;
  gap: 1.25rem;
  justify-content: center;
  text-align: center;
  background: #faf8f6;
}

/* Hero */
.hero {
  text-align: center;
  margin: 0.25rem auto 0;
  max-width: 900px;
  padding: 0 1rem 0.5rem;
}
.hero h1 {
  margin: 0;
  font-weight: 900;
  font-size: clamp(2.2rem, 4.2vw, 3.2rem);
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #3a2c28;
}
.hero h1::after {
  content: "";
  display: block;
  width: 84px; height: 3px;
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
  color: #5a4a45;
  opacity: 0.85;
}

/* Panel */
.panel {
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #ebe6e1;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 16px rgba(0,0,0,.05);
  text-align: left;
}
.panel-head {
  display: grid;
  gap: .25rem;
  padding: .25rem .25rem .5rem;
}
.panel-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #322825;
}
.panel-help { color: #7b6f69; }

/* Category grid */
.cat-grid {
  display: grid;
  gap: .25rem .5rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .cat-grid { grid-template-columns: 1fr; } }

.cat {
  display: flex;
  align-items: center;
  gap: .6rem;
  width: 100%;
  padding: .6rem .55rem;
  border: 0;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow .2s ease;
}
.cat:hover { background: #f8f5f2; transform: translateY(-2px); }
.cat:active { transform: translateY(0); }
.cat.active {
  background: #f4efea;
  box-shadow: 0 4px 12px rgba(0,0,0,.04) inset;
}
.label { font-size: .98rem; color: #2f2724; }

/* Results stack */
.stack {
  display: grid;
  gap: 1rem;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  padding: 0 .5rem;
}

/* Result card */
.pair-card {
  border: 1px solid #ebe6e1;
  border-radius: 16px;
  background: #fff;
  padding: 1rem 1rem 0.8rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.05);
  text-align: left;
}
.card-head {
  display: flex;
  gap: .5rem;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: .35rem;
}
.title {
  margin: 0;
  font-weight: 800;
  font-size: 1.1rem;
  color: #2f2724;
}
.subtitle { color: #7a6f6a; }
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding-bottom: .65rem;
}
.chip {
  border: 1px solid #e9e3de;
  background: #faf7f4;
  color: #3a2c28;
  border-radius: 999px;
  padding: .45rem .9rem;
  font-size: .95rem;
  line-height: 1;
  cursor: pointer;
  transition: all .25s ease;
}
.chip:hover {
  background: #f3eee9;
  border-color: #d5c9c0;
  transform: scale(1.07);
  box-shadow: 0 3px 6px rgba(0,0,0,.08);
}

/* Error / Empty */
.err   { color: #b00020; text-align: center; }
.empty { opacity: .9; text-align: center; }

/* Skeleton */
@keyframes shimmer { 0% { background-position: -450px 0; } 100% { background-position: 450px 0; } }
.sk .sk-line, .sk .sk-pill {
  background: linear-gradient(90deg, #f0ece8 25%, #f6f3f0 37%, #f0ece8 63%);
  background-size: 900px 100%;
  animation: shimmer 1.2s infinite linear forwards;
  border-radius: 8px;
}
.sk .sk-line { height: 16px; }
.sk .sk-pill { height: 26px; border-radius: 999px; display: inline-block; }
.sk-w-40 { width: 40%; }
.sk-w-20 { width: 20%; }
</style>
