<template>
  <div class="wine-search">
    <form @submit.prevent="onSearch" class="search-form" role="search" aria-label="Wine search">
      <input
          v-model="q"
          type="text"
          inputmode="search"
          autocomplete="off"
          placeholder="Search wine, grape, winery, or region…"
          aria-label="Search wines"
          :disabled="loading"
      />
      <button type="submit" :disabled="loading || !q.trim()">Search</button>
    </form>

    <p v-if="loading" class="status">Loading…</p>
    <p v-if="error && !loading" class="error">{{ error }}</p>

    <ul v-if="results.length > 0 && !loading" class="results" aria-live="polite">
      <li v-for="w in results" :key="w.id" class="card">
        <div class="title">{{ w.name ?? 'Unknown wine' }}</div>
        <div class="meta">
          <span v-if="w.winery">{{ w.winery }} • </span>
          <span>{{ w.location || 'Unknown location' }}</span>
        </div>
        <div class="badges">
          <span class="badge">{{ w.style }}</span>
          <span v-if="w.price" class="badge">{{ w.price }}</span>
          <span v-if="w.rating" class="badge">⭐ {{ w.rating }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const q = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')
let inFlight = null // AbortController for cancelling previous requests

async function onSearch() {
  const term = q.value.trim()
  if (!term) return

  // cancel previous request if still running
  if (inFlight) inFlight.abort()
  inFlight = new AbortController()

  loading.value = true
  error.value = ''
  results.value = []

  try {
    const url = `/api/wines/search?q=${encodeURIComponent(term)}`
    const res = await fetch(url, { signal: inFlight.signal })
    if (!res.ok) throw new Error('Search failed')
    const data = await res.json()

    if ((data.count || 0) === 0) {
      error.value = `No wines matched “${term}”.`
    } else {
      results.value = data.results || []
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      error.value = err.message || 'Unexpected error'
    }
  } finally {
    loading.value = false
    inFlight = null
  }
}
</script>

<style scoped>
.wine-search {
  max-width: 560px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}
.search-form {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
button {
  padding: 0.6rem 0.9rem;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}
button:disabled,
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.status {
  margin-top: 1rem;
}
.error {
  margin-top: 1rem;
  color: #b00020;
}
.results {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}
.card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 0.9rem;
  margin-bottom: 0.6rem;
}
.title {
  font-weight: 600;
}
.meta {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.1rem;
}
.badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  font-size: 0.85rem;
}
.badge {
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
}
</style>
