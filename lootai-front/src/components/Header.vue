<template>
  <header class="app-header">
    <h1 class="logo">igrai</h1>
  </header>
</template>

<script setup>
// фиксированное название
</script>

<style scoped>
.app-header {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.logo {
  position: relative;
  margin: 0;
  padding: 0px 10px;
  font-family: cursive;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-align: center;
  color: #25b9a0;
  /* color: #667eea; */
  background: linear-gradient(180deg, #1f1f1f 0%, #242424 100%);
  /* clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%); */
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border-top-style: none;
}
</style>
