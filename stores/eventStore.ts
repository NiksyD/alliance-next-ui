'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EventItem,
  Venue,
  EventType,
  EventRegistration,
  AttendanceCheckInLog,
  AuditLog,
} from '@/types/events';
import type { User, MemberRegistrationRequest } from '@/types/auth';

const INITIAL_VENUES: Venue[] = [
  {
    id: 'ven-1',
    name: 'University Main Auditorium',
    roomNumber: 'AUD-101',
    capacity: 500,
    location: 'Administration Building, 3rd Floor',
    availabilityNotes: 'Equipped with stage lighting and surround audio.',
    contactPerson: 'Engr. Carlos Mendoza',
    contactNumber: '+63 917 555 0192',
  },
  {
    id: 'ven-2',
    name: 'CCS AVR Theater',
    roomNumber: 'AVR-204',
    capacity: 120,
    location: 'College of Computer Studies, 2nd Floor',
    availabilityNotes: 'Dual high-lumen projectors & podium mic.',
    contactPerson: 'Prof. Luisa Tan',
    contactNumber: '+63 918 555 3821',
  },
  {
    id: 'ven-3',
    name: 'Innovation & Robotics Lab',
    roomNumber: 'LAB-402',
    capacity: 45,
    location: 'Engineering Complex, 4th Floor',
    availabilityNotes: 'Soldering stations, power strips, and high-speed LAN.',
    contactPerson: 'Mark Bautista',
    contactNumber: '+63 920 555 4910',
  },
];

const INITIAL_EVENT_TYPES: EventType[] = [
  'Seminar',
  'Outreach',
  'General Assembly',
  'Competition',
  'Training',
  'Workshop',
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-101',
    title: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    description:
      'Master Server Components, real-time database syncing with Supabase, and zero-bundle web design patterns with university alumni engineers.',
    type: 'Workshop',
    venueId: 'ven-2',
    venueName: 'CCS AVR Theater (AVR-204)',
    scheduleDate: '2026-09-12',
    startTime: '13:00',
    endTime: '17:00',
    registrationDeadline: '2026-09-11 23:59',
    participantLimit: 100,
    registeredCount: 30,
    status: 'Published',
    organizer: 'Alliance Computer Society',
    certificateEligible: true,
  },
  {
    id: 'evt-102',
    title: 'Alliance Annual General Assembly 2026',
    description:
      'Official organization induction, constitution review, presentation of semester projects, and announcement of committee appointments.',
    type: 'General Assembly',
    venueId: 'ven-1',
    venueName: 'University Main Auditorium (AUD-101)',
    scheduleDate: '2026-09-18',
    startTime: '09:00',
    endTime: '12:00',
    registrationDeadline: '2026-09-17 18:00',
    participantLimit: 400,
    registeredCount: 312,
    status: 'Published',
    organizer: 'Student Supreme Council',
    certificateEligible: false,
  },
  {
    id: 'evt-103',
    title: 'CyberStrike: Collegiate Capture The Flag (CTF)',
    description:
      '4-hour high stakes offensive security contest solving cryptography, reverse engineering, web exploits, and binary challenges in teams of 3.',
    type: 'Competition',
    venueId: 'ven-3',
    venueName: 'Innovation & Robotics Lab (LAB-402)',
    scheduleDate: '2026-09-26',
    startTime: '10:00',
    endTime: '16:00',
    registrationDeadline: '2026-09-24 12:00',
    participantLimit: 45,
    registeredCount: 45,
    status: 'Published',
    organizer: 'Alliance InfoSec Guild',
    certificateEligible: true,
  },
  {
    id: 'evt-104',
    title: 'Bytes & Books: Community Digital Literacy Outreach',
    description:
      'Volunteer teaching program introducing fundamental coding and internet safety to underprivileged high school students in Barangay San Jose.',
    type: 'Outreach',
    venueId: 'ven-1',
    venueName: 'University Main Auditorium (AUD-101)',
    scheduleDate: '2026-10-03',
    startTime: '08:00',
    endTime: '15:00',
    registrationDeadline: '2026-10-01 23:59',
    participantLimit: 60,
    registeredCount: 38,
    status: 'Published',
    organizer: 'Alliance Outreach Committee',
    certificateEligible: true,
  },
];

