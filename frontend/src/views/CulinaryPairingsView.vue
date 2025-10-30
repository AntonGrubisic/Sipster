<template>
  <main class="page">
    <!-- Hero -->
    <header class="hero">
      <h1>Perfect Culinary Pairings</h1>
      <p class="sub">
        Discover the perfect pairings for your favorite wines.
      </p>

      <!-- Categories -->
      <section class="pairings-grid" v-if="!selectedCategory">
        <article
            v-for="c in categories"
            :key="c.name"
            class="card"
            @click="selectCategory(c.name)"
        >
          <div class="icon">{{ c.icon }}</div>
          <h3>{{ c.name }}</h3>
        </article>
      </section>

      <!-- Results -->
      <section v-else class="results">
        <div class="results-header">
          <h2>Showing wines for: {{ selectedCategory }}</h2>
          <button class="clear-btn" @click="clearCategory">Clear filter</button>
        </div>

        <div v-if="loading" class="loading">Loading wines...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else class="wine-list">
          <li v-for="w in wines" :key="w.id" class="wine-item">
            {{ w.name }} - {{ w.country }}
          </li>
        </ul>
        >
      </section>
    </header>
  </main>
</template>

<script setup>
import {ref} from 'vue'

const categories = ref([
  {icon: '🥩', name: 'Beef'},
  {icon: '🐑', name: 'Lamb'},
  {icon: '🐄', name: 'Veal'},
  {icon: '🐖', name: 'Pork'},
  {icon: '🦌', name: 'Game'},
  {icon: '🍗', name: 'Poultry'},
  {icon: '🍄', name: 'Mushrooms'},
  {icon: '🧀', name: 'Cheese'},
  {icon: '🍝', name: 'Pasta'},
  {icon: '🌶️', name: 'Spicy Food'},
  {icon: '🍸', name: 'Aperitif'},
  {icon: '🐟', name: 'Fish & Seafood'},
  {icon: '🥦', name: 'Vegetarian'},
])

const selectedCategory = ref('')
const wines = ref([])
const loading = ref(false)
const error = ref('')

async function selectCategory(category) {
  selectedCategory.value = category
  loading.value = true
  error.value = ''
  wines.value = []

  try {
    // Här anropar vi API:t (temporärt samma som search)
    const res = await fetch(`/api/wine-browser/search?q=${encodeURIComponent(category)}&limit=10`)
    if (!res.ok) throw new Error(`Request failed (${res.status})`)

    const data = await res.json()
    wines.values = data.results || []
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load wines. Please try again.'
  } finally {
    loading.value = false
  }
}

function clearCategory() {
  selectedCategory.value = ''
  wines.values = []
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff, #fafafa);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #111;
  font-family: 'Playfair Display', serif;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.hero .sub {
  color: #555;
  font-size: 1.1rem;
}

/* Categories grid */
.pairings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
}

.card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Results section */
.results {
  max-width: 800px;
  width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.clear-btn {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: #f5f5f5;
}

.wine-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wine-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.error {
  color: red;
}

.loading {
  color: #666;
}
</style>