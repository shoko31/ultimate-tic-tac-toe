<template>
  <div v-if="gameBoard" class="ultimate-tic-tac-toe-board">
    <UltimateTicTacToeSquare v-for="(board, i) of gameBoard" :key="i" :board="board"
      :class="{ 'inactive': !isBoardActive(i) }"
      :playable="!gameStore.gameResult && canPlay && gameStore.isTurnToPlay && isBoardActive(i)"
      @click="playAt(i, $event)" />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { checkTicTacToeBoardState, useGameStore, useRoomStore, type UltimateTicTacToeBoard } from '@/stores'

const gameStore = useGameStore()
const roomStore = useRoomStore()

const gameBoard = computed(() => {
  if (gameStore.gameBoard === undefined) return undefined
  if (!Array.isArray(gameStore.gameBoard[0])) return undefined
  return gameStore.gameBoard as UltimateTicTacToeBoard
})

const canPlay = computed(() => roomStore.gameJoined && gameStore.started)
const isBoardActive = (boardIndex: number) => gameStore.lastPlayedIndex === undefined
  || (checkTicTacToeBoardState(gameBoard.value?.[(gameStore.lastPlayedIndex - Math.floor(gameStore.lastPlayedIndex / 9) * 9)]) !== undefined)
  || (gameStore.lastPlayedIndex - Math.floor(gameStore.lastPlayedIndex / 9) * 9) === boardIndex

const playAt = (boardIndex: number, squareIndex: number) => {
  if (!canPlay.value) return
  if (!gameStore.isTurnToPlay) return

  roomStore.playAt(boardIndex * 9 + squareIndex)
}

// // DEBUG only
// onMounted(() => {
//   gameStore.gameMode = 'ultimate'
//   gameStore.createBoard()
// })
</script>

<style lang="scss" scoped>
.ultimate-tic-tac-toe-board {
  position: relative;
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: auto;
  padding: 25px;

  &>* {
    border: 1px solid black;
  }
}
</style>
