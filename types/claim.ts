// daftar claim status
export const CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEED_REVISION', 'APPROVED', 'CANCELLED'] as const
export type ClaimStatus = typeof CLAIM_STATUSES[number]


// daftar claim action
export const CLAIM_ACTIONS = ['CREATE', 'SUBMIT', 'REVIEW', 'REQUEST_REVISION', 'APPROVE', 'CANCEL'] as const
export type ClaimAction = typeof CLAIM_ACTIONS[number]

// daftar claim history action
export const CLAIM_HISTORY_ACTIONS = [
    'CREATE',
    'SUBMIT',
    'REVIEW',
    'APPROVE',
    'REJECT',
    'REQUEST_REVISION',
    'CANCEL',
    'UPDATE',
    'UPLOAD_PHOTO',
    'REVIEW_PHOTO',
    'GENERATE_VENDOR_CLAIM',
    'UPDATE_VENDOR_DECISION'
] as const
export type ClaimHistoryAction = typeof CLAIM_HISTORY_ACTIONS[number]

export interface Claim {
    id: string
    title: string
    status: ClaimStatus
    submittedBy: string
    createdAt: Date
    updatedAt: Date
}