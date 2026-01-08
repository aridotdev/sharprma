<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/sharp-logo.svg' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'LCD RMA Portal'
const description = 'Sharp LCD RMA System'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/sharp-logo.svg',
  twitterImage: '/sharp-logo.svg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
