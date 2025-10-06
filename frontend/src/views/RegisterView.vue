<template>
  <div class="wrap">
    <SiteHeader/>
    <form class="card" @submit.prevent="submit">

      <label>
        Name
        <input v-model="name" type="text"/>
      </label>
      <label>
        Email
        <input v-model="email" type="email" required/>
      </label>
      <label>
        Password
        <input v-model="password" type="password" required/>
      </label>
      <button class="btn primary" type="submit">Signup</button>
      <p class="small">Already in the heat?
        <router-link to="/login">Login</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import SiteHeader from '../components/SiteHeader.vue'
// TODO: koppla till register({name,email,password})
const name = ref('');
const email = ref('');
const password = ref('')
const submit = () => { /* call register and route to /login or / */
}
</script>

<style scoped>
.wrap {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  width: min(420px, 92%);
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 24px;
  margin-top: 24px;
}

h2 {
  margin: 0 0 12px;
  text-align: center;
}

label {
  display: block;
  font-size: 14px;
  margin: 12px 0;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.btn {
  margin-top: 10px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: #111;
  color: #fff;
  font-weight: 600;
}

.small {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 10px;
}
</style>
