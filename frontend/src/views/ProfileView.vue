<template>
  <div class="wrap">
    <div class="profile-card">
      <!-- Topbar -->
      <nav class="topbar">
        <button class="back-btn" @click="goBack">← Back</button>
      </nav>

      <!-- Profile -->
      <div class="header">
        <div class="avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="feather feather-user">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <div v-if="loading" class="loading">Loading profile...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else class="user-details">
          <h2>{{ userData.username }}</h2>
          <p class="email">{{ userData.email }}</p>
        </div>
      </div>

      <hr class="divider"/>

      <!-- Favorites -->
      <section class="favorites">
        <h3>Your Favorites ({{ favorites.length }})</h3>

        <div v-if="favoritesLoading" class="loading">Loading your wines...</div>
        <div v-else-if="favorites.length === 0" class="empty">You have no saved favorites yet.</div>

        <ul v-else class="favorite-list">
          <li v-for="wineId in favorites" :key="wineId" class="favorite-item">
            <span>{{ wineId }}</span>
            <button @click="handleDeleteFavorite(wineId)" class="delete-btn">Remove</button>
          </li>
        </ul>
      </section>

      <!-- Actions -->
      <div class="actions">
        <button @click="handleLogout" class="btn logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, getFavorites, deleteFavorite, logoutUser } from '../services/authService'

const router = useRouter()
const userData = ref({})
const favorites = ref([])
const loading = ref(true)
const favoritesLoading = ref(true)
const error = ref(null)

function goBack() {
  router.push('/')
}

async function loadUserData() {
  loading.value = true
  try {
    userData.value = await getUserProfile()
  } catch (err) {
    if (err.status === 401) handleLogout()
    else error.value = err.message || 'Could not load profile.'
  } finally {
    loading.value = false
  }
}

async function loadFavorites() {
  favoritesLoading.value = true
  try {
    favorites.value = await getFavorites()
  } catch (err) {
    console.error('Error loading favorites:', err)
    favorites.value = []
  } finally {
    favoritesLoading.value = false
  }
}

async function handleDeleteFavorite(wineId) {
  if (confirm(`Remove ${wineId} from your favorites?`)) {
    try {
      await deleteFavorite(wineId)
      await loadFavorites()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }
}

function handleLogout() {
  logoutUser()
  router.push('/login')
}

onMounted(() => {
  loadUserData()
  loadFavorites()
})
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 50px 1rem;
  background:
      radial-gradient(800px 400px at 10% -10%, #ffe8f0 0%, transparent 45%),
      radial-gradient(800px 400px at 90% -10%, #fff3d6 0%, transparent 45%),
      linear-gradient(180deg, #ffffff, #f9fafb);
}

/* Profile Card */
.profile-card {
  width: min(440px, 100%);
  background: #fff;
  border: 1px solid #eee;
  border-radius: 18px;
  padding: 28px 30px 34px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  text-align: center;
  color: #111;
}

/* Topbar */
.topbar {
  display: flex;
  justify-content: flex-start;
}
.back-btn {
  border: none;
  background: transparent;
  color: #111;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  transition: opacity .15s ease;
}
.back-btn:hover { opacity: .7; }

/* Header */
.avatar {
  background: #f1f1f1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-details h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.email {
  color: #777;
  font-size: 14px;
  margin-top: 4px;
}

/* Divider */
.divider {
  border: none;
  height: 1px;
  background: #f0f0f0;
  margin: 26px 0;
}

/* Favorites */
.favorites h3 {
  font-size: 18px;
  margin-bottom: 14px;
  color: #222;
}
.favorite-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}
.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
}
.favorite-item:last-child { border-bottom: none; }

.delete-btn {
  background: #7b1113;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease;
}
.delete-btn:hover { background: #92171a; }

.empty {
  font-size: 14px;
  color: #777;
}

/* Buttons */
.actions {
  margin-top: 30px;
}
.btn.logout {
  width: 100%;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 0;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn.logout:hover {
  background: #333;
}

/* Messages */
.loading {
  color: #555;
  font-size: 14px;
}
.error {
  color: #b00020;
  background: #fde8eb;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
