<script setup>
import sipsterLogo from '../../public/sipster-logo.png'
</script>

<template>
  <img :src="sipsterLogo" alt="Sipster logo" class="logo" />
</template>

<style scoped>
.wrap { display:flex; justify-content:center; padding:32px 16px 8px; }
.logo { height: 44px; object-fit: contain; }
@media (min-width: 900px){ .logo{ height: 100px; } }
</style>
