export interface StatCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  subtitle: string
}

export interface Ticket {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: string
  createdAt: string
  lastUpdate: string
}

export interface Activity {
  id: string
  type: 'ticket_created' | 'ticket_updated' | 'ticket_closed' | 'comment_added'
  agent: string
  agentAvatar?: string
  ticketId: string
  ticketSubject: string
  timestamp: string
}

export const statCardsData: StatCard[] = [
  {
    title: 'Total Tickets',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    subtitle: 'vs last month'
  },
  {
    title: 'Open Tickets',
    value: '47',
    change: '+5%',
    trend: 'up',
    subtitle: 'Need attention'
  },
  {
    title: 'Resolved',
    value: '1,156',
    change: '+18%',
    trend: 'up',
    subtitle: 'This month'
  },
  {
    title: 'Avg Response Time',
    value: '2.4h',
    change: '-8%',
    trend: 'down',
    subtitle: 'Faster than before'
  }
]

export const recentTicketsData: Ticket[] = [
  {
    id: 'TKT-2847',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com'
    },
    subject: 'Unable to access account after password reset',
    status: 'open',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: '2 hours ago',
    lastUpdate: '30 mins ago'
  },
  {
    id: 'TKT-2846',
    customer: {
      name: 'Michael Chen',
      email: 'm.chen@example.com'
    },
    subject: 'Billing discrepancy in monthly invoice',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Jane Smith',
    createdAt: '4 hours ago',
    lastUpdate: '1 hour ago'
  },
  {
    id: 'TKT-2845',
    customer: {
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com'
    },
    subject: 'Feature request: Export to CSV',
    status: 'open',
    priority: 'medium',
    createdAt: '6 hours ago',
    lastUpdate: '2 hours ago'
  },
  {
    id: 'TKT-2844',
    customer: {
      name: 'David Kim',
      email: 'd.kim@example.com'
    },
    subject: 'Integration API returning 500 errors',
    status: 'resolved',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: '1 day ago',
    lastUpdate: '5 hours ago'
  },
  {
    id: 'TKT-2843',
    customer: {
      name: 'Lisa Thompson',
      email: 'lisa.t@example.com'
    },
    subject: 'Question about enterprise pricing plan',
    status: 'closed',
    priority: 'low',
    assignee: 'Sarah Wilson',
    createdAt: '2 days ago',
    lastUpdate: '1 day ago'
  }
]

export const recentActivityData: Activity[] = [
  {
    id: 'ACT-001',
    type: 'ticket_closed',
    agent: 'John Doe',
    ticketId: 'TKT-2840',
    ticketSubject: 'Payment gateway integration issue',
    timestamp: '10 mins ago'
  },
  {
    id: 'ACT-002',
    type: 'comment_added',
    agent: 'Jane Smith',
    ticketId: 'TKT-2846',
    ticketSubject: 'Billing discrepancy in monthly invoice',
    timestamp: '25 mins ago'
  },
  {
    id: 'ACT-003',
    type: 'ticket_updated',
    agent: 'Sarah Wilson',
    ticketId: 'TKT-2844',
    ticketSubject: 'Integration API returning 500 errors',
    timestamp: '1 hour ago'
  },
  {
    id: 'ACT-004',
    type: 'ticket_created',
    agent: 'System',
    ticketId: 'TKT-2847',
    ticketSubject: 'Unable to access account after password reset',
    timestamp: '2 hours ago'
  },
  {
    id: 'ACT-005',
    type: 'ticket_updated',
    agent: 'John Doe',
    ticketId: 'TKT-2843',
    ticketSubject: 'Question about enterprise pricing plan',
    timestamp: '3 hours ago'
  }
]

export const navLinks = [
  {
    label: 'Dashboard',
    to: '/cs',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    label: 'Tickets',
    to: '/cs/tickets',
    icon: 'i-lucide-ticket'
  },
  {
    label: 'Customers',
    to: '/cs/customers',
    icon: 'i-lucide-users'
  },
  {
    label: 'Reports',
    to: '/cs/reports',
    icon: 'i-lucide-bar-chart-3'
  },
  {
    label: 'Settings',
    to: '/cs/settings',
    icon: 'i-lucide-settings'
  }
]
