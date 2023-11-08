<template>
  <ul class="game-mode-select" :class="{ disabled: _disabled }">
    <li
      class="game-mode-option game-mode-option--regular"
      :class="{ selected: game.gameMode === 'regular' }"
      @click="changeGamemode('regular')"
    >
      <div class="grid">
        <div class="row">
          <div class="col x"></div>
          <div class="col"></div>
          <div class="col"></div>
        </div>
        <div class="row">
          <div class="col"></div>
          <div class="col x"></div>
          <div class="col"></div>
        </div>
        <div class="row">
          <div class="col o w"></div>
          <div class="col o w"></div>
          <div class="col o w"></div>
        </div>
      </div>
      <span class="game-mode-option--label">Regular</span>
    </li>
    <li
      class="game-mode-option game-mode-option--ultimate disabled"
      :class="{ selected: game.gameMode === 'ultimate' }"
      @click="false && changeGamemode('ultimate')"
    >
      <div class="grid">
        <div class="row" v-for="r in 3" :key="r">
          <div class="col" v-for="i in 3" :key="i">
            <div class="grid">
              <div class="row">
                <div class="col x"></div>
                <div class="col"></div>
                <div class="col"></div>
              </div>
              <div class="row">
                <div class="col"></div>
                <div class="col x"></div>
                <div class="col"></div>
              </div>
              <div class="row">
                <div class="col"></div>
                <div class="col"></div>
                <div class="col o"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class="game-mode-option--label">Ultimate</span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { useGameStore, type GameMode } from '@/stores'

export interface GameModeSelectProps {
  disabled?: boolean
}
const props = withDefaults(defineProps<GameModeSelectProps>(), { disabled: false })
const _disabled = useVModel(props, 'disabled')

const game = useGameStore()

const changeGamemode = (gm: GameMode) => {
  if (_disabled.value) return
  game.gameMode = gm
}
</script>

<style lang="scss" scoped>
.game-mode-select {
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 25px;

  .game-mode-option {
    user-select: none;
    cursor: pointer;
    border: 1.5px solid #333;
    height: 140px;
    width: 120px;
    border-radius: 4px;
    padding: 10px;
    gap: 5px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: transparent;
    transition: all 0.15s ease-in-out;

    &:not(.disabled):hover {
      background-color: #0001;
    }

    &.disabled {
      // background-color: #0006;
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--ultimate {
      font-size: 6px;
      .grid {
        padding: 2px;
      }

      & > .grid {
        padding: 1px;

        & > .row {
          border-bottom-width: 1.5px;
          & > .col {
            border-right-width: 1.5px;
          }
        }
      }
    }

    &.selected {
      border-color: #931a8d;
      outline-color: #931a8d;
      outline-style: solid;
      outline-width: 5px;
    }
  }

  &.disabled {
    .game-mode-option {
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }
  }
}

.grid {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  // height: 100%;
  // width: 100%;
  padding: 5px;
  box-sizing: border-box;
  aspect-ratio: 1;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
}
.row {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  justify-content: stretch;
  align-items: stretch;

  &:not(:last-of-type) {
    border-bottom: 0.5px solid #333;
  }
}

.col {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  justify-content: center;
  align-items: center;
  text-align: center;

  &:not(:last-of-type) {
    border-right: 0.5px solid #333;
  }
}

.game-mode-option--label {
  font-size: 1rem;
}
</style>
