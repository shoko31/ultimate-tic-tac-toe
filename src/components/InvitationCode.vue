<template>
  <div class="invite-code" :class="{ disabled: isDisabled }">
    <MyInput class="invite-code" :model-value="code" readonly :disabled="isDisabled" />
    <div @click="copyInvitationCode" class="copy-btn">
      <CopyIcon class="icon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CopyIcon from '@/assets/icons/copy-link-icon.svg?component'
import { RouteNames } from '@/router'
import { toast } from 'vue3-toastify'

export interface InvitationCodeProps {
  code: string
  disabled?: boolean
}

const props = defineProps<InvitationCodeProps>()
const code = useVModel(props, 'code')
const isDisabled = useVModel(props, 'disabled')
const router = useRouter()

const { copy, copied } = useClipboard({ legacy: true, copiedDuring: 3000 })

const location = useBrowserLocation()
const roomUrl = computed(() => {
  return `${location.value.protocol}//${location.value.host}${
    router.resolve({ name: RouteNames.GAME, params: { id: code.value } }).href
  }`
})

const copyInvitationCode = async () => {
  if (isDisabled.value) return
  if (copied.value) return
  try {
    await copy(roomUrl.value)
    toast('Copied to clipboard!', {
      type: 'success'
    })
  } catch {
    toast('Failed to copy to clipboard :(', {
      type: 'error'
    })
  }
}
</script>

<style lang="scss" scoped>
.invite-code {
  position: relative;
  .copy-btn {
    height: calc(var(--input-font-size) * 1.3);
    width: calc(var(--input-font-size) * 1.3);
    position: absolute;
    top: 50%;
    right: 8px;
    translate: 0 -50%;
    border-radius: 5px;
    background-color: #00000011;
    box-sizing: border-box;
    border: 1px solid #00000033;
    cursor: pointer !important;
    transition: all 0.15s ease-in-out;

    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    padding: 4px;
    .icon {
      color: #777777;
    }
  }
  &:not(.disabled) {
    .copy-btn:hover {
      border-color: #00000044;
      scale: 1.05;
    }
  }

  &.disabled {
    cursor: default !important;
    user-select: none;

    .copy-btn {
      cursor: not-allowed !important;
    }
  }
}
</style>
