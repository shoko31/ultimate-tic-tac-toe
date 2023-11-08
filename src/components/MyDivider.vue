<template>
  <div class="divider"></div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.divider {
  display: inline-block;
  opacity: 0.6;
  &::before,
  &::after {
    display: inline-block;
    content: ' ';
    width: 50px;
    height: 1px;
    background-color: #444c;
    vertical-align: middle;
    margin: 0 10px;
    border-radius: 5px;
  }
}
</style>
