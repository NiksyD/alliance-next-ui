export type EventType =
  'Seminar' | 'Outreach' | 'General Assembly' | 'Competition' | 'Training' | 'Workshop';

export type EventStatus = 'Draft' | 'Published' | 'Ongoing' | 'Completed' | 'Cancelled';

export type Venue = {
  id: string;
  name: string;
  roomNumber: string;
  capacity: number;
  location: string;
  availabilityNotes: string;
  contactPerson: string;
  contactNumber: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  venueId: string;
  venueName: string;
  scheduleDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  registrationDeadline: string; // YYYY-MM-DD HH:mm
  participantLimit: number;
  registeredCount: number;
  status: EventStatus;
  coverImage?: string;
  organizer: string;
  certificateEligible: boolean;
};

export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlisted' | 'cancelled';

export type EventRegistration = {
  id: string;
  eventId: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  courseAndYear: string;
  email: string;
  status: RegistrationStatus;
  registeredAt: string;
  qrCodeToken: string;
  checkedIn: boolean;
  checkedInAt?: string;
  certificateEligible: boolean;
};

export type AttendanceCheckInLog = {
  id: string;
  eventId: string;
  eventTitle: string;
  studentNumber: string;
  studentName: string;
  courseAndYear: string;
  timestamp: string;
  method: 'QR_SCAN' | 'MANUAL_SEARCH' | 'STUDENT_NUMBER';
  verifiedBy: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
};
