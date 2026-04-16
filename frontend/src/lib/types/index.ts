export type BadgeVariant = 'free' | 'premium' | 'event' | 'draft'

export interface ICardData {
  variantBadge: BadgeVariant
  title: string
  description: string
  category?: string
  author: {
    name: string
    avatar: string
  }
  rating: number
  totalReviews: number
  image?: string
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: React.ReactNode
}

export interface IDashboardStat {
  label: string
  value: number | string
  iconName: 'Book' | 'ClipboardCheck' | 'Award' | 'CheckCircle'
}

export interface IResumeCourse {
  title: string
  module: string
  progress: number
  image?: string
  description?: string
  variantBadge?: BadgeVariant
  /** Jika diisi, kartu "Lanjut" menuju preview modul kursus ini */
  courseUid?: string
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
}

export interface IDeadlineItem {
  month: string
  day: string
  title: string
  course: string
  isPast?: boolean
}

export interface IFeedbackItem {
  status: 'Lulus' | 'Perlu Revisi'
  time: string
  title: string
  comment: string
  instructor: {
    name: string
    avatar: string
  }
}

// ─── Transaksi (selaraskan dengan respons API pembayaran / invoice) ───
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED'

export type TransactionSortKey = 'transactionId' | 'courseName' | 'classType' | 'price' | 'paymentStatus'

export type SortDirection = 'asc' | 'desc'

/** Satu baris riwayat transaksi pembelian kursus (FE). */
export interface TransactionHistoryItem {
  uid: string
  transactionId: string
  courseImage: string
  courseName: string
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number
  paymentStatus: PaymentStatus
  purchasedAt: string
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  qrImage?: string
}

export interface ICertificate {
  uid: string
  title: string
  courseName: string
  issuedDate: string
  category: string
  credentialId: string
  imageUrl?: string
}

// Attendance types
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Alpha'

export interface IAttendanceSummary {
  totalMeetings: number
  hadir: number
  izin: number
  alpha: number
  progressPercentage: number
}

export interface IAttendanceRecord {
  uid: string
  meetingNumber: number
  date: string
  topic: string
  status: AttendanceStatus
  notes?: string
}

export interface ICourseAttendance {
  courseId: string
  courseName: string
  author: {
    name: string
    avatar?: string
  }
  image?: string
  summary: IAttendanceSummary
  records: IAttendanceRecord[]
}

// User Profile types
export interface IUserProfile {
  uid: string
  name: string
  email: string
  role: string
  avatar: string
  lastUpdated: string
  currency: string
  language: string
}

// Mentor Dashboard types
export type SubmissionStatus = 'Submitted' | 'Late' | 'Pending'
export type ClassType = 'online' | 'offline'

export interface IMentorStats {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
}

export interface IScheduleItem {
  uid: string
  courseId: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  endTime: string
  location: string
  classType: ClassType
  studentCount: number
}

export interface ISubmissionItem {
  uid: string
  studentName: string
  studentAvatar: string
  courseName: string
  assignmentTitle: string
  submissionDate: string
  status: SubmissionStatus
  daysLate?: number
}

export type CourseLessonType = 'online' | 'offline'

export interface ICourseLessonAttachment {
  id: string
  name: string
  mimeType: string
  size: number
  kind: 'file' | 'image'
  previewUrl?: string
}

export interface ICourseLessonBase {
  id: string
  title: string
  order: number
  type: CourseLessonType
  description?: string
  contentHtml?: string
  embedLinks?: string[]
  attachments?: ICourseLessonAttachment[]
  isComplete?: boolean
}

export interface ICourseLessonOnline extends ICourseLessonBase {
  type: 'online'
  videoUrl?: string
  meetingLink?: string
}

export interface ICourseLessonOffline extends ICourseLessonBase {
  type: 'offline'
  location?: string
  scheduleNote?: string
}

export type ICourseLesson = ICourseLessonOnline | ICourseLessonOffline

export interface ICourseModule {
  id: string
  title: string
  order: number
  maxLessons: number
  lessons: ICourseLesson[]
}

export interface ICourseModulesState {
  version: 2
  modules: ICourseModule[]
}

