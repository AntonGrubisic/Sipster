<template>
  <main class="page">
    <h1>Wine Search</h1>
    <WineSearch />
  </main>
</template>

<script setup>
import WineSearch from '../components/WineSearch.vue'
</script>

<style scoped>
.page {
  padding: 1rem;
  max-width: 720px;
  margin: 0 auto;
}
h1 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}
</style>
