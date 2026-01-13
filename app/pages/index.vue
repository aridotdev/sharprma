<script setup lang="ts">
definePageMeta({
  middleware: ['auth-redirect'],
})
</script>

<template>
  <!-- Optional: simple loading / splash -->
  <div class="flex h-screen items-center justify-center">
    <span class="text-sm text-gray-500">
      Redirecting...
    </span>
  </div>
</template>
