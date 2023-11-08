<template>
  <div class="in-game">
    <GameBoard />
    <GameChat />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.in-game {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
