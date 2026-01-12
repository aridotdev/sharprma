<script setup lang="ts">
// import NavBar from '~/components/cs/NavBar.vue'
// import StatCard from '~/components/cs/StatCard.vue'
// import TicketTable from '~/components/cs/TicketTable.vue'
// import ActivityList from '~/components/cs/ActivityList.vue'
// import { statCardsData, recentTicketsData, recentActivityData } from '~/data/cs-dashboard-data'

useHead({
  title: 'Customer Service Dashboard'
})
definePageMeta({
  layout: 'cs'
})
</script>

<template>
  <div class="min-h-screen">
    <h1>Customer Service Dashboard</h1>
    <!-- <NavBar /> -->
    <!-- <main class="container mx-auto px-4 to-6 py-6 to-p-8">
      <div class="mb-6 to-mb-8">
        <h1 class="text-2xl to-text-3xl font-semibold text-primary-900 dark:text-primary-50">
          Customer Service Dashboard
        </h1>
        <p class="mt-1 text-sm text-primary-600 dark:text-primary-400">
          Monitor tickets, track performance, and manage customer support
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard v-for="stat in statCardsData" :key="stat.title" :title="stat.title" :value="stat.value"
          :change="stat.change" :trend="stat.trend" :subtitle="stat.subtitle" />
      </div>

      <div class="mt-6 to-mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <TicketTable :tickets="recentTicketsData" />
        </div>

        <div class="space-y-6 lg:col-span-4">
          <ActivityList :activities="recentActivityData" />

          <div class="rounded-2xl border bg-card p-5 to-6 shadow-sm">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50">
                Quick Actions
              </h3>
              <p class="text-sm text-primary-500 dark:text-primary-400">
                Common tasks
              </p>
            </div>

            <div class="space-y-2">
              <UButton icon="i-lucide-plus-circle" label="Create New Ticket" variant="soft" color="primary" size="sm"
                block to="/cs/tickets/new" />
              <UButton icon="i-lucide-users" label="View All Customers" variant="soft" color="neutral" size="sm" block
                to="/cs/customers" />
              <UButton icon="i-lucide-bar-chart-3" label="Generate Report" variant="soft" color="neutral" size="sm"
                block to="/cs/reports" />
            </div>
          </div>

          <div class="rounded-2xl border bg-card p-5 to-6 shadow-sm">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-primary-900 dark:text-primary-50">
                Team Status
              </h3>
              <p class="text-sm text-primary-500 dark:text-primary-400">
                Active agents
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <UAvatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="John Doe" size="sm" />
                  <div
                    class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success-500" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-primary-900 dark:text-primary-50">
                    John Doe
                  </p>
                  <p class="text-xs text-primary-500 dark:text-primary-400">
                    12 active tickets
                  </p>
                </div>
                <UBadge color="success" variant="soft" size="sm">
                  Online
                </UBadge>
              </div>

              <div class="flex items-center gap-3">
                <div class="relative">
                  <UAvatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="Jane Smith" size="sm" />
                  <div
                    class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success-500" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-primary-900 dark:text-primary-50">
                    Jane Smith
                  </p>
                  <p class="text-xs text-primary-500 dark:text-primary-400">
                    8 active tickets
                  </p>
                </div>
                <UBadge color="success" variant="soft" size="sm">
                  Online
                </UBadge>
              </div>

              <div class="flex items-center gap-3">
                <div class="relative">
                  <UAvatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Wilson" size="sm" />
                  <div
                    class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-warning-500" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-primary-900 dark:text-primary-50">
                    Sarah Wilson
                  </p>
                  <p class="text-xs text-primary-500 dark:text-primary-400">
                    Away - 5 mins
                  </p>
                </div>
                <UBadge color="warning" variant="soft" size="sm">
                  Away
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main> -->
  </div>
</template>