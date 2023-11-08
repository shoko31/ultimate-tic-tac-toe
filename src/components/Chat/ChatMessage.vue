<template>
  <div class="game-chat-message" :class="classes">
    <component v-if="icon" class="icon" :is="icon" />
    <span v-else-if="isOPlay" class="icon o"></span>
    <span v-else-if="isXPlay" class="icon x"></span>
    <template v-if="message.origin === 'LOCAL' || message.origin === 'NETWORK'"
      ><span :class="messageUserColorClass">{{ isMyMessage ? 'Me' : 'Guest' }}</span
      >: </template
    >{{ message.text }}
  </div>
</template>

<script lang="ts" setup>
import InfoIcon from '@/assets/icons/info-circle.svg?component'
import AlertIcon from '@/assets/icons/alert-triangle.svg?component'
import { useGameStore } from '@/stores'

export interface ChatMessageProps {
  message: ReturnType<typeof useGameStore>['chatMessages'][number]
}

const gameStore = useGameStore()

const props = defineProps<ChatMessageProps>()
const message = useVModel(props, 'message')

const icon = computed(() => {
  if (message.value.origin === 'SYSTEM' && message.value.type === 'info') return InfoIcon
  if (message.value.origin === 'SYSTEM' && message.value.type === 'game-won') return InfoIcon
  if (message.value.origin === 'SYSTEM' && message.value.type === 'game-lost') return InfoIcon
  if (message.value.origin === 'SYSTEM' && message.value.type === 'network-state') return AlertIcon

  return undefined
})

const isOPlay = computed(() => message.value.origin === 'SYSTEM' && message.value.type === 'o-play')
const isXPlay = computed(() => message.value.origin === 'SYSTEM' && message.value.type === 'x-play')

const isMyMessage = computed(() => message.value.origin === 'LOCAL')

const classes = computed(() => {
  let classList = []
  if (message.value.origin === 'SYSTEM' && message.value.type === 'game-won')
    classList.push('is-success')
  if (message.value.origin === 'SYSTEM' && message.value.type === 'game-lost')
    classList.push('is-danger')
  if (message.value.origin === 'SYSTEM' && message.value.type === 'network-state')
    classList.push('is-system')
  if (message.value.origin === 'SYSTEM' && message.value.type === 'info') classList.push('is-info')
  if (isOPlay.value || isXPlay.value) classList.push('can-hover')

  if (icon.value || isOPlay.value || isXPlay.value) classList.push('game-chat-message--with-icon')

  return classList.join(' ')
})

const messageUserColorClass = computed(() => {
  const symbol =
    message.value.origin === 'LOCAL' ? gameStore.playerSymbol : gameStore.opponentSymbol
  return symbol === 'o' ? 'red' : 'blue'
})
</script>

<style lang="scss" scoped>
.game-chat-message {
  display: block;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  border-radius: 5px;
  background-color: #fff8;
  transition: all 0.15s ease-in-out;

  &--with-icon {
    padding-left: 32px;
  }

  .icon {
    position: absolute;
    left: 8px;
    top: 50%;
    translate: 0 -50%;
    width: 1em;
    height: 1em;

    &::after {
      width: 1em;
      height: 1em;
      font-size: 1em;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      inset: 0;
      // translate: 0 -50%;
    }
  }

  &.is-info {
    .icon {
      color: #8220d3;
    }
  }

  &.is-success {
    .icon {
      color: #30bb40;
    }
  }

  &.is-danger {
    .icon {
      color: #bb3930;
    }
  }

  &.is-system {
    background-color: #333;
    color: #e3e3e3;
    .icon {
      color: #f4944a;
    }
  }

  &.can-hover:hover {
    background-color: #fffc;
    scale: 1.01;
    box-shadow: 2px 2px 2px #0009;
  }
}
</style>
