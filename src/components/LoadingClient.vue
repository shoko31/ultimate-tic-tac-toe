<template>
  <span class="loader">
    <label><slot>Loading...</slot></label>
  </span>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
$size: min(512px, 70dvw);
.loader {
  width: $size;
  height: $size;
  display: inline-block;
  position: relative;

  label {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    opacity: 0.6;
    font-size: min(1rem, 5vw);
  }
}

.loader::after,
.loader::before {
  content: '';
  box-sizing: border-box;
  width: $size;
  height: $size;
  border: 4px solid #fff;
  position: absolute;
  left: 0;
  top: 0;
  animation: animloader 2s ease-in-out infinite;
  opacity: 0;
}
.loader::after {
  border-color: #ff3d00;
  animation-delay: 1s;
}

@keyframes animloader {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(0.5);
    opacity: 0.75;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