const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-01',
    eventId: 'evt-101',
    studentId: 'usr-student-01',
    studentNumber: '2024-10842',
    studentName: 'Nikko Dela Cruz',
    courseAndYear: 'BS Computer Science - 3rd Year',
    email: 'nikko.delacruz@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 10:15',
    qrCodeToken: 'UC-TKT-2024-10842-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:04:12',
    certificateEligible: true,
  },
  {
    id: 'reg-02',
    eventId: 'evt-101',
    studentId: 'usr-std-02',
    studentNumber: '2024-11200',
    studentName: 'Beatriz Patricia Gomez',
    courseAndYear: 'BS Information Systems - 2nd Year',
    email: 'beatriz.gomez@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 11:30',
    qrCodeToken: 'UC-TKT-2024-11200-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:06:45',
    certificateEligible: true,
  },
  {
    id: 'reg-03',
    eventId: 'evt-101',
    studentId: 'usr-std-03',
    studentNumber: '2023-09411',
    studentName: 'Justin Tyler Lim',
    courseAndYear: 'BS Computer Engineering - 4th Year',
    email: 'justin.lim@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 14:02',
    qrCodeToken: 'UC-TKT-2023-09411-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:08:20',
    certificateEligible: true,
  },
  {
    id: 'reg-04',
    eventId: 'evt-101',
    studentId: 'usr-officer-01',
    studentNumber: '2023-04921',
    studentName: 'Samantha Reyes',
    courseAndYear: 'BS Information Tech - 4th Year',
    email: 'samantha.reyes@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 14:15',
    qrCodeToken: 'UC-TKT-2023-04921-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:10:05',
    certificateEligible: true,
  },
  {
    id: 'reg-05',
    eventId: 'evt-101',
    studentId: 'usr-std-05',
    studentNumber: '2025-10022',
    studentName: 'Clara Isabelle Santos',
    courseAndYear: 'BS Computer Science - 1st Year',
    email: 'clara.santos@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 15:20',
    qrCodeToken: 'UC-TKT-2025-10022-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:12:44',
    certificateEligible: true,
  },
  {
    id: 'reg-06',
    eventId: 'evt-101',
    studentId: 'usr-std-06',
    studentNumber: '2024-15901',
    studentName: 'Dominic Kyle Navarro',
    courseAndYear: 'BS Information Tech - 2nd Year',
    email: 'dominic.navarro@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 15:45',
    qrCodeToken: 'UC-TKT-2024-15901-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:15:30',
    certificateEligible: true,
  },
  {
    id: 'reg-07',
    eventId: 'evt-101',
    studentId: 'usr-std-07',
    studentNumber: '2023-08712',
    studentName: 'Andrea Nicole Ramos',
    courseAndYear: 'BS Computer Science - 4th Year',
    email: 'andrea.ramos@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 16:10',
    qrCodeToken: 'UC-TKT-2023-08712-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:18:12',
    certificateEligible: true,
  },
  {
    id: 'reg-08',
    eventId: 'evt-101',
    studentId: 'usr-std-08',
    studentNumber: '2024-12340',
    studentName: 'Marcus Gabriel Tan',
    courseAndYear: 'BS Computer Engineering - 3rd Year',
    email: 'marcus.tan@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 16:30',
    qrCodeToken: 'UC-TKT-2024-12340-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:21:50',
    certificateEligible: true,
  },
  {
    id: 'reg-09',
    eventId: 'evt-101',
    studentId: 'usr-std-09',
    studentNumber: '2025-11099',
    studentName: 'Sophia Louise Valdez',
    courseAndYear: 'BS Information Systems - 1st Year',
    email: 'sophia.valdez@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 17:00',
    qrCodeToken: 'UC-TKT-2025-11099-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:25:15',
    certificateEligible: true,
  },
  {
    id: 'reg-10',
    eventId: 'evt-101',
    studentId: 'usr-std-10',
    studentNumber: '2024-10554',
    studentName: 'Ethan James Bautista',
    courseAndYear: 'BS Cybersecurity - 2nd Year',
    email: 'ethan.bautista@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 17:15',
    qrCodeToken: 'UC-TKT-2024-10554-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:28:40',
    certificateEligible: true,
  },
  {
    id: 'reg-11',
    eventId: 'evt-101',
    studentId: 'usr-std-11',
    studentNumber: '2023-07823',
    studentName: 'Chloe Monique Flores',
    courseAndYear: 'BS Computer Science - 4th Year',
    email: 'chloe.flores@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 17:40',
    qrCodeToken: 'UC-TKT-2023-07823-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:30:22',
    certificateEligible: true,
  },
  {
    id: 'reg-12',
    eventId: 'evt-101',
    studentId: 'usr-std-12',
    studentNumber: '2024-13490',
    studentName: 'Joshua Miguel Castro',
    courseAndYear: 'BS Information Tech - 3rd Year',
    email: 'joshua.castro@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 18:05',
    qrCodeToken: 'UC-TKT-2024-13490-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:32:55',
    certificateEligible: true,
  },
  {
    id: 'reg-13',
    eventId: 'evt-101',
    studentId: 'usr-std-13',
    studentNumber: '2025-12887',
    studentName: 'Alyssa Marie Dizon',
    courseAndYear: 'BS Data Analytics - 1st Year',
    email: 'alyssa.dizon@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 18:30',
    qrCodeToken: 'UC-TKT-2025-12887-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:35:10',
    certificateEligible: true,
  },
  {
    id: 'reg-14',
    eventId: 'evt-101',
    studentId: 'usr-std-14',
    studentNumber: '2024-14902',
    studentName: 'Gabriel Antonio Cruz',
    courseAndYear: 'BS Computer Engineering - 2nd Year',
    email: 'gabriel.cruz@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 19:00',
    qrCodeToken: 'UC-TKT-2024-14902-101',
    checkedIn: true,
    checkedInAt: '2026-09-05 13:38:45',
    certificateEligible: true,
  },
  {
    id: 'reg-15',
    eventId: 'evt-101',
    studentId: 'usr-std-15',
    studentNumber: '2023-09110',
    studentName: 'Patricia Anne Mercado',
    courseAndYear: 'BS Information Systems - 4th Year',
    email: 'patricia.mercado@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 19:15',
    qrCodeToken: 'UC-TKT-2023-09110-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-16',
    eventId: 'evt-101',
    studentId: 'usr-std-16',
    studentNumber: '2024-10771',
    studentName: 'Christian Dave Morales',
    courseAndYear: 'BS Computer Science - 3rd Year',
    email: 'christian.morales@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 19:30',
    qrCodeToken: 'UC-TKT-2024-10771-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-17',
    eventId: 'evt-101',
    studentId: 'usr-std-17',
    studentNumber: '2025-13204',
    studentName: 'Hannah Beatrice Ong',
    courseAndYear: 'BS Information Tech - 1st Year',
    email: 'hannah.ong@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 20:00',
    qrCodeToken: 'UC-TKT-2025-13204-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-18',
    eventId: 'evt-101',
    studentId: 'usr-std-18',
    studentNumber: '2023-08654',
    studentName: 'Vincent Paul Alcantara',
    courseAndYear: 'BS Computer Engineering - 4th Year',
    email: 'vincent.alcantara@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 20:20',
    qrCodeToken: 'UC-TKT-2023-08654-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-19',
    eventId: 'evt-101',
    studentId: 'usr-std-19',
    studentNumber: '2024-11983',
    studentName: 'Danielle Rose Soriano',
    courseAndYear: 'BS Data Analytics - 2nd Year',
    email: 'danielle.soriano@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 20:45',
    qrCodeToken: 'UC-TKT-2024-11983-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-20',
    eventId: 'evt-101',
    studentId: 'usr-std-20',
    studentNumber: '2025-10443',
    studentName: 'Rafael Luis Mendoza',
    courseAndYear: 'BS Cybersecurity - 1st Year',
    email: 'rafael.mendoza@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 21:00',
    qrCodeToken: 'UC-TKT-2025-10443-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-21',
    eventId: 'evt-101',
    studentId: 'usr-std-21',
    studentNumber: '2024-12876',
    studentName: 'Katrina Isabel Yap',
    courseAndYear: 'BS Computer Science - 2nd Year',
    email: 'katrina.yap@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 21:15',
    qrCodeToken: 'UC-TKT-2024-12876-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-22',
    eventId: 'evt-101',
    studentId: 'usr-std-22',
    studentNumber: '2023-07991',
    studentName: 'Angelo Miguel Fernandez',
    courseAndYear: 'BS Information Tech - 4th Year',
    email: 'angelo.fernandez@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 21:30',
    qrCodeToken: 'UC-TKT-2023-07991-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-23',
    eventId: 'evt-101',
    studentId: 'usr-std-23',
    studentNumber: '2025-11802',
    studentName: 'Bianca Camille Rivera',
    courseAndYear: 'BS Information Systems - 1st Year',
    email: 'bianca.rivera@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 21:45',
    qrCodeToken: 'UC-TKT-2025-11802-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-24',
    eventId: 'evt-101',
    studentId: 'usr-std-24',
    studentNumber: '2024-13115',
    studentName: 'Lorenzo Gabriel Ocampo',
    courseAndYear: 'BS Computer Engineering - 3rd Year',
    email: 'lorenzo.ocampo@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 22:00',
    qrCodeToken: 'UC-TKT-2024-13115-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-25',
    eventId: 'evt-101',
    studentId: 'usr-std-25',
    studentNumber: '2023-09328',
    studentName: 'Maria Elena Tolentino',
    courseAndYear: 'BS Computer Science - 4th Year',
    email: 'maria.tolentino@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 22:15',
    qrCodeToken: 'UC-TKT-2023-09328-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-26',
    eventId: 'evt-101',
    studentId: 'usr-std-26',
    studentNumber: '2024-14562',
    studentName: 'Kevin Matthew Salazar',
    courseAndYear: 'BS Cybersecurity - 2nd Year',
    email: 'kevin.salazar@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 22:30',
    qrCodeToken: 'UC-TKT-2024-14562-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-27',
    eventId: 'evt-101',
    studentId: 'usr-std-27',
    studentNumber: '2025-12009',
    studentName: 'Stephanie Joyce Pineda',
    courseAndYear: 'BS Data Analytics - 1st Year',
    email: 'stephanie.pineda@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 22:45',
    qrCodeToken: 'UC-TKT-2025-12009-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-28',
    eventId: 'evt-101',
    studentId: 'usr-std-28',
    studentNumber: '2024-10338',
    studentName: 'Adrian Paolo De Leon',
    courseAndYear: 'BS Information Tech - 3rd Year',
    email: 'adrian.deleon@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 23:00',
    qrCodeToken: 'UC-TKT-2024-10338-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-29',
    eventId: 'evt-101',
    studentId: 'usr-std-29',
    studentNumber: '2023-08117',
    studentName: 'Kimberly Nicole Sy',
    courseAndYear: 'BS Information Systems - 4th Year',
    email: 'kimberly.sy@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 23:15',
    qrCodeToken: 'UC-TKT-2023-08117-101',
    checkedIn: false,
    certificateEligible: false,
  },
  {
    id: 'reg-30',
    eventId: 'evt-101',
    studentId: 'usr-std-30',
    studentNumber: '2024-15220',
    studentName: 'Raymond Kyle Villanueva',
    courseAndYear: 'BS Computer Engineering - 2nd Year',
    email: 'raymond.villanueva@uc.edu.ph',
    status: 'confirmed',
    registeredAt: '2026-09-04 23:30',
    qrCodeToken: 'UC-TKT-2024-15220-101',
    checkedIn: false,
    certificateEligible: false,
  },
];

