<template>
  <header class="site-header">
    <!-- Logo row -->
    <div class="bar">
      <router-link to="/" class="logo-link" aria-label="Go to home">
        <img src="/sipster-logo.png" alt="Sipster" class="logo" />
      </router-link>
    </div>

    <!-- Tabs row -->
    <nav class="tabs" role="navigation" aria-label="Primary">
      <router-link to="/wines" class="tab" v-slot="{ isActive }">
        <span :class="['tlabel', { active: isActive }]">Wines</span>
      </router-link>

      <router-link to="/pairings" class="tab" v-slot="{ isActive }">
        <span :class="['tlabel', { active: isActive }]">Wine &amp; Dine</span>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
/* no script needed */
</script>

<style scoped>
/* sticky header area */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: saturate(1.1) blur(6px);
}

/* top bar with centered logo */
.bar {
  display: flex;
  justify-content: center;
  padding: 1rem 0.75rem 0.5rem;
  background: #fff;
}

.logo-link { display: inline-block; }
.logo      { width: clamp(120px, 20vw, 200px); height: auto; cursor: pointer; }

/* tabs row */
.tabs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.4rem 0.5rem;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.tab {
  text-decoration: none;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  transition: background .15s ease, transform .05s ease;
}
.tab:hover { background: #f8f6f4; }

.tlabel {
  display: inline-block;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  color: #2d2623;
  position: relative;
}

/* active underline (elegant gradient), plus subtle weight/opacity */
.tlabel.active {
  color: #241d1a;
}
.tlabel.active::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -6px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #bca897, #7b1113);
  opacity: .9;
}

/* mobile: keep spacing nice and airy */
@media (max-width: 560px) {
  .tabs { gap: 0.25rem; }
  .tlabel { padding: 0.42rem 0.75rem; }
}
</style>
