<template>
  <div class="wrap">
    <img src="/sipster-logo.png" alt="Sipster" class="logo" />

    <div v-if="!isAuthenticated" class="content">
      <!-- Visas när användaren ÄR UTlOGGAD -->
      <p class="tagline">A clean, minimal wine guide. Sign in to get started.</p>
      <nav class="cta" aria-label="primary">
        <router-link to="/login" class="btn primary">Login</router-link>
        <router-link to="/register" class="btn ghost">Signup</router-link>
      </nav>
    </div>

    <div v-else class="content">
      <!-- Visas när användaren ÄR INLOGGAD -->
      <p v-if="loading" class="tagline">Loading protected data...</p>
      <p v-else-if="error" class="tagline error">Error: {{ error }}</p>
      <p v-else class="tagline success">
        <!-- Message kommer från backendens /api/protected rutt -->
        {{ protectedMessage }}
      </p>

      <nav class="cta" aria-label="primary">
        <button @click="handleLogout" class="btn primary">Logout</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Importera de nödvändiga funktionerna från servicen
import { getProtectedData, logoutUser } from '../services/authService';

const router = useRouter();

// STATE
const protectedMessage = ref('');
const loading = ref(true);
const error = ref(null);

// Kontrollerar om en token finns i localStorage
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('userToken');
});

/**
 * Hämtar skyddad data från backend med token.
 */
async function loadProtectedData() {
  if (!isAuthenticated.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await getProtectedData();
    // Sparar det engelska välkomstmeddelandet från backend
    protectedMessage.value = data.message;
  } catch (err) {
    // Om backend returnerar 401 (token utgånget/ogiltig), logga ut
    if (err.status === 401) {
      handleLogout();
    } else {
      // Annat fel (t.ex. nätverksfel)
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
}

/**
 * Loggar ut användaren genom att ta bort token och navigera.
 */
function handleLogout() {
  logoutUser();
  router.push('/login'); // Skicka till loginsidan efter utloggning
}

// Ladda data när komponenten först laddas och även när den återvänder
onMounted(() => {
  // Kontrollera om användaren är inloggad vid sidladdning
  if (isAuthenticated.value) {
    loadProtectedData();
  }
});

</script>

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

.content {
  margin-top: 2rem;
}

.tagline{
  margin: 0 0 clamp(12px, 2.5vw, 18px);
  color: #555;
  font-size: clamp(14px, 2.5vw, 16px);
}

.tagline.success {
  color: #058800;
  font-weight: 600;
}

.tagline.error {
  color: #ff3333;
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