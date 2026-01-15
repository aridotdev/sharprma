export type UserRole = "ADMIN" | "CS" | "QRCC" | "MANAGEMENT";

export interface UserRMA {
  id: string;
  authUserId: string;
  name: string;
  role: UserRole;
  branch: string;
  vendorId?: string | null;
  isActive: boolean;
}
