<template>
  <main :style="{ backgroundColor: store.backgroundColor }">
    <transition name="fade" mode="out-in">
      <JoiningGameView v-if="isJoiningRoom" />
      <LobbyGameView v-else-if="!gameStore.started" />
      <InGameView v-else />
      <!-- <InGameView /> -->
    </transition>
    <BackgroundDecoration />
  </main>
</template>

<script setup lang="ts">
import LobbyGameView from './GameViews/LobbyGameView.vue'
import JoiningGameView from './GameViews/JoiningGameView.vue'
import { RouteNames } from '@/router'
import { useGameStore, usePreferencesStore, useRoomStore } from '@/stores'
import InGameView from './GameViews/InGameView.vue'

const route = useRoute()
const router = useRouter()
const store = usePreferencesStore()
const roomStore = useRoomStore()
const gameStore = useGameStore()

const isJoiningRoom = computed(() => route.params.id && !roomStore.isInRoom)

// TODO : Load room from URL (joining)
onBeforeMount(() => {
  if (!route.params.id && !roomStore.isInRoom) {
    router.replace({ name: RouteNames.HOME })
  }
})
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  overflow: auto;
  box-sizing: border-box;

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: max-content;
    padding: 30px;
    gap: 30px;
  }
}
</style>
