<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <div v-if="roomStore.networkError" class="status-component status-component--with-shadow">
        <NoNetwork />
      </div>
      <component :is="Component" v-else-if="roomStore.isReady" />
      <div v-else class="status-component">
        <LoadingClient />
      </div>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useRoomStore } from './stores'

// Initialise game client
const roomStore = useRoomStore()

useEventListener('beforeunload', () => {
  roomStore.$dispose()
})
</script>

<style scoped lang="scss">
.status-component {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;

  &--with-shadow {
    &::before {
      content: ' ';
      display: block;
      position: fixed;
      inset: 0;
      background: #000;
      opacity: 0.5;
      z-index: 1;
    }
  }

  & > * {
    z-index: 2;
  }
}
</style>
