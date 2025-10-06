<template>
  <main class="page">
    <h1>Wine & Food Pairings</h1>

    <section class="search">
      <input
          v-model="dish"
          @keyup.enter="runSearch"
          class="input"
          type="text"
          placeholder='Type a dish, e.g. "fish" or "Beef Wellington"'
          aria-label="Dish name"
      />
      <button class="btn" @click="runSearch" :disabled="loading || !dish.trim()">Search</button>
    </section>

    <p v-if="error" class="err">{{ error }}</p>
    <p v-else-if="!loading && touched && results.length === 0" class="empty">
      No pairing suggestions for “{{ lastQuery }}”.
    </p>

    <section v-if="results.length" class="grid">
      <article v-for="rec in results" :key="rec.idea.query" class="card">
        <div class="head">
          <h3 class="wine">{{ rec.idea.query }}</h3>
          <span class="tag" :class="rec.idea.level">{{ rec.idea.level }}</span>
        </div>
        <p class="reason">{{ rec.idea.reason }}</p>
        <ul class="examples">
          <li v-for="w in rec.matches" :key="w.id">
            <div class="wine-row">
              <img v-if="w.image" :src="w.image" alt="" />
              <div>
                <div class="name">{{ w.name }}</div>
                <div class="meta">
                  <span v-if="w.grape">{{ w.grape }}</span>
                  <span v-if="w.winery"> • {{ w.winery }}</span>
                  <span v-if="w.location"> • {{ w.location }}</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </section>

    <p v-if="loading" class="loading">Loading…</p>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const dish = ref('')
const lastQuery = ref('')
const loading = ref(false)
const error = ref('')
const touched = ref(false)
const results = ref([])

async function runSearch() {
  const q = dish.value.trim()
  touched.value = true
  error.value = ''
  results.value = []
  lastQuery.value = q
  if (!q) return
  loading.value = true

  try {
    const res = await fetch(`/api/pairings/suggest?dish=${encodeURIComponent(q)}&limit=4`)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || `Request failed (${res.status})`)
    }
    const data = await res.json()
    results.value = data.recommendations || []
  } catch (e) {
    error.value = e.message || 'Failed to fetch pairings'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { min-height: 100vh; padding: 2rem 1rem; display: grid; gap: 1rem; }
h1 { margin: 0 0 .25rem; font-size: 2rem; font-weight: 800; }
.search { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
.input { flex: 1 1 320px; max-width: 520px; padding: .75rem 1rem; border: 1px solid #e7e7e7; border-radius: 12px; }
.btn { padding: .7rem 1rem; border-radius: 12px; border: 1px solid #111; background:#111; color:#fff; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.err { color: #b00020; }
.empty { opacity: .8; }
.loading { opacity: .7; font-style: italic; }
.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card { border: 1px solid #eee; border-radius: 16px; padding: 1rem; background:#fff; box-shadow: 0 2px 10px rgba(0,0,0,.03); }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: .5rem; }
.wine { margin: 0; font-size: 1.1rem; }
.tag { font-size: .75rem; padding: .2rem .5rem; border-radius: 999px; border: 1px solid #ddd; text-transform: uppercase; letter-spacing: .04em; }
.tag.gourmet { background: #fff8ef; border-color: #f1e0c8; }
.tag.basic { background: #f6f7f9; }
.reason { margin: 0 0 .25rem 0; opacity: .8; }
.examples { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.wine-row { display: grid; grid-template-columns: 44px 1fr; gap: .6rem; align-items: center; }
.wine-row img { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
.name { font-weight: 600; }
.meta { font-size: .9rem; opacity: .7; }
</style>
