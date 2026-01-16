// daftar photo type
export const PHOTO_TYPES = ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN', 'WO_PANEL', 'WO_PANEL_SN'] as const
export type PhotoType = typeof PHOTO_TYPES[number]




export interface Photo {
    id: string
    url: string
    type: PhotoType
    claimId: string
    uploadedAt: Date
}

