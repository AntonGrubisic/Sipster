<template>
  <SiteHeader />

  <!-- Smooth page change -->
  <transition name="route-fade" mode="out-in" appear>
    <router-view />
  </transition>
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

/* subtle route fade to match the elegant vibe */
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity .28s ease, transform .28s ease;
}
</style>
