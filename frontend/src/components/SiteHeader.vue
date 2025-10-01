<template>
  <header class="site-header">
    <router-link to="/" class="logo-link">
      <img src="/sipster-logo.png" alt="Sipster" class="logo" />
    </router-link>
  </header>
</template>

<script setup>
</script>

<style scoped>
.site-header {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.logo-link {
  display: inline-block;
}

.logo {
  width: clamp(120px, 20vw, 200px);
  height: auto;
  cursor: pointer;
}
</style>
