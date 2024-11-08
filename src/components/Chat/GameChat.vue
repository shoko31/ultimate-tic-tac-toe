<template>
  <div class="game-chat">
    <div class="game-messages" ref="gameMessagesDiv">
      <transition-group name="fade">
        <ChatMessage v-for="(msg, i) of gameStore.chatMessages" :key="i" :message="msg"></ChatMessage>
      </transition-group>
      <div v-if="newMessageIndex !== undefined" class="new-messages" @click="scrollToNewMessage">New messages, click to
        scroll</div>
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
const gameMessagesDiv = ref<undefined | null | HTMLDivElement>();

const newMessageIndex = ref<undefined | number>(undefined)

const sendChatMessage = async () => {
  if (!chatInputText.value) return
  roomStore.sendMessage(chatInputText.value)
  chatInputText.value = ''
}

const scrollToNewMessage = () => {
  if (!gameMessagesDiv.value) return;
  if (newMessageIndex.value === undefined) return;
  console.log(gameMessagesDiv.value.children.length, newMessageIndex.value, gameMessagesDiv.value.children.item(newMessageIndex.value))
  if (gameMessagesDiv.value.children.length - 1 > newMessageIndex.value) {
    gameMessagesDiv.value.children.item(newMessageIndex.value)?.scrollIntoView({ behavior: 'smooth' });
  }
  newMessageIndex.value = undefined;
}

watchArray(gameStore.chatMessages, () => {
  if (!gameMessagesDiv.value) return;
  if (gameMessagesDiv.value.clientHeight + gameMessagesDiv.value.scrollTop >= gameMessagesDiv.value.scrollHeight) {
    newMessageIndex.value = undefined;
    // Auto scroll
    nextTick(() => {
      if (!gameMessagesDiv.value) return;
      gameMessagesDiv.value.children.item(gameMessagesDiv.value.children.length - 1)?.scrollIntoView({ behavior: 'smooth' });
    });
  } else if (newMessageIndex.value === undefined) {
    // Prepare to scroll to newly added message
    newMessageIndex.value = gameStore.chatMessages.length - 1;
  }
})
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

    .new-messages {
      cursor: pointer;
      position: absolute;
      bottom: 52px;
      left: 0;
      right: 0;
      padding: 5px;
      background-color: #000C;
      color: #E3E3E3;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
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
