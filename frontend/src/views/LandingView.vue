<template>
  <div class="wrap">
    <img src="/sipster-logo.png" alt="Sipster" class="logo" />

    <p class="tagline">A clean, minimal wine guide. Sign in to get started.</p>

    <nav class="cta" aria-label="primary">
      <router-link to="/login" class="btn primary">Login</router-link>
      <router-link to="/register" class="btn ghost">Signup</router-link>
    </nav>
  </div>
</template>

<style scoped>
.wrap{
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding: 10vh 1rem 1rem;
  gap: 0;
  background: #fff;
  color: #111;
}

.logo {
  width: clamp(260px, 28vw, 360px);
  height: auto;
  opacity: 0;
  animation: fadeIn 1.2s ease forwards;
  transition: transform 0.25s ease;
}

.logo:hover {
  transform: scale(1.08);
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.tagline{
  margin: 0 0 clamp(12px, 2.5vw, 18px);
  color: #555;
  font-size: clamp(14px, 2.5vw, 16px);
}

.cta{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 16px);
  margin-top: 0.6rem;
}

.btn{
  text-decoration: none;
  padding: 0.8em 1.6em;
  border-radius: 12px;
  font-weight: 600;
  min-width: clamp(140px, 35vw, 200px);
  text-align: center;
  transition: transform .06s ease, background-color .15s ease, opacity .15s ease;
}
.btn:active{ transform: translateY(1px); }

.primary{ background:#111; color:#fff; }
.primary:hover{ opacity:.92; }

.ghost{ background:#fff; color:#111; border:1px solid #ddd; }
.ghost:hover{ background:#f7f7f7; }
</style>
