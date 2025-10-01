<template>
  <div class="wrap">
    <SiteHeader />
    <form class="card" @submit.prevent="submit">
      <h2>Logga in</h2>
      <label>
        E-post
        <input v-model="email" type="email" required />
      </label>
      <label>
        Lösenord
        <input v-model="password" type="password" required />
      </label>
      <button class="btn primary" type="submit">Logga in</button>
      <p class="small">Har du inget konto? <router-link to="/register">Registrera</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
// TODO: koppla till auth.service.js
const email = ref(''); const password = ref('')
const submit = () => { /* call login({email,password}) och navigera */ }
</script>

<style scoped>
.wrap{ min-height:100dvh; display:flex; flex-direction:column; align-items:center; }
.card{ width:min(420px, 92%); border:1px solid #eee; border-radius:14px; padding:24px; margin-top:24px; }
h2{ margin:0 0 12px; }
label{ display:block; font-size:14px; margin:12px 0; }
input{ width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; }
.btn{ margin-top:10px; width:100%; padding:12px 16px; border-radius:10px; border:none; background:#111; color:#fff; font-weight:600; }
.small{ text-align:center; font-size:13px; color:#666; margin-top:10px; }
</style>
