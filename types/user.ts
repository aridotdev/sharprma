// daftar user role

export const USER_ROLES = ['ADMIN', 'MANAGEMENT', 'QRCC', 'CS'] as const
export type UserRole = typeof USER_ROLES[number]

export interface User {
    id: string;
    authUserId: string;
    name: string;
    role: UserRole;
    branch: string;
    vendorId?: string | null;
    isActive: boolean;
}

export interface UserCreateInput {
    name: string
    email: string
    role: UserRole
    password: string
}
