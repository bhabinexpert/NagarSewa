import { createContext } from "react";

// Auth Context
export const AuthContext = createContext(null);

// Damak Municipality has 10 wards
export const DAMAK_TOTAL_WARDS = 10;

// Role hierarchy
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  WARD_ADMIN: "ward_admin",
  USER: "user",
};

// Mock data for ward admins (in real app, this would come from backend)
export const mockWardAdmins = [
  {
    id: "admin-1",
    email: "ward1@damak.gov.np",
    fullName: "Ram Sharma",
    role: ROLES.WARD_ADMIN,
    wardNumber: 1,
    phone: "9800000001",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "admin-2",
    email: "ward2@damak.gov.np",
    fullName: "Sita Thapa",
    role: ROLES.WARD_ADMIN,
    wardNumber: 2,
    phone: "9800000002",
    isActive: true,
    createdAt: "2024-01-20",
  },
  {
    id: "admin-3",
    email: "ward5@damak.gov.np",
    fullName: "Hari Adhikari",
    role: ROLES.WARD_ADMIN,
    wardNumber: 5,
    phone: "9800000005",
    isActive: true,
    createdAt: "2024-02-01",
  },
];

// Super admin credentials (in real app, this would be in backend)
export const superAdminCredentials = {
  email: "superadmin@damak.gov.np",
  password: "superadmin123",
  fullName: "Municipality Administrator",
  role: ROLES.SUPER_ADMIN,
};
