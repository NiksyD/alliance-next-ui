'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/auth';

export const MOCK_USERS: Record<UserRole, User> = {
  student: {
    id: 'usr-student-01',
    studentNumber: '2024-10842',
    name: 'Nikko Dela Cruz',
    email: 'nikko.delacruz@uc.edu.ph',
    role: 'student',
    courseAndYear: 'BS Computer Science - 3rd Year',
    section: 'CS-3A',
    membershipType: 'Regular',
    isActive: true,
  },
  officer: {
    id: 'usr-officer-01',
    studentNumber: '2023-04921',
    name: 'Samantha Reyes',
    email: 'samantha.reyes@uc.edu.ph',
    role: 'officer',
    courseAndYear: 'BS Information Tech - 4th Year',
    section: 'IT-4B',
    membershipType: 'Executive',
    isActive: true,
  },
  admin: {
    id: 'usr-admin-01',
    studentNumber: 'ADMIN-001',
    name: 'Dean Arthur Morales',
    email: 'dean.morales@uc.edu.ph',
    role: 'admin',
    courseAndYear: 'College of Computer Studies',
    section: 'Faculty Admin',
    membershipType: 'Honorary',
    isActive: true,
  },
};

type AuthState = {
  currentUser: User;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  login: (emailOrStudentNum: string) => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: MOCK_USERS.student,
      isAuthenticated: true,
      switchRole: (role: UserRole) => {
        set({ currentUser: MOCK_USERS[role], isAuthenticated: true });
      },
      setUser: (user: User) => set({ currentUser: user }),
      login: (emailOrStudentNum: string) => {
        const found = Object.values(MOCK_USERS).find(
          (u) =>
            u.email.toLowerCase() === emailOrStudentNum.toLowerCase() ||
            u.studentNumber === emailOrStudentNum,
        );
        if (found) {
          set({ currentUser: found, isAuthenticated: true });
          return true;
        }
        // Fallback default
        set({ currentUser: MOCK_USERS.student, isAuthenticated: true });
        return true;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'ucevents-auth-store',
    },
  ),
);
