<template>
  <div class="bg-assets">
    <div class="bg-asset x"></div>
    <div class="bg-asset o"></div>
    <div class="bg-asset x"></div>
    <div class="bg-asset o"></div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.bg-assets {
  .bg-asset {
    display: block;
    position: fixed;
    font-size: min(25dvw, 250px);
    line-height: min(25dvw, 250px);
    text-transform: capitalize;
    z-index: -1;

    &:nth-child(1) {
      top: 0;
      right: 0;
      transform: translate(-50%, -50%) rotate(34deg);
    }
    &:nth-child(2) {
      bottom: 0;
      left: 0;
      transform: translate(-50%, -50%) rotate(-28deg);
    }
    &:nth-child(3) {
      bottom: 0;
      right: 0;
      transform: translate(-100%, -20%) rotate(-7deg);
    }
    &:nth-child(4) {
      top: 12dvh;
      left: 12dvw;
      transform: translate(-50%, -50%) rotate(-67deg);
    }
  }
}
</style>
