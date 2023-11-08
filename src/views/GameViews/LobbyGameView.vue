<template>
  <div class="game-lobby">
    <h1>Ultimate Tic Tac Toe</h1>
    <div style="text-align: center" v-if="roomStore.isHost">
      <p>Your invitation code :</p>
      <InvitationCode :disabled="!roomStore.id" :code="roomStore.id ?? '-'" />
    </div>
    <MyDivider />
    <GameModeSelect :disabled="!roomStore.isHost" />
    <MyDivider />
    <MyButton
      v-if="roomStore.isHost"
      @click="startGame"
      :disabled="!roomStore.gameJoined || isLoading"
    >
      <transition name="fade" mode="out-in">
        <span key="waiting-for-player" v-if="!roomStore.gameJoined"
          >Waiting for player 2<DotAnimation
        /></span>
        <span key="start" v-else>Start</span>
      </transition>
    </MyButton>
    <MyButton v-else disabled
      ><span key="waiting-for-player">Waiting for host<DotAnimation /></span
    ></MyButton>
  </div>
</template>

<script setup lang="ts">
import { useRoomStore } from '@/stores'

const roomStore = useRoomStore()
const isLoading = ref(false)

const startGame = async () => {
  if (!roomStore.isHost) return
  if (!roomStore.isInRoom) return
  if (!roomStore.isReady) return

  isLoading.value = true
  roomStore.start()
}
</script>

<style lang="scss" scoped>
.game-lobby {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: max-content;
  padding: 30px;
  gap: 30px;
}
</style>
