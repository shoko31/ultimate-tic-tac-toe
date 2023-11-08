<template>
  <div class="game-board">
    <p class="player-symbol-label">You are <span :class="`${gameStore.playerSymbol}`"></span></p>
    <TicTacToeBoard />
    <div
      v-if="gameResultLabel"
      class="result-label"
      :class="{
        win: gameStore.gameResult === 'WIN',
        lost: gameStore.gameResult === 'LOST',
        draw: gameStore.gameResult === 'DRAW'
      }"
    >
      {{ gameResultLabel }}
    </div>
    <p v-else-if="!canPlay" class="waiting-opponent-label">
      Waiting for your opponent<DotAnimation />
    </p>
    <p v-else-if="gameStore.isTurnToPlay" class="turn-to-play-label">It's your turn to play!</p>
    <p v-else class="turn-to-play-label">It's your opponent's turn<DotAnimation /></p>
    <div v-if="roomStore.isHost" class="end-game-actions">
      <MyButton @click="backToLobby">Back to Lobby</MyButton>
      <MyButton @click="playAgain">Play again</MyButton>
    </div>
    <p v-if="!roomStore.isHost && gameStore.gameResult !== undefined" class="end-game-guest-label">
      Waiting for host<DotAnimation />
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useGameStore, useRoomStore } from '@/stores'

const gameStore = useGameStore()
const roomStore = useRoomStore()

const canPlay = computed(() => roomStore.gameJoined && gameStore.started)

const gameResultLabel = computed(() => {
  if (gameStore.gameResult === undefined) return undefined
  switch (gameStore.gameResult) {
    case 'DRAW':
      return 'DRAW!'
    case 'LOST':
      return 'You lost :('
    case 'WIN':
      return 'You win :D'
  }
})

const playAgain = () => {
  roomStore.playAgain()
}

const backToLobby = () => {
  roomStore.backToLobby()
}
</script>

<style lang="scss" scoped>
.game-board {
  flex-basis: 0;
  flex: 1 1;
  position: relative;
  box-sizing: border-box;

  p {
    padding: 0 25px;
    margin: 0;
  }

  .waiting-opponent-label {
    color: #0009;
    text-align: center;
    font-style: italic;
    font-size: 0.9em;
  }

  .player-symbol-label {
    text-align: center;
    font-size: 1.2em;
  }

  .turn-to-play-label {
    text-align: center;
  }

  .result-label {
    font-size: 4rem;
    text-align: center;
    text-shadow: 3px 3px 3px #0008;

    &.win {
      color: #178614;
    }
    &.lost {
      color: #861414;
    }

    &.draw {
      color: #8c03fc;
    }
  }

  .end-game-actions {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .end-game-guest-label {
    margin-top: 20px;
    color: #0009;
    text-align: center;
    font-style: italic;
    font-size: 0.9em;
  }
}
</style>
