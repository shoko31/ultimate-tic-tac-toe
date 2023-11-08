<template>
  <div
    class="tic-tac-toe-square"
    :class="{ o: play === 'o', x: play === 'x', 'is-playable': playable }"
    @click="squareClick"
  ></div>
</template>

<script lang="ts" setup>
export interface TicTacToeSquareEvents {
  (e: 'click'): void
}

export interface TicTacToeSquareProps {
  play?: 'o' | 'x'
  playable?: boolean
}

const emit = defineEmits<TicTacToeSquareEvents>()
const props = withDefaults(defineProps<TicTacToeSquareProps>(), { playable: false })
const isPlayable = useVModel(props, 'playable')

const squareClick = () => {
  if (!isPlayable.value) return
  emit('click')
}
</script>

<style lang="scss" scoped>
.tic-tac-toe-square {
  text-align: center;
  height: 100%;
  font-size: 100px;
  position: relative;
  transition: all 0.15s ease-in-out;

  &.is-playable {
    cursor: pointer;
    &:hover {
      background-color: #0001;
    }
  }

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
</style>
