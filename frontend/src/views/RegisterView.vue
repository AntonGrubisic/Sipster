<template>
  <div class="wrap">
    <SiteHeader/>
    <form class="card" @submit.prevent="submit">
      <h2>Create Account</h2>

      <label>
        Name
        <input v-model="name" type="text" :disabled="isLoading"/>
      </label>
      <label>
        Email
        <input v-model="email" type="email" required :disabled="isLoading"/>
      </label>
      <label>
        Password
        <input v-model="password" type="password" required :disabled="isLoading"/>
      </label>

      <!-- FELMEDDELANDE -->
      <p v-if="error" class="error-message">{{ error }}</p>

      <button class="btn primary" type="submit" :disabled="isLoading">
        {{ isLoading ? 'Signing Up...' : 'Signup' }}
      </button>

      <p class="small">
        Already in the heat?
        <router-link to="/login">Login</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import { useRouter } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'
import { registerUser } from '../services/authService' // Importera servicen

const router = useRouter()
const name = ref('');
const email = ref('');
const password = ref('')
const error = ref(null)
const isLoading = ref(false)

const submit = async () => {
  error.value = null; // Rensa gamla fel
  isLoading.value = true;

  try {
    // FIXEN ÄR HÄR: Skickar ETT objekt ({ email, username, password })
    await registerUser({
      email: email.value,
      username: name.value, // Använder Name som Username
      password: password.value
    });

    // Vid lyckad registrering, skicka användaren till inloggningssidan
    router.push('/login');

  } catch (err) {
    // Fånga felmeddelandet från backend (t.ex. "Password is too weak")
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Befintlig CSS från dig */
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
  transition: background-color 0.2s;
}
.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.small {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-top: 10px;
}
.error-message {
  color: #e03131;
  background-color: #fcebeb;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  border: 1px solid #f99;
}
</style>