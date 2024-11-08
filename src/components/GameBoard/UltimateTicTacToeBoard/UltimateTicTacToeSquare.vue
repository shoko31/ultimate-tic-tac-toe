<template>
  <div v-if="board" class="ultimate-tic-tac-toe-square" :class="{ 'inactive': boardResult !== undefined }">
    <UltimateTicTacToeInnerSquare v-for="(square, i) of board" :key="i" :play="square"
      :playable="isPlayable && square === undefined" @click="squareClick(i)" />
    <transition name="fade">
      <div v-if="boardResult !== undefined" class="ultimate-tic-tac-toe-square-done"
        :class="{ o: boardResult === 'o', x: boardResult === 'x' }" />
    </transition>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { checkTicTacToeBoardState, type TicTacToeBoard } from '@/stores'

export interface TicTacToeSquareEvents {
  (e: 'click', index: number): void
}

export interface TicTacToeSquareProps {
  board?: TicTacToeBoard
  playable?: boolean
}

const emit = defineEmits<TicTacToeSquareEvents>()
const props = withDefaults(defineProps<TicTacToeSquareProps>(), { playable: false })
const isPlayable = useVModel(props, 'playable')
const board = useVModel(props, 'board')

const squareClick = (squareIndex: number) => {
  if (!isPlayable.value) return
  emit('click', squareIndex)
}

const boardResult = computed(() => checkTicTacToeBoardState(board.value))
</script>

<style lang="scss" scoped>
.ultimate-tic-tac-toe-square {
  position: relative;
  height: calc(100% - 30px);
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  margin: auto;
  padding: 15px;
  transition: 0.3s ease-in-out background-color;

  @media screen and (max-width: 620px) {
    padding: 5px;
    height: calc(100% - 10px);
  }

  @media screen and (max-width: 550px) {
    padding: 1px;
    height: calc(100% - 2px);
  }

  &.inactive {
    background-color: #0003;
  }

  &>* {
    border: 1px solid black;
  }

  .ultimate-tic-tac-toe-square-done {
    text-align: center;
    height: 100%;
    width: 100%;
    font-size: 100px;
    position: absolute;
    inset: 0 0;
    transition: all 0.15s ease-in-out;
    background-color: #000D;
    border: none;

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      transition: all 0.15s ease-in-out;
    }

    @media screen and (max-width: 620px) {
      font-size: 70px;
    }

    @media screen and (max-width: 550px) {
      font-size: 50px;
    }

    @media screen and (max-width: 450px) {
      font-size: 35px;
    }

    @media screen and (max-width: 400px) {
      font-size: 25px;
    }
  }
}
</style>
