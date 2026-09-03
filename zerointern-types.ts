// types/index.ts
// All TypeScript interfaces for ZeroIntern

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export interface User {
  id: string // UUID from auth.users
  email: string
  name: string | null
  profilePic: string | null
  createdAt: string // ISO timestamp
  updatedAt: string
}

export interface UserProfile extends User {
  tracksEnrolled: string[] // Array of track IDs
}

export interface Admin {
  id: string
  email: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// TRACK & PROJECT TYPES
// ============================================================================

export interface Track {
  id: string // UUID
  title: string // e.g., "Full Stack JavaScript"
  slug: string // e.g., "full-stack-js"
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
  updatedAt: string
}

export interface TrackWithProjects extends Track {
  projects: Project[]
}

export interface Resource {
  title: string
  url: string
  type: 'article' | 'video' | 'docs' | 'tutorial'
}

export interface Project {
  id: string // UUID
  trackId: string
  title: string
  description: string
  brief: string // Markdown content - the client brief
  resources: Resource[]
  concepts: string[] // e.g., ["React", "Node.js", "MongoDB"]
  projectOrder: number // 1-4
  createdAt: string
  updatedAt: string
}

// ============================================================================
// SUBMISSION TYPES
// ============================================================================

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Submission {
  id: string // UUID
  userId: string
  projectId: string
  repoUrl: string // GitHub repo link
  liveUrl: string // Deployed project link
  status: SubmissionStatus
  adminNotes: string | null
  submittedAt: string
  approvedAt: string | null
  rejectedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SubmissionWithDetails extends Submission {
  user: Pick<User, 'name' | 'email'>
  project: Pick<Project, 'title' | 'trackId'>
}

export interface CreateSubmissionRequest {
  projectId: string
  repoUrl: string
  liveUrl: string
}

export interface SubmissionReviewRequest {
  notes?: string
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

export interface Certificate {
  id: string // UUID
  userId: string
  trackId: string
  issuedAt: string
  expiresAt: string | null
  cryptoHash: string // SHA-256 hash
  verificationCode: string // Unique code for verification
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface CertificateVerification {
  valid: boolean
  certificate?: {
    studentName: string
    trackTitle: string
    issuedAt: string
    expiresAt: string | null
    projects: Array<{
      title: string
      repoUrl: string
      liveUrl: string
    }>
  }
  error?: string
}

// ============================================================================
// ENROLLMENT TYPES
// ============================================================================

export interface TrackEnrollment {
  id: string // UUID
  userId: string
  trackId: string
  enrolledAt: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface ApiError {
  error: string
  status: number
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface StudentDashboardData {
  user: UserProfile
  enrolledTracks: TrackWithProgress[]
  recentSubmissions: Submission[]
  certificates: Certificate[]
}

export interface TrackWithProgress extends Track {
  progress: {
    completedProjects: number
    totalProjects: number
    certificateEarned: boolean
  }
  submissions: Submission[]
}

export interface AdminDashboard {
  stats: {
    totalUsers: number
    totalSubmissions: number
    pendingSubmissions: number
    approvedSubmissions: number
    rejectedSubmissions: number
  }
  recentSubmissions: SubmissionWithDetails[]
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface SignUpForm {
  email: string
  name: string
}

export interface SignInForm {
  email: string
}

export interface AdminLoginForm {
  password: string
}

export interface SubmissionForm {
  projectId: string
  repoUrl: string
  liveUrl: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PartialUser = Partial<User>

export type ReadonlyTrack = Readonly<Track>

export interface PageParams {
  params: {
    [key: string]: string
  }
}

export interface SearchParams {
  searchParams: Record<string, string | string[] | undefined>
}

// ============================================================================
// DATABASE QUERY RESPONSE TYPES
// ============================================================================

export interface DatabaseUser {
  id: string
  email: string
  name: string | null
  profile_pic: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseTrack {
  id: string
  title: string
  slug: string
  description: string
  level: string
  created_at: string
  updated_at: string
}

export interface DatabaseProject {
  id: string
  track_id: string
  title: string
  description: string
  brief: string
  resources: Resource[]
  concepts: string[]
  project_order: number
  created_at: string
  updated_at: string
}

export interface DatabaseSubmission {
  id: string
  user_id: string
  project_id: string
  repo_url: string
  live_url: string
  status: string
  admin_notes: string | null
  submitted_at: string
  approved_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseCertificate {
  id: string
  user_id: string
  track_id: string
  issued_at: string
  expires_at: string | null
  crypto_hash: string
  verification_code: string
  download_count: number
  created_at: string
  updated_at: string
}

// ============================================================================
// HELPER TYPE CONVERSIONS
// ============================================================================

export function dbUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    profilePic: dbUser.profile_pic,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  }
}

export function dbProjectToProject(dbProject: DatabaseProject): Project {
  return {
    id: dbProject.id,
    trackId: dbProject.track_id,
    title: dbProject.title,
    description: dbProject.description,
    brief: dbProject.brief,
    resources: dbProject.resources,
    concepts: dbProject.concepts,
    projectOrder: dbProject.project_order,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
  }
}

// ============================================================================
// CONSTANTS FOR STATUS & ENUMS
// ============================================================================

export const SUBMISSION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const RESOURCE_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  DOCS: 'docs',
  TUTORIAL: 'tutorial',
} as const

export const TRACK_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const

export const PROJECT_ORDERS = [1, 2, 3, 4] as const
