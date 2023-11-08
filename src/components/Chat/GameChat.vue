<template>
  <div class="game-chat">
    <div class="game-messages">
      <transition-group name="fade">
        <ChatMessage
          v-for="(msg, i) of gameStore.chatMessages"
          :key="i"
          :message="msg"
        ></ChatMessage>
      </transition-group>
    </div>
    <div class="chat-input">
      <MyInput @keypress.enter="sendChatMessage" v-model="chatInputText" />
      <MyButton @click="sendChatMessage" class="send-msg-btn">
        <SendIcon class="send-icon" />
      </MyButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SendIcon from '@/assets/icons/send.svg?component'
import { useGameStore, useRoomStore } from '@/stores'

const gameStore = useGameStore()
const roomStore = useRoomStore()

const chatInputText = ref('')

const sendChatMessage = async () => {
  if (!chatInputText.value) return
  roomStore.sendMessage(chatInputText.value)
  chatInputText.value = ''
}
</script>

<style lang="scss" scoped>
$chat-input-height: 52px;

.game-chat {
  height: 100%;
  width: 250px;
  background-color: #0001;
  border-radius: 5px;
  display: block;
  box-sizing: border-box;
  backdrop-filter: blur(30px);

  .game-messages {
    height: calc(100% - $chat-input-height);
    overflow: auto;
    overflow-x: hidden;
    padding: 5px;
    box-sizing: border-box;
  }

  .chat-input {
    display: block;
    box-sizing: border-box;
    height: $chat-input-height;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 5px;
    border-top: 1px solid #0004;
    background-color: rgb(236, 220, 196);
  }

  .send-msg-btn {
    height: 60%;
    aspect-ratio: 1;
    box-sizing: border-box;
    padding: 0;
    position: relative;
    border-radius: 10px;
  }
  .send-icon {
    height: 1rem;
    width: 1rem;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
  }
}
</style>
