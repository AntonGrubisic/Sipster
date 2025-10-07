<!-- frontend/src/App.vue -->
<template>
  <div id="app">
    <SiteHeader />
    <main class="site-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import SiteHeader from '@/components/SiteHeader.vue'
</script>

<style>
html, body, #app { height: 100%; }
body {
  margin: 0;
  background: #fff;
  color: #111;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}
.site-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding-top: 1rem;
}
</style>
