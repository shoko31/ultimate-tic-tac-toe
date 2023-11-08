<template>
  <div class="joining-game">
    <LoadingClient>Connecting...</LoadingClient>
  </div>
</template>

<script lang="ts" setup>
import { RouteNames } from '@/router'
import { useRoomStore } from '@/stores'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const room = useRoomStore()

// const clientOldId = useLocalStorage<string | undefined>('ultimate-tic-tac-toc--uuid', undefined)

const connectToRoom = async (id: string) => {
  if (localStorage && localStorage.getItem('ultimate-tic-tac-toc--host-mode') === '1') {
    // Game didn't start yet
    // Go back to host page
    room.host()
  } else if (localStorage && localStorage.getItem('ultimate-tic-tac-toc--host-mode') === '2') {
    // Game already started
    // Do nothing, wait for guest to re-join and share state
    console.log('Entering host recovery mode. Waiting for guest to re-connect...')
  } else {
    const result = await room.join(id)
    if (!result) {
      await router.replace({ name: RouteNames.HOME })
      await nextTick()
      toast('Invalid invitation code', {
        type: 'error'
      })
    }
  }
}

onMounted(async () => {
  if (typeof route.params.id === 'string') {
    connectToRoom(route.params.id)
  } else {
    await router.replace({ name: RouteNames.HOME })
    await nextTick()
    toast('Invalid invitation code', {
      type: 'error'
    })
  }
})
</script>
