<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <slot />
  </div>
</template>

<style lang="css">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-family: var(--font-family-brand);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #374151;
  border-top: 3px solid var(--text-onAccent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* .loading-state p {
  font-size: 16px;
  margin: 0;
  color: var(--text-secondary);
} */
</style>
