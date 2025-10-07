<!-- frontend/src/components/SiteHeader.vue -->
<template>
  <header class="site-header">
    <div class="inner">
      <router-link to="/" class="logo-link" aria-label="Go to home">
        <img src="/sipster-logo.png" alt="Sipster" class="logo" />
      </router-link>

      <nav class="nav">
        <router-link to="/wines" class="nav-item" active-class="active">Wines</router-link>
        <router-link to="/pairings" class="nav-item" active-class="active">Wine &amp; Dine</router-link>
        <router-link to="/login" class="nav-item" active-class="active">Login</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.inner {
  width: min(1100px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-link { display: inline-block; }
.logo {
  width: clamp(120px, 18vw, 200px);
  height: auto;
  cursor: pointer;
  transition: transform .2s ease;
}
.logo:hover { transform: scale(1.03); }

.nav {
  display: flex;
  gap: 1.1rem;
}
.nav-item {
  text-decoration: none;
  color: #3a2c28;
  font-weight: 600;
  font-size: 0.98rem;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color .2s ease, border-color .2s ease;
}
.nav-item:hover {
  color: #7b1113;
  border-bottom-color: #bca897;
}
.nav-item.active {
  color: #7b1113;
  border-bottom-color: #7b1113;
}
</style>