const INITIAL_MEMBERS: User[] = [
  {
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
  {
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
  {
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
  {
    id: 'usr-std-02',
    studentNumber: '2024-11200',
    name: 'Beatriz Patricia Gomez',
    email: 'beatriz.gomez@uc.edu.ph',
    role: 'student',
    courseAndYear: 'BS Information Systems - 2nd Year',
    section: 'IS-2A',
    membershipType: 'Regular',
    isActive: true,
  },
  {
    id: 'usr-std-03',
    studentNumber: '2023-09411',
    name: 'Justin Tyler Lim',
    email: 'justin.lim@uc.edu.ph',
    role: 'student',
    courseAndYear: 'BS Computer Engineering - 4th Year',
    section: 'CpE-4A',
    membershipType: 'Regular',
    isActive: true,
  },
];

const INITIAL_REG_REQUESTS: MemberRegistrationRequest[] = [
  {
    id: 'req-01',
    studentNumber: '2025-10022',
    fullName: 'Clara Isabelle Santos',
    email: 'clara.santos@uc.edu.ph',
    courseAndYear: 'BS Computer Science - 1st Year',
    section: 'CS-1B',
    contactNumber: '+63 928 111 2233',
    status: 'pending',
    submittedAt: '2026-09-05 08:30',
  },
  {
    id: 'req-02',
    studentNumber: '2024-15901',
    fullName: 'Dominic Kyle Navarro',
    email: 'dominic.navarro@uc.edu.ph',
    courseAndYear: 'BS Information Tech - 2nd Year',
    section: 'IT-2C',
    contactNumber: '+63 919 444 8821',
    status: 'pending',
    submittedAt: '2026-09-05 09:12',
  },
];

type EventState = {
  events: EventItem[];
  venues: Venue[];
  eventTypes: EventType[];
  registrations: EventRegistration[];
  members: User[];
  registrationRequests: MemberRegistrationRequest[];
  attendanceLogs: AttendanceCheckInLog[];
  auditLogs: AuditLog[];

  // Actions
  createEvent: (event: Omit<EventItem, 'id' | 'registeredCount'>) => void;
  registerForEvent: (eventId: string, student: User) => { success: boolean; message: string };
  cancelRegistration: (eventId: string, studentId: string) => void;
  recordCheckIn: (
    identifier: string,
    eventId: string,
    method: 'QR_SCAN' | 'MANUAL_SEARCH' | 'STUDENT_NUMBER',
    officerName: string,
  ) => { success: boolean; message: string; record?: EventRegistration };
  toggleCertificateEligibility: (registrationId: string) => void;
  undoCheckIn: (registrationId: string) => void;
  approveMemberRequest: (requestId: string) => void;
  rejectMemberRequest: (requestId: string) => void;
  toggleMemberActive: (memberId: string) => void;
  updateMemberRole: (memberId: string, role: User['role']) => void;
  addVenue: (venue: Omit<Venue, 'id'>) => void;
  addEventType: (type: EventType) => void;
};

const INITIAL_ATTENDANCE_LOGS: AttendanceCheckInLog[] = [
  {
    id: 'log-14',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-14902',
    studentName: 'Gabriel Antonio Cruz',
    courseAndYear: 'BS Computer Engineering - 2nd Year',
    timestamp: '2026-09-05 13:38:45',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-13',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2025-12887',
    studentName: 'Alyssa Marie Dizon',
    courseAndYear: 'BS Data Analytics - 1st Year',
    timestamp: '2026-09-05 13:35:10',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-12',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-13490',
    studentName: 'Joshua Miguel Castro',
    courseAndYear: 'BS Information Tech - 3rd Year',
    timestamp: '2026-09-05 13:32:55',
    method: 'MANUAL_SEARCH',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-11',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2023-07823',
    studentName: 'Chloe Monique Flores',
    courseAndYear: 'BS Computer Science - 4th Year',
    timestamp: '2026-09-05 13:30:22',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-10',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-10554',
    studentName: 'Ethan James Bautista',
    courseAndYear: 'BS Cybersecurity - 2nd Year',
    timestamp: '2026-09-05 13:28:40',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-09',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2025-11099',
    studentName: 'Sophia Louise Valdez',
    courseAndYear: 'BS Information Systems - 1st Year',
    timestamp: '2026-09-05 13:25:15',
    method: 'MANUAL_SEARCH',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-08',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-12340',
    studentName: 'Marcus Gabriel Tan',
    courseAndYear: 'BS Computer Engineering - 3rd Year',
    timestamp: '2026-09-05 13:21:50',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-07',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2023-08712',
    studentName: 'Andrea Nicole Ramos',
    courseAndYear: 'BS Computer Science - 4th Year',
    timestamp: '2026-09-05 13:18:12',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-06',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-15901',
    studentName: 'Dominic Kyle Navarro',
    courseAndYear: 'BS Information Tech - 2nd Year',
    timestamp: '2026-09-05 13:15:30',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-05',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2025-10022',
    studentName: 'Clara Isabelle Santos',
    courseAndYear: 'BS Computer Science - 1st Year',
    timestamp: '2026-09-05 13:12:44',
    method: 'MANUAL_SEARCH',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-04',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2023-04921',
    studentName: 'Samantha Reyes',
    courseAndYear: 'BS Information Tech - 4th Year',
    timestamp: '2026-09-05 13:10:05',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-03',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2023-09411',
    studentName: 'Justin Tyler Lim',
    courseAndYear: 'BS Computer Engineering - 4th Year',
    timestamp: '2026-09-05 13:08:20',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-02',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-11200',
    studentName: 'Beatriz Patricia Gomez',
    courseAndYear: 'BS Information Systems - 2nd Year',
    timestamp: '2026-09-05 13:06:45',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
  {
    id: 'log-01',
    eventId: 'evt-101',
    eventTitle: 'CodeCraft: Advanced Next.js & Full-Stack Architecture',
    studentNumber: '2024-10842',
    studentName: 'Nikko Dela Cruz',
    courseAndYear: 'BS Computer Science - 3rd Year',
    timestamp: '2026-09-05 13:04:12',
    method: 'QR_SCAN',
    verifiedBy: 'Samantha Reyes (Officer)',
  },
];

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: INITIAL_EVENTS,
      venues: INITIAL_VENUES,
      eventTypes: INITIAL_EVENT_TYPES,
      registrations: INITIAL_REGISTRATIONS,
      members: INITIAL_MEMBERS,
      registrationRequests: INITIAL_REG_REQUESTS,
      attendanceLogs: INITIAL_ATTENDANCE_LOGS,
      auditLogs: [
        {
          id: 'aud-01',
          timestamp: '2026-09-05 08:00:00',
          actorName: 'Dean Arthur Morales',
          actorRole: 'admin',
          action: 'ASSIGN_ROLE',
          target: 'Samantha Reyes',
          details: 'Elevated role to Officer (Executive)',
        },
      ],

      createEvent: (newEvent) => {
        const id = `evt-${Date.now()}`;
        const venue = get().venues.find((v) => v.id === newEvent.venueId);
        const eventToAdd: EventItem = {
          ...newEvent,
          id,
          venueName: venue ? `${venue.name} (${venue.roomNumber})` : 'TBD',
          registeredCount: 0,
        };
        set((state) => ({
          events: [eventToAdd, ...state.events],
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              actorName: 'Officer',
              actorRole: 'officer',
              action: 'EVENT_CREATED',
              target: newEvent.title,
              details: `Created new event with limit ${newEvent.participantLimit}`,
            },
            ...state.auditLogs,
          ],
        }));
      },

      registerForEvent: (eventId, student) => {
        const { events, registrations } = get();
        const event = events.find((e) => e.id === eventId);
        if (!event) return { success: false, message: 'Event not found.' };

        // 1. Deadline Validation: Prevent registrations past the registration deadline
        if (event.registrationDeadline) {
          const deadlineDate = new Date(event.registrationDeadline.replace(' ', 'T'));
          if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
            return {
              success: false,
              message: `Registration closed. The deadline was ${event.registrationDeadline}.`,
            };
          }
        }

        // 2. Check already registered (and active)
        const existing = registrations.find(
          (r) => r.eventId === eventId && r.studentId === student.id,
        );
        if (existing) {
          if (existing.status === 'cancelled') {
            // Re-activate a previously cancelled registration
            const isFull = event.registeredCount >= event.participantLimit;
            const newStatus = isFull ? 'waitlisted' : 'confirmed';

            set((state) => ({
              registrations: state.registrations.map((r) =>
                r.id === existing.id
                  ? {
                      ...r,
                      status: newStatus,
                      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    }
                  : r,
              ),
              events: state.events.map((e) =>
                e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e,
              ),
            }));

            return {
              success: true,
              message: isFull
                ? 'Event limit reached. Re-registered and placed on waitlist!'
                : 'Registration reinstated successfully! See your pass.',
            };
          }

          return { success: false, message: 'You already hold a registration for this event.' };
        }

        // 3. Capacity Validation: assign confirmed vs. waitlisted
        const isFull = event.registeredCount >= event.participantLimit;
        const status = isFull ? 'waitlisted' : 'confirmed';
        const qrCodeToken = `UC-TKT-${student.studentNumber}-${event.id}`;

        const newReg: EventRegistration = {
          id: `reg-${Date.now()}`,
          eventId,
          studentId: student.id,
          studentNumber: student.studentNumber,
          studentName: student.name,
          courseAndYear: student.courseAndYear,
          email: student.email,
          status,
          registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          qrCodeToken,
          checkedIn: false,
          certificateEligible: false,
        };

        set((state) => ({
          registrations: [newReg, ...state.registrations],
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e,
          ),
        }));

        return {
          success: true,
          message: isFull
            ? 'Event limit reached. Added to official waitlist!'
            : 'Pass claimed successfully! See your digital ticket.',
        };
      },

      cancelRegistration: (eventId, studentId) => {
        const { registrations } = get();
        const existing = registrations.find(
          (r) => r.eventId === eventId && r.studentId === studentId,
        );
        if (!existing || existing.status === 'cancelled') return;

        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.eventId === eventId && r.studentId === studentId
              ? { ...r, status: 'cancelled' as const }
              : r,
          ),
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e,
          ),
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: 'CANCEL_REGISTRATION',
              actorName: existing.studentName,
              actorRole: 'Student',
              target: eventId,
              details: `Cancelled registration for event ${eventId}`,
            },
            ...state.auditLogs,
          ],
        }));
      },

      recordCheckIn: (identifier, eventId, method, officerName) => {
        const { registrations, events } = get();
        const cleanId = identifier.trim().toUpperCase();

        // Search by QR code token OR student number
        const reg = registrations.find(
          (r) =>
            r.eventId === eventId &&
            (r.qrCodeToken.toUpperCase() === cleanId ||
              r.studentNumber.toUpperCase() === cleanId ||
              r.studentName.toUpperCase().includes(cleanId)),
        );

        if (!reg) {
          return {
            success: false,
            message: `No active registration found for '${identifier}' under this event.`,
          };
        }

        if (reg.checkedIn) {
          return {
            success: false,
            message: `${reg.studentName} was ALREADY checked in at ${reg.checkedInAt}!`,
            record: reg,
          };
        }

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const event = events.find((e) => e.id === eventId);

        const updatedReg: EventRegistration = {
          ...reg,
          checkedIn: true,
          checkedInAt: now,
          certificateEligible: true,
        };

        const newLog: AttendanceCheckInLog = {
          id: `log-${Date.now()}`,
          eventId,
          eventTitle: event?.title || 'Event',
          studentNumber: reg.studentNumber,
          studentName: reg.studentName,
          courseAndYear: reg.courseAndYear,
          timestamp: now,
          method,
          verifiedBy: officerName,
        };

        set((state) => ({
          registrations: state.registrations.map((r) => (r.id === reg.id ? updatedReg : r)),
          attendanceLogs: [newLog, ...state.attendanceLogs],
        }));

        return {
          success: true,
          message: `Verified: ${reg.studentName} checked in successfully!`,
          record: updatedReg,
        };
      },

      toggleCertificateEligibility: (registrationId) => {
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId ? { ...r, certificateEligible: !r.certificateEligible } : r,
          ),
        }));
      },

      undoCheckIn: (registrationId) => {
        const reg = get().registrations.find((r) => r.id === registrationId);
        if (!reg || !reg.checkedIn) return;

        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.id === registrationId
              ? { ...r, checkedIn: false, checkedInAt: undefined, certificateEligible: false }
              : r,
          ),
          attendanceLogs: state.attendanceLogs.filter(
            (log) => !(log.studentNumber === reg.studentNumber && log.eventId === reg.eventId),
          ),
        }));
      },

      approveMemberRequest: (requestId) => {
        const req = get().registrationRequests.find((r) => r.id === requestId);
        if (!req) return;

        const newMember: User = {
          id: `usr-${Date.now()}`,
          studentNumber: req.studentNumber,
          name: req.fullName,
          email: req.email,
          role: 'student',
          courseAndYear: req.courseAndYear,
          section: req.section,
          membershipType: 'Regular',
          isActive: true,
        };

        set((state) => ({
          registrationRequests: state.registrationRequests.filter((r) => r.id !== requestId),
          members: [newMember, ...state.members],
          auditLogs: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              actorName: 'Officer',
              actorRole: 'officer',
              action: 'APPROVE_ACCOUNT',
              target: req.fullName,
              details: `Approved membership request for ${req.studentNumber}`,
            },
            ...state.auditLogs,
          ],
        }));
      },

      rejectMemberRequest: (requestId) => {
        set((state) => ({
          registrationRequests: state.registrationRequests.filter((r) => r.id !== requestId),
        }));
      },

      toggleMemberActive: (memberId) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, isActive: !m.isActive } : m,
          ),
        }));
      },

      updateMemberRole: (memberId, role) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
        }));
      },

      addVenue: (venueData) => {
        const venue: Venue = { ...venueData, id: `ven-${Date.now()}` };
        set((state) => ({ venues: [...state.venues, venue] }));
      },

      addEventType: (type) => {
        if (!get().eventTypes.includes(type)) {
          set((state) => ({ eventTypes: [...state.eventTypes, type] }));
        }
      },
    }),
    {
      name: 'ucevents-event-store-v4',
    },
  ),
);
