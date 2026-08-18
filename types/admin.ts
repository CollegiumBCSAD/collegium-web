export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
  university: {
    id: string;
    name: string;
  } | null;
}
