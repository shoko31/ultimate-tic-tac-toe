<template>
  <div v-if="gameBoard" class="tic-tac-toe-board">
    <TicTacToeSquare
      v-for="(square, i) of gameBoard"
      :key="i"
      :play="square"
      :playable="!gameStore.gameResult && canPlay && gameStore.isTurnToPlay && square === undefined"
      @click="playAt(i)"
    />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { useGameStore, type TicTacToeBoard, useRoomStore } from '@/stores'

const gameStore = useGameStore()
const roomStore = useRoomStore()

const gameBoard = computed(() => {
  if (gameStore.gameBoard === undefined) return undefined
  if (Array.isArray(gameStore.gameBoard[0])) return undefined
  return gameStore.gameBoard as TicTacToeBoard
})

const canPlay = computed(() => roomStore.gameJoined && gameStore.started)

const playAt = (index: number) => {
  if (!canPlay.value) return
  if (!gameStore.isTurnToPlay) return

  roomStore.playAt(index)
}

// DEBUG only
// onMounted(() => {
//   gameStore.gameMode = 'regular'
//   gameStore.createBoard()
// })
</script>

<style lang="scss" scoped>
.tic-tac-toe-board {
  position: relative;
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: auto;
  padding: 25px;

  & > * {
    border: 1px solid black;
  }
}
</style>