/** Kursus milik mentor — metadata tampilan editor & daftar (sinkronkan dengan API kursus). */
export interface IMentorCourse {
  uid: string
  title: string
  /** Teks header / subtitle singkat di kartu & editor */
  header: string
  description?: string
  image?: string
  published: boolean
  moduleCount: number
  /** Jumlah pertemuan (untuk dropdown tugas per pertemuan); default dihitung jika tidak ada */
  meetingCount?: number
  studentCount: number
  rating: number
  totalReviews: number
  updatedAt?: string
}

/** Status peserta pada tabel mentor. */
export type MentorCourseStudentStatus = 'Aktif' | 'Selesai' | 'Terlambat' | 'Belum mulai'

/** Baris peserta per kursus — progress & absensi untuk tabel mentor */
export interface IMentorCourseStudent {
  uid: string
  name: string
  email?: string
  avatar?: string
  progressPercent: number
  attendancePresent: number
  attendanceTotal: number
  status: MentorCourseStudentStatus
  lastActiveLabel: string
}

// ─── Mentor attendance (jadwal + sesi per tanggal; sementara client storage) ─

/** Jadwal pertemuan berulang: cocok jika weekday sama dengan hari ini */
export interface IMentorClassScheduleEntry {
  id: string
  courseUid: string
  /** 0 = Minggu … 6 = Sabtu */
  weekday: number
  /** Label tampilan, mis. "09:00" */
  timeLabel: string
}

export type MentorAttendanceApprovalMode = 'review' | 'auto'

/** Status absensi efektif untuk satu siswa pada satu sesi */
export type MentorSessionAttendanceStatus = 'belum' | 'hadir' | 'izin' | 'alpha'

/** Satu baris absensi per siswa dalam sesi (tanggal tertentu) */
export interface IMentorSessionStudentAttendance {
  effective: MentorSessionAttendanceStatus
  /** Permintaan dari siswa yang menunggu persetujuan mentor (mode review) */
  pendingKind: 'hadir' | 'izin' | null
}

export interface IMentorAttendanceSessionState {
  meetingNumber: number
  approvalMode: MentorAttendanceApprovalMode
  byStudent: Record<string, IMentorSessionStudentAttendance>
}

/** Kartu di hub: kursus + slot jadwal untuk hari ini */
export interface IMentorTodayClassCard {
  scheduleId: string
  courseUid: string
  timeLabel: string
  title: string
  header: string
  image?: string
}

// ─── Mentor course assignments (per kursus) ─────────────────────────────────

export type MentorAssignmentLifecycleStatus = 'draft' | 'published' | 'closed'

export interface IMentorCourseAssignment {
  uid: string
  courseId: string
  /** Pertemuan ke-1 … ke-N (N = meetingCount kursus) */
  meetingNumber: number
  title: string
  /** HTML dari editor (atau teks polos lama) */
  description: string
  deadlineAt: string
  status: MentorAssignmentLifecycleStatus
  autoCloseAfterDeadline: boolean
  allowResubmit: boolean
  maxAttempts?: number
  /** Lampiran instruksi mentor (URL aman / signed URL dari API). */
  instructionAttachments?: { fileName: string; url: string; mime?: string }[]
}

export type SubmissionContentBlock =
  | { type: 'text'; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'file'; fileName: string; url: string; mime?: string }
  | { type: 'videoEmbed'; provider: 'youtube' | 'vimeo' | 'other'; embedUrl: string; title?: string }
  | { type: 'link'; url: string; label?: string }

export type MentorSubmissionReviewStatus = 'pending_review' | 'graded' | 'returned'

export interface IMentorAssignmentSubmission {
  uid: string
  assignmentUid: string
  courseId: string
  studentUid: string
  studentName: string
  studentAvatar: string
  submittedAt: string
  attemptNumber: number
  contentBlocks: SubmissionContentBlock[]
  reviewStatus: MentorSubmissionReviewStatus
  rating: number | null
  mentorComment: string | null
  reviewedAt: string | null
}

/** Statistik khusus halaman tugas (tidak harus sama dengan dashboard mentor) */
export interface IMentorAssignmentStats {
  activeAssignments: number
  awaitingReview: number
  dueSoonCount: number
  resubmitAwaitingReview: number
}

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'ok' | 'closed'
