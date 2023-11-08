<template>
  <button
    @click.prevent="btnClicked"
    v-bind="$attrs"
    class="btn"
    type="button"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
export interface ButtonEvents {
  (e: 'click'): void
}

export interface ButtonProps {
  disabled?: boolean
}

const emit = defineEmits<ButtonEvents>()
const props = withDefaults(defineProps<ButtonProps>(), {
  disabled: false
})
const disabled = useVModel(props, 'disabled')

const btnClicked = () => {
  if (disabled.value) return
  emit('click')
}
</script>

<style lang="scss" scoped>
.btn {
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 40px;
  border: 1px solid rgba(0, 0, 0, 0.7);
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  outline-color: #ffa0a0;
  user-select: none;
  color: rgb(0, 0, 0);

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }

  &:active {
    background-color: rgba(190, 190, 190, 0.8);
  }

  &:disabled {
    background-color: rgba(160, 160, 160, 0.1);
    border-color: rgba(60, 60, 60, 0.4);
    color: rgba(100, 100, 100, 0.3);
    cursor: not-allowed;
  }
}
</style>
