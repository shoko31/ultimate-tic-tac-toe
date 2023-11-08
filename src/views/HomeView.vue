<template>
  <main :style="{ backgroundColor: store.backgroundColor }">
    <div class="form">
      <h1>Ultimate Tic Tac Toe</h1>
      <div class="divider"></div>
      <MyInput style="text-align: center" placeholder="Enter partner id" v-model="joinRoomId" />
      <MyButton @click="joinGame" :disabled="isLoading || !joinRoomId">Join</MyButton>
      <MyDivider />
      <MyButton @click="hostGame" :disabled="isLoading">Host</MyButton>
      <BackgroundDecoration />
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouteNames } from '@/router'
import { usePreferencesStore, useRoomStore } from '@/stores'

const router = useRouter()
const store = usePreferencesStore()
const room = useRoomStore()
const joinRoomId = ref('')

const isLoading = ref(false)

watch(joinRoomId, () => {
  let newCode = joinRoomId.value
  if (joinRoomId.value.startsWith('http')) {
    const tmp = joinRoomId.value.split('/')
    newCode = tmp[tmp.length - 1]
  }
  if (newCode.toUpperCase() !== newCode) {
    joinRoomId.value = newCode.toUpperCase()
  }
})

const joinGame = async () => {
  if (!joinRoomId.value) return
  if (isLoading.value) return
  isLoading.value = true
  await nextTick()
  router.push({ name: RouteNames.GAME, params: { id: joinRoomId.value.toLocaleLowerCase() } })
}

const hostGame = async () => {
  if (isLoading.value) return
  isLoading.value = true
  room.host()
  await nextTick()
  router.push({ name: RouteNames.GAME, params: { id: room.id } })
}
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  overflow: auto;
  box-sizing: border-box;

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: max-content;
    padding: 30px;
    gap: 30px;
  }
}
</style>
