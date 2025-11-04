<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <!-- Profile (left) -->
      <div class="profile-info">
        <div class="avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="identity">
          <h2 class="name">{{ loading ? 'Loading…' : userData.username }}</h2>
          <p class="email" v-if="!loading">{{ userData.email }}</p>
        </div>
      </div>

      <!-- Buttons (right) -->
      <div class="actions">
        <button class="btn ghost" @click="goBack">Back</button>
        <button class="btn primary" @click="handleLogout">Logout</button>
      </div>
    </header>

    <!-- Favorites Section -->
    <main class="main">
      <section class="panel">
        <h2>Favorites <span class="count">({{ favorites.length }})</span></h2>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-else-if="favoritesLoading" class="muted">Loading your wines…</p>
        <p v-else-if="favorites.length === 0" class="muted">You have no saved favorites yet.</p>

        <ul v-else class="fav-list">
          <li v-for="wineId in favorites" :key="wineId" class="fav-item">
            <span>{{ wineId }}</span>
            <button class="remove" @click="handleDeleteFavorite(wineId)">Remove</button>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, getFavorites, deleteFavorite, logoutUser } from '@/services/authService'

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
  } catch {
    favorites.value = []
  } finally {
    favoritesLoading.value = false
  }
}

async function handleDeleteFavorite(wineId) {
  if (!confirm(`Remove ${wineId} from your favorites?`)) return
  try {
    await deleteFavorite(wineId)
    await loadFavorites()
  } catch (err) {
    alert(err.message || 'Failed to remove')
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
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
      radial-gradient(900px 450px at 10% -10%, #ffe8f0 0%, transparent 45%),
      radial-gradient(900px 450px at 90% -10%, #fff3d6 0%, transparent 45%),
      linear-gradient(180deg, #ffffff, #f9fafb);
  color: #111;
}

/* ===== HEADER ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 12px 40px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.04);
  width: 100%;
  height: 72px;
  box-sizing: border-box;
}

/* Profile info */
.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f3f3f3;
  display: grid;
  place-items: center;
  border: 1px solid #ddd;
}

.identity {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.name {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}
.email {
  margin: 2px 0 0;
  font-size: 14px;
  color: #666;
}

/* Buttons */
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-right: 10px;
}

.btn {
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px 14px;
  font-size: 14px;
  transition: background 0.15s ease, color 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}

.btn.primary {
  background: #111;
  color: #fff;
  border: 1px solid #111;
}
.btn.primary:hover {
  background: #333;
}

.btn.ghost {
  background: #fff;
  color: #111;
  border: 1px solid #ddd;
}
.btn.ghost:hover {
  background: #f8f8f8;
}

/* ===== MAIN ===== */
.main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
}

.panel {
  width: min(720px, 100%);
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(0,0,0,0.05);
  padding: 20px 24px;
}

.panel h2 {
  margin: 0 0 12px;
  text-align: center;
  font-weight: 800;
  font-size: 20px;
}
.count { color: #555; }

.muted {
  color: #666;
  text-align: center;
  margin: 12px 0;
}
.error {
  color: #b00020;
  background: #fde8eb;
  border: 1px solid #f5b1bb;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  margin: 10px auto;
}

/* ===== FAVORITE LIST ===== */
.fav-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
}
.fav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 10px 12px;
}
.remove {
  border: 1px solid #7b1113;
  background: #fff;
  color: #7b1113;
  border-radius: 10px;
  padding: 6px 10px;
  font-weight: 700;
  cursor: pointer;
}
.remove:hover { background: #fff3f3; }

/* Responsiv fix */
@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    gap: 10px;
    padding: 10px 20px;
  }
  .actions {
    margin-right: 0;
    align-self: flex-end;
  }
}
</style>
