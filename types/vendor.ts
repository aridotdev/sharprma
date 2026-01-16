// daftar vendor decision
export const VENDOR_DECISIONS = ['PENDING', 'ACCEPTED', 'REJECTED'] as const
export type VendorDecision = typeof VENDOR_DECISIONS[number]

