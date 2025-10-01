<template>
  <div class="wrap">
    <img src="/sipster-logo.png" alt="Sipster" class="logo"/>

    <nav class="cta" aria-label="primary">
      <router-link to="/login" class="btn primary">Logga in</router-link>
      <router-link to="/register" class="btn ghost">Registrera</router-link>
    </nav>
  </div>
</template>

<script setup>

</script>

<style scoped>

.wrap {
  min-height: 100svh;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(16px, 4vw, 28px);
  text-align: center;
  background: #fff;
  color: #111;
}


.logo {
  width: clamp(160px, 32vw, 320px);
  height: auto;
  object-fit: contain;
  max-width: 85vw;
}


.cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 16px);
  margin-top: clamp(6px, 2vw, 12px);
}

.btn {
  appearance: none;
  text-decoration: none;
  display: inline-block;
  line-height: 1;
  padding: clamp(12px, 2.8vw, 14px) clamp(16px, 4.5vw, 22px);
  border-radius: 12px;
  font-weight: 600;
  min-width: clamp(140px, 35vw, 200px);
  text-align: center;
  transition: transform .06s ease, background-color .15s ease, opacity .15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: translateY(1px);
}

.primary {
  background: #111;
  color: #fff;
}

.primary:hover {
  opacity: .92;
}

.ghost {
  background: #fff;
  color: #111;
  border: 1px solid #e6e6e6;
}

.ghost:hover {
  background: #f7f7f7;
}


@media (min-width: 480px) {
  .btn {
    min-width: 180px;
  }
}

@media (min-width: 768px) {
  .logo {
    width: clamp(220px, 22vw, 360px);
  }
}


@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
</style>
