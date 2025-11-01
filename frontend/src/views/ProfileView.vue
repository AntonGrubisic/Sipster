<template>
  <div class="wrap">
    <div class="profile-card">
      <h2>Your Profile</h2>

      <!-- Visa standardavatar och info -->
      <div class="avatar-container">
        <!-- Standardavatar (Litet SVG-hus eller figur) -->
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <div v-if="loading" class="loading-message">
        Laddar profilinformation...
      </div>

      <div v-else-if="error" class="error-message">
        Fel vid laddning: {{ error }}
      </div>

      <!-- 🟢 Frontend: Visa användarnamn, e-post -->
      <div v-else class="user-details">
        <h3>{{ userData.username }}</h3>
        <p class="email">{{ userData.email }}</p>
      </div>

      <hr class="divider">

      <!-- Visar sparade favoriter -->
      <h3>Your Favorites ({{ favorites.length }})</h3>

      <div v-if="favoritesLoading" class="loading-message">
        Laddar dina sparade viner...
      </div>
      <div v-else-if="favorites.length === 0" class="no-favorites">
        Du har inga sparade favoriter än.
      </div>

      <ul v-else class="favorite-list">
        <!-- Loopa igenom de externa ID:n (t.ex. VIN1001) -->
        <li v-for="wineId in favorites" :key="wineId" class="favorite-item">
          <span>{{ wineId }}</span>
          <button @click="handleDeleteFavorite(wineId)" class="delete-btn">
            Radera
          </button>
        </li>
      </ul>

      <button @click="handleLogout" class="btn logout-btn">Logga ut</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Importera de tre nödvändiga service-funktionerna
import { getUserProfile, getFavorites, deleteFavorite, logoutUser } from '../services/authService';

const router = useRouter();

// STATE
const userData = ref({});
const favorites = ref([]);
const loading = ref(true);
const favoritesLoading = ref(true);
const error = ref(null);

// --- Metoder ---

/**
 * 🟢 Frontend: Hämta användarinfo från backend
 */
async function loadUserData() {
  loading.value = true;
  try {
    const data = await getUserProfile();
    userData.value = data;
  } catch (err) {
    // Om 401, token är ogiltig, tvinga utloggning
    if (err.status === 401) {
      handleLogout();
    } else {
      error.value = err.message || 'Kunde inte ladda profil.';
    }
  } finally {
    loading.value = false;
  }
}

/**
 * Laddar de sparade favorit-ID:na
 */
async function loadFavorites() {
  favoritesLoading.value = true;
  try {
    const data = await getFavorites();
    // Data är en array av strängar (t.ex. ['VIN1001', 'VIN1002'])
    favorites.value = data;
  } catch (err) {
    if (err.status !== 401) {
      console.error("Fel vid laddning av favoriter:", err);
    }
    favorites.value = [];
  } finally {
    favoritesLoading.value = false;
  }
}

/**
 * Raderar en favorit
 */
async function handleDeleteFavorite(wineId) {
  if (window.confirm(`Vill du verkligen ta bort ${wineId} från dina favoriter?`)) {
    try {
      await deleteFavorite(wineId);
      // Uppdatera listan efter radering
      await loadFavorites();
    } catch (err) {
      alert(`Fel vid radering: ${err.message}`);
    }
  }
}


function handleLogout() {
  logoutUser();
  router.push('/login');
}

// Körs när komponenten laddas
onMounted(() => {
  loadUserData();
  loadFavorites();
});
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 1rem;
}

.profile-card {
  width: min(400px, 100%);
  background: #fcfcfc;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

h2 {
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 24px;
  color: #111;
}

.avatar-container {
  margin-bottom: 20px;
}

.feather-user {
  width: 64px;
  height: 64px;
  color: #666;
  background: #eee;
  padding: 8px;
  border-radius: 50%;
}

.user-details h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.user-details .email {
  color: #777;
  font-size: 14px;
  margin-top: 5px;
}

.divider {
  border: none;
  height: 1px;
  background: #f0f0f0;
  margin: 30px 0;
}

.favorite-list {
  list-style: none;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
  margin-top: 15px;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  color: #444;
}
.favorite-item:last-child {
  border-bottom: none;
}

.delete-btn {
  background: #e03131;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
}
.delete-btn:hover {
  background: #c91f1f;
}

.btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: #111;
  color: #fff;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
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