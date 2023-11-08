<template>
  <div class="my_input_wrap" :class="{ disabled }">
    <input
      v-bind="$attrs"
      :placeholder="placeholder"
      type="text"
      autocomplete="off"
      class="my_input"
      v-model="modelValue"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts" setup>
export interface MyInputEvents {
  (e: 'update:modelValue', value: string): void
}

export interface MyInputProps {
  placeholder?: string
  disabled?: boolean
  modelValue: string
}

const emit = defineEmits<MyInputEvents>()
const props = defineProps<MyInputProps>()
const modelValue = useVModel(props, 'modelValue', emit)
</script>

<style lang="scss" scoped>
.my_input_wrap {
  position: relative;
  width: 100%;
  box-sizing: unset;
  font-family: var(--input-font-family);
  user-select: none;
}

.my_input {
  background-color: var(--input-background-color);
  color: var(--input-text-color);

  border-radius: var(--input-border-radius);
  font-family: var(--input-font-family);
  border: 1px solid var(--input-border-color);
  outline: none;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
  font-size: var(--input-font-size);
  line-height: calc(var(--input-font-size) * 1.5);
  padding: var(--input-input-padding);
  box-sizing: border-box;

  text-overflow: ellipsis;

  // padding-inline-start: var(--dp-input-icon-padding);

  &:not(:disabled):hover {
    color: var(--input-hover-text-color);
    border-color: var(--input-border-color-hover);
  }

  &:disabled {
    user-select: none;
    pointer-events: none;
    color: #00000077 !important;
  }
}

.my_input_icon {
  stroke: currentcolor;
  fill: currentcolor;

  position: absolute;
  top: 50%;
  inset-inline-end: 0;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--dp-icon-color);

  display: inline-block;
  width: var(--dp-font-size);
  height: var(--dp-font-size);
  stroke-width: 0;
  font-size: var(--dp-font-size);
  line-height: calc(var(--dp-font-size) * 1.5);
  padding: 6px 12px;
  box-sizing: content-box;
}
</style>
