<script setup lang="ts">

</script>

<template>
  <UDashboardPanel
    id="users"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="User Management">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto bg-amber-500">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
