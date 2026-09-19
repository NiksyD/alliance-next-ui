export type UserRole = 'student' | 'officer' | 'admin';

export type User = {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  role: UserRole;
  courseAndYear: string;
  section: string;
  membershipType: 'Regular' | 'Executive' | 'Honorary';
  avatarUrl?: string;
  isActive: boolean;
};

export type MemberRegistrationRequest = {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  courseAndYear: string;
  section: string;
  contactNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
};
