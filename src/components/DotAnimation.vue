<template>
  <span class="dot-animation">
    <span class="dot">.</span>
    <span class="dot">.</span>
    <span class="dot">.</span>
  </span>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.dot-animation {
  .dot {
    animation-name: dotanimation;
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;

    @for $i from 1 through 3 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.18}s;
      }
    }
  }

  @keyframes dotanimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
