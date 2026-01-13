<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

useHead({
  title: 'Customer Service Dashboard'
})
definePageMeta({
  layout: 'cs'
})

const schema = z.object({
  notification: z.string().min(4, 'Notification must be at least 4 characters long'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  notification: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}
</script>

<template>
  <div class="h-full w-full">
    <!-- Hero Section -->
    <section class="h-full w-full flex flex-col items-center justify-center overflow-hidden">
      <UBadge icon="i-lucide-square" color="success" variant="soft" size="sm" class="rounded-sm px-2 py-1">
        System Online
      </UBadge>
      <p class="text-[72px] font-extrabold font-inter">Search and Create</p>
      <p class="text-[72px] font-extrabold leading-16 font-inter">
        <span class="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] to-[#F59B86]">New RMA Report
        </span>
      </p>
      <p class="max-w-1/2 text-center mt-4 mb-10 font-inter">
        An integrated system designed to create, search, and manage LCD RMA claims
        with a structured and accountable process.
      </p>

      <UForm :state="state" @submit="onSubmit" class="w-full max-w-xl">
        <UFormField name="notification">
          <div
            class="group px-2 py-2 flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 focus-within:border-primary-500 dark:focus-within:border-primary-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-md hover:shadow-md">

            <!-- Search Icon -->
            <UIcon name="i-lucide-search" class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 shrink-0" />

            <!-- Input Field -->
            <UInput v-model="state.notification" placeholder="Enter a notification number to create report" size="xl"
              variant="none" class="flex-1" :ui="{
                base: 'bg-transparent border-none focus:ring-0 text-lg',
                // padding: { xl: 'px-0' }
              }" :padded="false" />

            <!-- Search Button -->
            <UButton type="submit" size="xl" color="primary" :disabled="!state.notification?.trim()"
              class="ml-3 shrink-0 rounded-md">
              Search
            </UButton>
          </div>
        </UFormField>
      </UForm>
    </section>
  </div>
</template>
