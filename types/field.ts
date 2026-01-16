// daftar vendor field rule
export const FIELD_NAMES = ['odfNumber', 'version', 'week'] as const
export type FieldName = typeof FIELD_NAMES[number]
