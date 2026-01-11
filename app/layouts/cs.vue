<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Reports'
}])

const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      onSelect: () => {
        navigateTo('/cs/profile')
      }
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => {
        navigateTo('/cs/logout')
      }
    }
  ]
])
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <img
          src="/Logo.png"
          class="h-10 w-auto"
          alt="RMA Portal Logo"
        >
      </template>

      <template #right>
        <div class="flex items-center gap-1.5 lg:flex-none">
          <UNavigationMenu :items="items" />

          <UColorModeButton />

          <UDropdownMenu :items="dropdownItems">
            <UButton
              icon="i-lucide-user"
              color="neutral"
              variant="ghost"
              size="sm"
              square
            />
          </UDropdownMenu>
        </div>
      </template>

      <!-- <template #body>
        <div class="text-right">
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            class="-mx-2.5"
          />
        </div>
      </template> -->
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter />
  </UApp>
</template>
