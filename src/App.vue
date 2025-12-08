<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 应用启动时，如果已登录，设置Token自动刷新
onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.checkAndRefreshToken()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>

