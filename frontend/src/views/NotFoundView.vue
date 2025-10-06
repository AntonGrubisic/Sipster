<template>
  <div class="not-found">
    <h1>404 – Page Not Found</h1>
    <p>The page you’re looking for doesn’t exist.</p>
    <router-link to="/">Go back to home</router-link>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem;
  color: #333;
}
a {
  color: #7b1113;
  text-decoration: underline;
}
</style>
